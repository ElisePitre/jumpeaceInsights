import { Link, NavLink } from "react-router-dom";

export default function NavBar() {

  return (
    <header className="navbar">
      <Link to="/" className="brand">Medicine4Youth Guelph</Link>

      <nav className="navlinks">
        <NavLink to="/">HOME</NavLink>
        <NavLink to="/about">ABOUT</NavLink>
        <NavLink to="/search">SEARCH</NavLink>
        <NavLink to="/account">ACCOUNT</NavLink>
        <NavLink to="/health">HEALTH</NavLink>
        <NavLink to="/sport">SPORT</NavLink>
        <NavLink to="/beauty">BEAUTY</NavLink>
        <NavLink to="/travel">TRAVEL</NavLink>
        <NavLink to="/law">LAW</NavLink>
        <NavLink to="/hitech">HITECH</NavLink>
        <NavLink to="/showbiz">SHOWBIZ</NavLink>
      </nav>
    </header>
  );
}
