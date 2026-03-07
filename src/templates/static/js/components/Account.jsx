import React, { Component } from "react";
import NavBar from "./NavBar";

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "Username",
      email: "email@example.com"
    };
  }

  handleDelete = () => {
    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (confirmed) {
      console.log("Delete account clicked");
    }
  };

  handleLogOut = () => {
    console.log("Log out clicked");
  };

  render() {
    const { username, email } = this.state;

    return (
      <div className="page-shell">
        <div className="page-card account-page-card">
          <NavBar isLoggedIn={true} />

          <div className="account-content">
            <div className="account-back-button">◀</div>

            <div className="account-profile-section">
              <div className="account-avatar">
                <span className="account-avatar-icon">👤</span>
              </div>

              <div className="account-details">
                <p><strong>Username:</strong> {username}</p>
                <p><strong>Email:</strong> {email}</p>
              </div>
            </div>

            <div className="account-actions">
              <button className="account-action-button danger-button" onClick={this.handleDelete}>
                Delete account
              </button>

              <button className="account-action-button" onClick={this.handleLogOut}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}