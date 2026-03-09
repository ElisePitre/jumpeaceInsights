import React, { Component, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import { Bar } from 'react-chartjs-2';
import WordCloud from "react-wordcloud";
import * as htmlToImage from "html-to-image";

export const chartOptions = {
  responsive: true,
  legend: false,
  scales: {
    yAxes: [{
      ticks: {
        min: 0.5
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

const dev_past_searches = require("../../../public/dummy_data/past-searches.json");
const dev_popular_searches = require("../../../public/dummy_data/popular-searches.json");
const dev_search_results = require("../../../public/dummy_data/search-results.json");

const SEARCH_PARAMS = [
  'search_term',
  'destination_term',
  'start_date',
  'end_date',
];

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search_term: '',
      destination_term: '',
      start_date: new Date(),
      end_date: new Date(),
      error: '',
      loading: false,
      popular_searches: [],
      past_searches: [],
      search_results: {},
      visualizer_mode: 'bar', //bar, map
    };
    this.barChartRef = React.createRef();
    this.wordCloudRef = React.createRef();
  }

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

  componentDidMount() {
    this.getSearches("popular");
    this.getSearches("past");
    this.getQueryFromUrl();
    window.addEventListener('hashchange', this.getQueryFromUrl);
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.getQueryFromUrl);
  }

  devMode = true;
  devData = {
    past_searches: dev_past_searches,
    popular_searches: dev_popular_searches,
    search_results: dev_search_results
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
      if (params.get(param) && params.get(param) !== this.state[param]) {
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
      this.setState({ search_results: this.devData.search_results.results });
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
        this.setState({ search_results: data.results })
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
    return (
      <div className='result-card'>
        <h4 className='searches-header'>Results: {this.state.search_results.search}</h4>
        <div className="form-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <div className='result-card'>
              <h4 className='searches-header'>Top 5 Results</h4>
              <ol className='searches-list'>
                {this.state.search_results.vectors.map((result, index) => (
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
              <div className="form-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <button className='auth-button' onClick={() => this.setState({ visualizer_mode: 'bar' })}>
                    Bar graph
                  </button>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <button className='auth-button' onClick={() => this.setState({ visualizer_mode: 'map' })}>
                    Word web
                  </button>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <button className='auth-button' onClick={() => {
                    if (this.state.visualizer_mode === 'bar') {
                      this.downloadChart();
                    } else {
                      this.downloadMap();
                    }
                  }}>
                    Download
                  </button>
                </div>
              </div>

              <h4 className='searches-header'>Visualizers</h4>
              {this.state.visualizer_mode === 'bar' &&
                <div style={{ height: 250 }}>
                  <Bar ref={this.barChartRef} options={chartOptions} data={this.getBarData()} />
                </div>}
              {this.state.visualizer_mode === 'map' &&
                <div ref={this.wordCloudRef} style={{ height: 250 }}>
                  <WordCloud options={mapOptions.options} words={this.getMapData()} />
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  searchChips = () => {
    return (
      <div>
        {
          Object.keys(this.state.search_results).length !== 0
          && this.state.search_results.search !== ""
          && this.results()
        }
        {
          this.devGlobals.username !== 'guest'
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
                <input
                  type="date"
                  id="start_date"
                  value={this.state.start_date}
                  onChange={(e) => this.setState({ start_date: e.target.value })}
                  disabled={this.state.loading}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <input
                  type="date"
                  id="end_date"
                  value={this.state.end_date}
                  onChange={(e) => this.setState({ end_date: e.target.value })}
                  disabled={this.state.loading}
                />
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

