// This is the login page

import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      loading: false
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '', loading: true });

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: this.state.username, 
          password: this.state.password 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.props.history.push('/search');
      } else {
        this.setState({ 
          error: data.message || 'Login failed. Please try again.',
          loading: false
        });
      }
    } catch (err) {
      // Ignore error for now and go to search page
      this.props.history.push('/search');

      // this.setState({ 
      //   error: 'Network error. Please try again later.',
      //   loading: false
      // });
    }
  }

  render() {
    const { username, password, error, loading } = this.state;
    
    return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/public/images/typefaceLogo.png" alt="Tinos logo" />
        </div>
        
        <h2 className="auth-title">Login</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={this.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => this.setState({ username: e.target.value })}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => this.setState({ password: e.target.value })}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
    );
  }
}

export default withRouter(Login);