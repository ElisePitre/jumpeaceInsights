import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import {auth} from '../firebase/firebase';
import {createUserWithEmailAndPassword,linkWithCredential,updateProfile} from 'firebase/auth';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {EmailAuthProvider} from 'firebase/auth';

import {errorMessage} from '../firebase/firebase';
class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      uid:'',
      error: '',
      loading: false
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const uidFromUrl = params.get('guestUid') || params.get('uid') || '';
    if (uidFromUrl) {
      this.setState({ uid: uidFromUrl });
    }
    console.log('Extracted UID from URL:', uidFromUrl);
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
      if (this.state.uid!='') {
        // If there's a guest UID, we need to link the anonymous account to the new email/password account
        const credential = EmailAuthProvider.credential(this.state.email, this.state.password);
        await linkWithCredential(auth.currentUser, credential);
        await updateProfile(auth.currentUser, { displayName: this.state.username });
       
      } else {
        // No guest UID, just create a new account  
      const userCredential = await createUserWithEmailAndPassword(auth, this.state.email, this.state.password);
      await updateProfile(userCredential.user, { displayName: this.state.username });}
      this.props.history.push('/search');
    } catch (err) {
      this.setState({ error: errorMessage(err), loading: false });
      console.error('Error during sign up:', err);

  
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

export default withRouter(SignUp);