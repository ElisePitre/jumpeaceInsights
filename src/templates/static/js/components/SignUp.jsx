import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      loading: false
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });

    // Validation
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }

    if (this.state.password.length < 8) {
      this.setState({ error: 'Password must be at least 8 characters long' });
      return;
    }

    this.setState({ loading: true });

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.state.username,
          email: this.state.email,
          password: this.state.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        window.location.href = '/#/search';
      } else {
        this.setState({ 
          error: data.message || 'Sign up failed. Please try again.',
          loading: false
        });
      }
    } catch (err) {
      // Ignore error for now and go to search page
      window.location.href = '/#/search';
      // this.setState({ 
      //   error: 'Network error. Please try again later.',
      //   loading: false
      // });
    }
  }

  render() {
    const { username, email, password, confirmPassword, error, loading } = this.state;
    
    return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/public/images/typefaceLogo.png" alt="Tinos logo" />
        </div>
        
        <h2 className="auth-title">Sign up</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={this.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Enter a username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={this.handleChange}
              placeholder="Username"
              required
              disabled={loading}
              minLength="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Enter E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={this.handleChange}
              placeholder="email@example.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Enter a password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              placeholder="Password"
              required
              disabled={loading}
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={this.handleChange}
              placeholder="Confirm password"
              required
              disabled={loading}
              minLength="8"
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Enter'}
          </button>
        </form>
        
        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
    );
  }
}