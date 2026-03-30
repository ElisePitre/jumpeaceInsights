import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="jp-navbar">
      <div className="jp-navbar-row">
        <div className="jp-navbar-logo">
          <Link to="/search">
            <img src="/public/images/typefaceLogo.png" alt="Tinos logo" />
          </Link>
        </div>

        <nav className="jp-navbar-links">
          <NavLink exact to="/search" activeClassName="jp-active-link" className="jp-nav-link">
            SEARCH
          </NavLink>
          <NavLink to="/about" activeClassName="jp-active-link" className="jp-nav-link">
            ABOUT
          </NavLink>
          <NavLink to="/help" activeClassName="jp-active-link" className="jp-nav-link">
            HELP
          </NavLink>
        </nav>

        <div className="jp-navbar-profile">
          <Link to="/account" className="jp-profile-link" aria-label="Account page">
            <div className="jp-profile-circle">
              <div className="jp-profile-head"></div>
              <div className="jp-profile-body"></div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
