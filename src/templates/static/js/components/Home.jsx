// This is the login page

import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import {auth} from '../firebase/firebase';
import {signInWithEmailAndPassword,signInAnonymously} from 'firebase/auth';
import {errorMessage} from '../firebase/firebase';
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '', loading: true });

    try {
      await signInWithEmailAndPassword(auth, this.state.email, this.state.password);
      this.props.history.push('/search');
    } catch (err) {
      this.setState({ error: errorMessage(err), loading: false });
      
    }
  }
  handleGuestLogin = async () => {
    this.setState({ error: '', loading: true });

    try {
      const userCredential = await signInAnonymously(auth);
        console.log('Guest user signed in:', userCredential.user);
      this.props.history.push('/search');
    } catch (err) {
      this.setState({ error: errorMessage(err), loading: false });
      alert(err.message);
    }
  };

  render() {
    const { email, password, error, loading } = this.state;
    
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => this.setState({ email: e.target.value })}
              placeholder="Enter your email"
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
            
                <button
              type="button"
              className="auth-button"
              disabled={loading}
              onClick={this.handleGuestLogin}
              style={{ marginTop: '10px' }}
            >
              {loading ? 'Please wait...' : 'Continue as Guest'}
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