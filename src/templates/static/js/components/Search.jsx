import React, { Component, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import { Bar, Line } from 'react-chartjs-2';
import WordCloud from "react-wordcloud";
import * as htmlToImage from "html-to-image";
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
export const chartOptions = {
  responsive: true,
  legend: false,
  scales: {
    yAxes: [{
      ticks: { min: 0.5 },
      scaleLabel: {
        display: true,
        labelString: 'Closeness to search term',
        fontStyle: 'bold'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Related terms',
        fontStyle: 'bold'
      }
    }]
  }
};
export const mapOptions = {
  options: {
    rotations: 2,
    rotationAngles: [-90, 0],
    enableTooltip: true,
    fontFamily: "montserrat",
    fontSizes: [20, 30],
    fontWeight: "bold",
  },
  size: [10, 50],
};
export const decadeComparisonOptions = {
  responsive: true,
  legend: false,
  scales: {
    yAxes: [{
      ticks: { min: 0, max: 1 },
      scaleLabel: {
        display: true,
        labelString: 'Closeness of terms',
        fontStyle: 'bold'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Decade',
        fontStyle: 'bold'
      }
    }]
  }
};

const DECADES = [
  "1770s", "1780s", "1790s", "1800s", "1810s", "1820s", "1830s",
  "1840s", "1850s", "1860s", "1870s", "1880s", "1890s", "1900s",
  "1910s", "1920s", "1930s", "1940s", "1950s", "1960s",
];

const dev_past_searches = require("../../../public/dummy_data/past-searches.json");
const dev_popular_searches = require("../../../public/dummy_data/popular-searches.json");
const dev_search_results = require("../../../public/dummy_data/search-results.json");
const dev_decade_comparison_results = require("../../../public/dummy_data/decade-comparison-results.json");

const SEARCH_PARAMS = [
  'search_term',
  'destination_term',
  'start_date',
  'end_date',
];

export default class Search extends Component {
  constructor(props) {
    super(props);
    const user = auth.currentUser;
    this.state = {
      search_term: '',
      destination_term: '',
      start_date: DECADES[0],
      end_date: DECADES[DECADES.length - 1],
      error: '',
      loading: false,
      popular_searches: [],
      past_searches: [],
      search_results: {},
      decade_comparison_results: {},
      visualizer_mode: 'bar',
      isGuest: !user || !!user.isAnonymous,
    };
    this.barChartRef = React.createRef();
    this.wordCloudRef = React.createRef();
    this.decadeComparisonRef = React.createRef();
    this.authUnsubscribe = null;
  }

  isGuestUser = (user) => !user || !!user.isAnonymous;

  getBarData() {
    const sr = this.state.search_results;
    if (!sr?.vectors) return { labels: [], datasets: [] };
    return {
      labels: sr.vectors.map(v => v.word),
      datasets: [{ label: sr.search, data: sr.vectors.map(v => v.vector), backgroundColor: 'rgba(12,23,54,1)' }],
    };
  }
  getMapData() {
    const sr = this.state.search_results;
    if (!sr?.vectors) return [];
    return sr.vectors.map(v => {
      return {
        text: v.word,
        value: v.vector,
      }
    });
  }
  // New feature: decade comparison -- Added by Elise
  getDecadeComparisionData(){
    const sr = this.state.search_results;
    const dcr = this.state.decade_comparison_results;
    const decadeResults = Array.isArray(dcr?.results)
      ? dcr.results
      : Array.isArray(sr?.results)
        ? sr.results
        : Array.isArray(sr?.decade_comparison)
          ? sr.decade_comparison
        : [];

    if (decadeResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const parsedResults = decadeResults
      .map((item) => ({
        decade: String(item?.decade ?? ''),
        similarity: Number(item?.similarity)
      }))
      .filter((item) => item.decade !== '' && !Number.isNaN(item.similarity));

    parsedResults.sort((a, b) => {
      const aNum = parseInt(a.decade.replace(/\D/g, ''), 10);
      const bNum = parseInt(b.decade.replace(/\D/g, ''), 10);
      if (Number.isNaN(aNum) || Number.isNaN(bNum)) return a.decade.localeCompare(b.decade);
      return aNum - bNum;
    });

    return {
      labels: parsedResults.map((item) => item.decade),
      datasets: [{
        label: `${dcr.term_a || sr.term_a || this.state.search_term} vs ${dcr.term_b || sr.term_b || this.state.destination_term}`,
        data: parsedResults.map((item) => item.similarity),
        borderColor: 'rgba(12,23,54,1)',
        backgroundColor: 'rgba(12,23,54,0.2)',
        fill: false,
        lineTension: 0.1,
      }],
    };
  }

  downloadChart() {
    if (!this.barChartRef.current) return;
    const chart = this.barChartRef.current.chartInstance; // Chart.js v2
    const image = chart.toBase64Image();

    const link = document.createElement('a');
    link.href = image;
    link.download = this.state.search_results.search + '-bar-graph.png';
    link.click();
  }
  downloadMap() {
    if (!this.wordCloudRef.current) return;

    htmlToImage.toPng(this.wordCloudRef.current, {
      pixelRatio: 2,
      backgroundColor: '#fff', // optional
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
    link.download = this.state.search_results.search + '-word-web.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error(err));
    // htmlToImage.toSvg(this.wordCloudRef.current).then((dataUrl) => {
    //   const link = document.createElement('a');
    //   link.href = dataUrl;
    //   link.download = this.state.search_results.search + '-word-web.png';
    //   link.click();
    // });
  }
  // New feature: decade comparison -- Added by Elise
  downloadDecadeComparison() {
    if (!this.decadeComparisonRef.current) return;

    htmlToImage.toPng(this.decadeComparisonRef.current, {
      pixelRatio: 2,
      backgroundColor: '#fff',
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        const fileNameBase = this.state.search_results.search || this.state.search_results.term_a || this.state.search_term;
        link.download = fileNameBase + '-decade-comparison.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error(err));
  }

   componentDidMount() {
    this.getSearches("popular");
    this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
      const isGuest = this.isGuestUser(user);

      this.setState({ isGuest }, () => {
        if (isGuest) {
          this.setState({ past_searches: [] });
        } else {
          this.getSearches("past");
        }
      });
    });

    this.getQueryFromUrl();
    window.addEventListener('hashchange', this.getQueryFromUrl);
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.getQueryFromUrl);
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  devMode = true;
  devData = {
    past_searches: dev_past_searches,
    popular_searches: dev_popular_searches,
    search_results: dev_search_results,
    decade_comparison_results: dev_decade_comparison_results
  }
  devGlobals = {
    username: 'test-user',
  }

  getQueryFromUrl = () => {
    const hash = window.location.hash;
    const queryString = hash.split('?')[1] || '';

    const params = new URLSearchParams(queryString);

    let search = false;
    SEARCH_PARAMS.forEach((param, index) => {
      console.log(params.get(param), index);
      if (params.get(param) !== this.state[param]) {
        this.setState({
          [param]: params.get(param) ?? ''
        }, () => {
          if (this.state[param] !== '') {
              search = true;
          }
        })
      }
    })
    if (search) {
      console.log('search');
      this.handleSubmit();
    }else {
      this.setState({ search_results: {}, decade_comparison_results: {} });
    }
  }

  updateQueryInUrl = () => {
    const hash = window.location.hash.split('?')[0]; // "#/search"

    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');

    SEARCH_PARAMS.forEach((param) => {
      if (!params.get(param) || params.get(param) !== this.state[param]) {
        params.set(param, this.state[param]);
      }
    })

    const newHash = `${hash}?${params.toString()}`;

    window.history.replaceState(null, '', newHash);
  };

  handleSubmit = async (e) => {
    if (e) {
      this.updateQueryInUrl();
    }

    if (this.devMode) {
      this.setState({
        search_results: this.devData.search_results.results,
        decade_comparison_results: this.state.destination_term.trim() !== ''
          ? this.devData.decade_comparison_results
          : {}
      });
      return;
    }

    e.preventDefault();
    this.setState({ error: '', loading: true });

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_term: this.state.search_term,
          destination_term: this.state.destination_term,
          start_date: this.state.start_date,
          end_date: this.state.end_date,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setState({
          search_results: data.results,
          decade_comparison_results: data.decade_comparison_results || data.decadeComparisonResults || {}
        })
      } else {

        this.setState({
          error: data.message || 'Search failed. Please try again.',
          loading: false
        });
      }
    } catch (err) {
      this.setState({
        error: 'Network error. Please try again later.',
        loading: false
      });
    }
  }

  searchesMap = {
    popular: {
      title: "Popular",
      apiCall: "getPopularSearches"
    },
    past: {
      title: "Past",
      apiCall: "getPastSearches"
    },
  }
  getSearches = async (type) => {
    if (this.devMode) {
      this.setState({ [type + "_searches"]: this.devData[type + "_searches"].searches });
      return;
    }

    try {
      const response = await fetch('/api/' + this.searchesMap[type].apiCall, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setState({ [type + "_searches"]: data.searches })
      } else {

        this.setState({
          error: data.message || 'Failed to get popular searches.',
          loading: false
        });
      }
    } catch (err) {
      this.setState({
        error: 'Network error. Please try again later.',
        loading: false
      });
    }
  }

  searches = (type) => {
    const title = this.searchesMap[type].title + " Searches";
    return (
      <div className="result-card">
        <h4 className="searches-header">{title}</h4>

        <ul className="searches-list">
          {this.state[type + "_searches"].map((search, index) => (
            <li key={index}>
              <Link to={`/search?search_term=${encodeURIComponent(search)}`}>
                {search}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  results = () => {
    const hasDestinationTerm = this.state.destination_term.trim() !== '';
    const decadeData = this.getDecadeComparisionData();
    const hasDecadeData = decadeData.labels.length > 0;
    const hasVectorData = Array.isArray(this.state.search_results.vectors) && this.state.search_results.vectors.length > 0;
    const resultTitle = this.state.search_results.search || this.state.search_results.term_a || this.state.search_term;
    return (
      <div className='result-card'>
        <h4 className='searches-header'>Results: {resultTitle}</h4>
        <div className="form-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <div className='result-card'>
              <h4 className='searches-header'>Top 5 Results</h4>
              <ol className='searches-list'>
                {(this.state.search_results.vectors || []).slice(0, 5).map((result, index) => (
                  <li key={index}>
                    <Link to={`/search?search_term=${encodeURIComponent(result.word)}`}>
                      {result.word}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <div className='result-card'>
              <div className="form-row visualizer-buttons-container" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <button className='auth-button' onClick={() => this.setState({ visualizer_mode: 'bar' })} disabled={!hasVectorData}>
                    Bar graph
                  </button>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <button className='auth-button' onClick={() => this.setState({ visualizer_mode: 'map' })} disabled={!hasVectorData}>
                    Word web
                  </button>
                </div>
                {hasDestinationTerm && hasDecadeData &&
                  <div className="form-group" style={{ flex: 1 }}>
                    <button className='auth-button' onClick={() => this.setState({ visualizer_mode: 'decade-comparison' })}>
                      Decade comparison
                    </button>
                  </div>
                }

                {/* Hide Download button for guest users */}
                {!this.state.isGuest && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <button className='auth-button' onClick={() => {
                      if (this.state.visualizer_mode === 'bar') {
                        this.downloadChart();
                      } else if (this.state.visualizer_mode === 'decade-comparison') {
                        this.downloadDecadeComparison();
                      } else {
                        this.downloadMap();
                      }
                    }}>
                      Download
                    </button>
                  </div>
                )}
              </div>

              <h4 className='searches-header'>Visualizers</h4>
              {this.state.visualizer_mode === 'bar' && hasVectorData &&
                <div style={{ height: 250 }}>
                  <Bar ref={this.barChartRef} options={chartOptions} data={this.getBarData()} />
                </div>}
              {this.state.visualizer_mode === 'map' && hasVectorData &&
                <div ref={this.wordCloudRef} style={{ height: 250 }}>
                  <WordCloud options={mapOptions.options} words={this.getMapData()} />
                </div>
              }
              {this.state.visualizer_mode === 'decade-comparison' && hasDestinationTerm && hasDecadeData &&
                <div ref={this.decadeComparisonRef} style={{ height: 250 }}>
                  <Line options={decadeComparisonOptions} data={decadeData} />
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  searchChips = () => {
    const resultTitle = this.state.search_results.search || this.state.search_results.term_a || '';
    return (
      <div>
        {
          Object.keys(this.state.search_results).length !== 0
          && resultTitle !== ""
          && this.results()
        }
        {
          !this.state.isGuest
          && this.state.past_searches.length !== 0
          && this.searches('past')
        }
        {this.searches('popular')}
      </div>
    );
  }

  render() {

    return (
      <div className="page-container">
        <div className="page-card">
          {/* <div className="auth-logo"> */}
          {/*   <img src="/public/images/typefaceLogo.png" alt="Tinos logo" /> */}
          {/* </div> */}

          <NavBar />

          <h2 className="page-title">Search</h2>

          {this.state.error && <div className="auth-error">{this.state.error}</div>}

          <form onSubmit={this.handleSubmit} className="auth-form">
            {/* First row: search input */}
            <div className="form-row">
              <div className="form-group search-box" style={{ flex: 1 }}>
                <input
                  type="text"
                  id="search_term"
                  value={this.state.search_term}
                  onChange={(e) => this.setState({ search_term: e.target.value })}
                  placeholder="Enter your search..."
                  required
                  disabled={this.state.loading}
                />
                <button
                  type="submit"
                  className="search-button"
                  disabled={this.state.loading}
                >
                  <img src="/public/images/magnifyingGlass.png" alt="Search" />
                </button>
              </div>
            </div>

            {/* Second row: start_date | end_date | destination_term */}
            <div className="form-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <select
                  id="start_date"
                  value={this.state.start_date}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    const startIdx = DECADES.indexOf(newStart);
                    const endIdx = DECADES.indexOf(this.state.end_date);
                    if (endIdx < startIdx) {
                      this.setState({ start_date: newStart, end_date: newStart });
                    } else {
                      this.setState({ start_date: newStart });
                    }
                  }}
                  disabled={this.state.loading}
                >
                  {DECADES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <select
                  id="end_date"
                  value={this.state.end_date}
                  onChange={(e) => this.setState({ end_date: e.target.value })}
                  disabled={this.state.loading}
                >
                  {DECADES.filter((d) => DECADES.indexOf(d) >= DECADES.indexOf(this.state.start_date)).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <input
                  type="text"
                  id="destination_term"
                  value={this.state.destination_term}
                  onChange={(e) => this.setState({ destination_term: e.target.value })}
                  placeholder="Destination term..."
                  disabled={this.state.loading}
                />
              </div>
            </div>

            {/* Submit button */}
            <div style={{ marginTop: '10px' }}>
              <button type="submit" className="auth-button" disabled={this.state.loading}>
                {this.state.loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          <this.searchChips />

        </div >
      </div >
    );
  }
}