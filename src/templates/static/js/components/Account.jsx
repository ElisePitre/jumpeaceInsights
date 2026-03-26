import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { auth } from "../firebase/firebase";
import {
  signOut,
  deleteUser,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      username: "Guest",
      email: "N/A",
      saving: false,
      isGuest: false,

      editOpen: false,
      editField: "",
      editValue: "",
      editPassword: "", // required for email update re-auth

      noticeOpen: false,
      noticeMessage: "",
      noticeType: "success",

      // custom confirm modal
      confirmOpen: false,
      confirmType: "", // "delete" | "logout"
      confirmMessage: "",
      confirming: false,
    };
    this.unsubscribeAuth = null;
    this.noticeTimer = null;
  }

  openConfirm = (type) => {
    const confirmMessage =
      type === "delete"
        ? "Are you sure you want to delete your account?"
        : "Are you sure you want to log out?";

    this.setState({
      confirmOpen: true,
      confirmType: type,
      confirmMessage,
    });
  };

  closeConfirm = () => {
    if (this.state.confirming) return;
    this.setState({
      confirmOpen: false,
      confirmType: "",
      confirmMessage: "",
    });
  };

  runConfirmAction = async () => {
    const { confirmType } = this.state;
    const user = auth.currentUser;
    if (!confirmType || !user) return;

    this.setState({ confirming: true });

    try {
      if (confirmType === "delete") {
        await deleteUser(user);
        this.showNotice("Account deleted successfully.", "success");
      } else {
        await signOut(auth);
        this.showNotice("Logged out successfully.", "success");
      }

      this.setState({ confirmOpen: false, confirmType: "", confirmMessage: "", confirming: false });

      setTimeout(() => {
        window.location.href = "/#/";
      }, 500);
    } catch (error) {
      console.error("Confirm action error:", error);
      this.setState({ confirming: false, confirmOpen: false, confirmType: "", confirmMessage: "" });
      this.showNotice(
        confirmType === "delete"
          ? "An error occurred while deleting your account."
          : "An error occurred while logging out.",
        "error"
      );
    }
  };

  handleDelete = () => {
    this.openConfirm("delete");
  };

  handleLogOut = () => {
    this.openConfirm("logout");
  };

  showNotice = (message, type = "success", timeout = 2200) => {
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.setState({ noticeOpen: true, noticeMessage: message, noticeType: type });
    this.noticeTimer = setTimeout(() => {
      this.setState({ noticeOpen: false, noticeMessage: "" });
    }, timeout);
  };

  getAuthErrorMessage = (error) => {
    const code = error?.code || "";
    if (code === "auth/requires-recent-login") return "Please enter current password and try again.";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") return "Current password is incorrect.";
    if (code === "auth/email-already-in-use") return "That email is already in use.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/operation-not-allowed") return "Email change requires verification. Check your new email inbox.";
    if (code === "auth/network-request-failed") return "Network error. Try again.";
    return `Update failed (${code || "unknown"}).`;
  };

  refreshAuthUser = async (showSuccess = false) => {
    const user = auth.currentUser;
    if (!user) return;

    await user.reload();
    const freshUser = auth.currentUser;
    const isGuest = !!freshUser && (freshUser.isAnonymous || !freshUser.email);

    this.setState({
      user: freshUser,
      username: freshUser?.displayName || "Guest",
      email: freshUser?.email || "N/A",
      isGuest,
    });

    if (showSuccess) {
      this.showNotice("Email verified and updated successfully.", "success", 4500);
    }
  };

  componentDidMount() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const guest = !!user && (user.isAnonymous || !user.email);

      this.setState({
        user,
        username: user?.displayName || "Guest",
        email: user?.email || "N/A",
        isGuest: guest,
      });
    });
    // Remove the verification link check
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
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

  handleGuestToSignin = () => {
 
    const target =   `/` ;

    if (this.props.history?.push) {
      this.props.history.push(target);
    } else {
      window.location.href = `/#${target}`;
    }
  };

  saveInlineEdit = async () => {
    const { editField, editValue, editPassword } = this.state;
    const user = auth.currentUser;

    if (!user) return this.showNotice("No authenticated user found.", "error");

    const nextValue = (editValue || "").trim();
    if (!editField || !nextValue) return this.showNotice("Field cannot be empty.", "error");

    this.setState({ saving: true });

    try {
      if (editField === "username") {
        await updateProfile(user, { displayName: nextValue });
        await user.reload();
        this.setState({
          saving: false,
          editOpen: false,
          editField: "",
          editValue: "",
          editPassword: "",
          username: auth.currentUser?.displayName || "Guest",
        });
        this.showNotice("Username updated successfully.", "success");
        return;
      }

      // email flow - direct update (no verification link)
      if (!editPassword) {
        this.setState({ saving: false });
        return this.showNotice("Enter current password to update email.", "error");
      }

      const credential = EmailAuthProvider.credential(user.email || "", editPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, nextValue);
      await user.reload();

      // Refresh state with new email
      const freshUser = auth.currentUser;
      this.setState({
        saving: false,
        editOpen: false,
        editField: "",
        editValue: "",
        editPassword: "",
        email: freshUser?.email || "N/A",
        username: freshUser?.displayName || "Guest",
      });

      this.showNotice("Email updated successfully.", "success");
    } catch (error) {
      console.error("saveInlineEdit:", error?.code, error?.message);
      this.setState({ saving: false });
      this.showNotice(this.getAuthErrorMessage(error), "error");
    }
  };

  openEdit = (field) => {
    const { username, email } = this.state;
    this.setState({
      editOpen: true,
      editField: field,
      editValue: field === "email" ? (email || "") : (username || ""),
      editPassword: "",
    });
  };

  closeEdit = () => {
    this.setState({
      editOpen: false,
      editField: "",
      editValue: "",
      editPassword: "",
    });
  };

  handleEditValueChange = (e) => {
    this.setState({ editValue: e.target.value });
  };

  render() {
    const {
      user,
      username,
      email,
      saving,
      editOpen,
      editField,
      editValue,
      noticeOpen,
      noticeMessage,
      noticeType,
      confirmOpen,
      confirmMessage,
      confirming,
      editPassword,
    } = this.state;
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
                <div className="account-detail-row">
                  <p><strong>Username:</strong> {username}</p>
                  {!isGuest && (
                    <button
                      className="account-mini-edit-btn"
                      onClick={() => this.openEdit("username")}
                      disabled={saving}
                    >
                      Update
                    </button>
                  )}
                </div>

                <div className="account-detail-row">
                  <p><strong>Email:</strong> {email}</p>
                  {!isGuest && (
                    <button
                      className="account-mini-edit-btn"
                      onClick={() => this.openEdit("email")}
                      disabled={saving}
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>
            </div>

            {editOpen && (
              <div className="account-pop-overlay" onClick={this.closeEdit}>
                <div className="account-pop-bar" onClick={(e) => e.stopPropagation()}>
                  <h4 className="account-pop-title">
                    Update {editField === "username" ? "Username" : "Email"}
                  </h4>
                  <input
                    type={editField === "email" ? "email" : "text"}
                    className="account-input"
                    value={editValue}
                    onChange={this.handleEditValueChange}
                    disabled={saving}
                  />

                  {editField === "email" && (
                    <input
                      type="password"
                      className="account-input"
                      placeholder="Current password"
                      value={editPassword}
                      onChange={(e) => this.setState({ editPassword: e.target.value })}
                      disabled={saving}
                      style={{ marginTop: "10px" }}
                    />
                  )}

                  <div className="account-pop-actions">
                    <button className="account-action-button" onClick={this.saveInlineEdit} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="account-action-button" onClick={this.closeEdit} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {confirmOpen && (
              <div className="account-pop-overlay" onClick={this.closeConfirm}>
                <div className="account-pop-bar account-confirm-bar" onClick={(e) => e.stopPropagation()}>
                  <h4 className="account-pop-title">Confirm action</h4>
                  <p className="account-confirm-text">{confirmMessage}</p>
                  <div className="account-pop-actions">
                    <button className="account-action-button" onClick={this.closeConfirm} disabled={confirming}>
                      Cancel
                    </button>
                    <button className="account-action-button danger-button" onClick={this.runConfirmAction} disabled={confirming}>
                      {confirming ? "Please wait..." : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {noticeOpen && (
              <div className={`account-notice ${noticeType}`}>
                {noticeMessage}
              </div>
            )}

            <div className="account-actions">
              {isGuest ? (
                <>
                  <button
                    className="account-action-button"
                    onClick={this.handleGuestToSignup}
                  >
                    Sign up
                  </button>

                  <button
                    className="account-action-button"
                    onClick={this.handleGuestToSignin}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Account);