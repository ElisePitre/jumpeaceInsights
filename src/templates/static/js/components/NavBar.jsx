import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="jp-navbar">
      <div className="jp-navbar-top">
        <div className="jp-navbar-spacer"></div>

        {/* <Link to="/" className="jp-navbar-title"> */}
        {/*   Jumpeace Insights */}
        {/* </Link> */}
        <div className="auth-logo">
          <img src="/public/images/typefaceLogo.png" alt="Tinos logo" />
        </div>

        <div className="jp-navbar-profile">
          <Link to="/account" className="jp-profile-link" aria-label="Account page">
            <div className="jp-profile-circle">
              <div className="jp-profile-head"></div>
              <div className="jp-profile-body"></div>
            </div>
          </Link>
        </div>
      </div>

      <div className="jp-navbar-bottom">
        <NavLink exact to="/search" activeClassName="jp-active-link" className="jp-nav-link">
          SEARCH
        </NavLink>
        <NavLink to="/about" activeClassName="jp-active-link" className="jp-nav-link">
          ABOUT
        </NavLink>
        <NavLink to="/help" activeClassName="jp-active-link" className="jp-nav-link">
          HELP
        </NavLink>
      </div>
    </header>
  );
}
