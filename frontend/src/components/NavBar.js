import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/Soliat.jpg'; 

const NavBar = () => {
  return (
    <div className="nav-container">
      <div className="logo-title">
        <img src={logo} alt="Soliat FC Logo" className="soliat-logo" />
        <h1>Soliat FC</h1>
      </div>
      <nav className="soliat-navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/league">League Table</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
