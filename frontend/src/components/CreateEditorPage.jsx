import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../assets/Soliat.jpg';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) setUser(storedUser);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
    setTimeout(() => window.location.reload(), 200);
  };

  const canPost = user?.role === 'admin' || user?.role === 'editor';

  return (
    <div className="nav-container">
      <div className="logo-title">
        <img src={logo} alt="Soliat FC Logo" className="soliat-logo" />
        <h1>Soliat FC</h1>
      </div>

      {/* Desktop Navbar */}
      <nav className="soliat-navbar">
        <ul>
          {/* 📌 Main Pages */}
          <li><Link to="/">🏠 Home</Link></li>
          <li><Link to="/league">📊 League</Link></li>
          <li><Link to="/news">📰 News</Link></li>
          <li><Link to="/officials">👔 Officials</Link></li>
          <li><Link to="/about">ℹ️ About</Link></li>

          {/* ❤️ Support */}
          <li><Link to="/donate" className="donate-button">❤️ Donate</Link></li>

          {/* 🛠️ Tools */}
          {canPost && <li><Link to="/post-news">✍️ Post News</Link></li>}
          {user?.role === 'admin' && <li><Link to="/admin/dashboard">🛠️ Dashboard</Link></li>}

          {/* 🔐 Auth */}
          {!user ? (
            <li><Link to="/admin/login">🔐 Login</Link></li>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                🚪 Logout
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Hamburger for Mobile */}
      <div className="hamburger" onClick={toggleMenu}>
        <svg className="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="30" height="30">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <nav className="dropdown-menu">
          <ul>
            {/* 📌 Main Pages */}
            <li><Link to="/" onClick={toggleMenu}>🏠 Home</Link></li>
            <li><Link to="/league" onClick={toggleMenu}>📊 League</Link></li>
            <li><Link to="/news" onClick={toggleMenu}>📰 News</Link></li>
            <li><Link to="/officials" onClick={toggleMenu}>👔 Officials</Link></li>
            <li><Link to="/about" onClick={toggleMenu}>ℹ️ About</Link></li>

            {/* ❤️ Support */}
            <li><Link to="/donate" onClick={toggleMenu} className="donate-button">❤️ Donate</Link></li>

            {/* 🛠️ Tools */}
            {canPost && <li><Link to="/post-news" onClick={toggleMenu}>✍️ Post News</Link></li>}
            {user?.role === 'admin' && <li><Link to="/admin/dashboard" onClick={toggleMenu}>🛠️ Dashboard</Link></li>}

            {/* 🔐 Auth */}
            {!user ? (
              <li><Link to="/admin/login" onClick={toggleMenu}>🔐 Login</Link></li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                  className="logout-button"
                >
                  🚪 Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default NavBar;
