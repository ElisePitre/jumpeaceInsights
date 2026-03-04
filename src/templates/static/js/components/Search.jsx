import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search_term: '',
      destination_term: '',
      start_date: new Date(),
      end_date: new Date(),
      error: '',
      loading: false
    };
  }

  handleSubmit = async (e) => {
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
        window.location.href = '/#/';
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
            <div className="form-group search-box">
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

            <div className="form-group">
              <input
                type="text"
                id="destination_term"
                value={this.state.destination_term}
                onChange={(e) => this.setState({ destination_term: e.target.value })}
                placeholder="Destination term..."
                required
                disabled={this.state.loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={this.state.loading}>
              {this.state.loading ? 'Logging in...' : 'Search'}
            </button>
          </form>

          {/* <div className="auth-links"> */}
          {/*   <Link to="/signup" className="auth-link">Sign up</Link> */}
          {/* </div> */}
        </div>
      </div>
    );
  }
}

