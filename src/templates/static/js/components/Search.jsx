import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

const dev_past_searches = require("../../../public/dummy_data/past-searches.json");
const dev_popular_searches = require("../../../public/dummy_data/popular-searches.json");
const dev_search_results = require("../../../public/dummy_data/search-results.json");

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
    };
  }

  componentDidMount() {
    this.getSearches("popular");
    this.getSearches("past");
    this.getQuerySearch();
  }

  devMode = true;
  devData = {
    past_searches: dev_past_searches,
    popular_searches: dev_popular_searches,
    search_results: dev_search_results
  }

  getQuerySearch = () => {
    const hash = window.location.hash;
    const queryString = hash.split('?')[1] || '';

    const params = new URLSearchParams(queryString);

    this.setState({
      search_term: params.get('query') ?? ''
    }, () => {
      if (this.state.search_term !== '') {
        this.handleSubmit();
      }
    })
  }

  handleSubmit = async (e) => {
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
              <a href={`/search?query=${encodeURIComponent(search)}`}>
                {search}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  results = () => {
    return (
      <div className='result-card'>
        <h4 className='searches-header'>Results</h4>


      </div>
    )
  }

  searchChips = () => {
    return (
      <div>
        {this.searches('past')}
        {this.searches('popular')}
      </div>
    );
  }

  render() {

    return (
      <div className="page-container">
        <div className="page-card">
          <div className="auth-logo">
            <img src="/public/images/typefaceLogo.png" alt="Tinos logo" />
          </div>

          {/* <NavBar/> */}

          <h2 className="auth-title">Search</h2>

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

