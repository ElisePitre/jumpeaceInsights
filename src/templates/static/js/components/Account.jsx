import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { auth } from "../firebase/firebase";
import {
  signOut,
  deleteUser,
  updateEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      username: "Guest",
      email: "N/A",
      newUsername: "",
      newEmail: "",
      saving: false,
      isGuest: false,
    };
    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const guest = !!user && (user.isAnonymous || !user.email);

      this.setState({
        user,
        username: user?.displayName || "Guest",
        email: user?.email || "N/A",
        newUsername: user?.displayName || "",
        newEmail: user?.email || "",
        isGuest: guest,
      });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
  }

  handleGuestToSignup = () => {
    const { user } = this.state;
    if (!user) return;

    const target = `/signup?guestUid=${encodeURIComponent(user.uid)}`;

    if (this.props.history && this.props.history.push) {
      this.props.history.push(target);
    } else {
      window.location.href = `/#${target}`;
    }
  };

  handleUpdateAccount = async () => {
    const user = auth.currentUser;
    const { newUsername, newEmail } = this.state;

    if (!user) {
      window.alert("No authenticated user found.");
      return;
    }

    if (user.isAnonymous) {
      window.alert("Guest users cannot update email/username.");
      return;
    }

    this.setState({ saving: true });

    try {
      if (newUsername && newUsername !== user.displayName) {
        await updateProfile(user, { displayName: newUsername });
      }

      if (newEmail && newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }

      this.setState({
        username: auth.currentUser?.displayName || newUsername || "Guest",
        email: auth.currentUser?.email || newEmail || "N/A",
        saving: false,
      });

      window.alert("Account updated successfully.");
    } catch (error) {
      this.setState({ saving: false });
      console.error("Error updating account:", error);
      window.alert(
        error?.code === "auth/requires-recent-login"
          ? "Please log out and log in again, then retry updating your email."
          : "Failed to update account."
      );
    }
  };

  handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (confirmed) {
      window.alert("Your account has been deleted successfully.");
      deleteUser(auth.currentUser)
        .then(() => {
          console.log("User deleted successfully");
          setTimeout(() => {
            window.location.href = "/#/";
          }, 300);
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          window.alert("An error occurred while deleting your account. Please try again.");
        });
    }
  };

  handleLogOut = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (confirmed) {
      window.alert("You have been logged out successfully.");
      signOut(auth)
        .then(() => {
          console.log("User signed out successfully");
          setTimeout(() => {
            window.location.href = "/#/";
          }, 300);
        })
        .catch((error) => {
          console.error("Error signing out:", error);
          window.alert("An error occurred while logging out. Please try again.");
        });
    }
  };

  render() {
    const { user, username, email, newUsername, newEmail, saving } = this.state;
    const isGuest = !!user && (user.isAnonymous || !user.email);

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
                <p>
                  <strong>Username:</strong> {username}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
              </div>
            </div>

            <div className="account-actions">
              {!isGuest && (
                <>
                  <input
                    type="text"
                    placeholder="New username"
                    value={newUsername}
                    onChange={(e) => this.setState({ newUsername: e.target.value })}
                    className="account-input"
                    disabled={saving}
                  />

                  <input
                    type="email"
                    placeholder="New email"
                    value={newEmail}
                    onChange={(e) => this.setState({ newEmail: e.target.value })}
                    className="account-input"
                    disabled={saving}
                  />

                  <button
                    className="account-action-button"
                    onClick={this.handleUpdateAccount}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Update account"}
                  </button>
                </>
              )}

              {isGuest && (
                <button
                  className="account-action-button"
                  onClick={this.handleGuestToSignup}
                >
                  Sign up
                </button>
              )}

              <button
                className="account-action-button danger-button"
                onClick={this.handleDelete}
              >
                Delete account
              </button>

              <button
                className="account-action-button"
                onClick={this.handleLogOut}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Account);