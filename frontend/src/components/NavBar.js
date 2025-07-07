import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/Soliat.jpg';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="nav-container">
      <div className="logo-title">
        <img src={logo} alt="Soliat FC Logo" className="soliat-logo" />
        <h1>Soliat FC</h1>
      </div>

      {/* Desktop Navbar */}
      <nav className="soliat-navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/league">League Table</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/officials">ASA Officials</Link></li>
          <li><Link to="/about">About</Link></li>
          <li>
            <Link to="/donate" className="donate-button">Donate</Link>
          </li>
        </ul>
      </nav>

      {/* Hamburger icon (mobile toggle) */}
      <div className="hamburger" onClick={toggleMenu}>
        <svg
          className="hamburger-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="30"
          height="30"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <nav className="dropdown-menu">
          <ul>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/league" onClick={toggleMenu}>League Table</Link></li>
            <li><Link to="/news" onClick={toggleMenu}>News</Link></li>
            <li><Link to="/officials" onClick={toggleMenu}>ASA Officials</Link></li>
            <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
            <li>
              <Link to="/donate" className="donate-button" onClick={toggleMenu}>
                Donate
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default NavBar;
