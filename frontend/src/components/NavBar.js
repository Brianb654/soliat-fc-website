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

    // ✅ Refresh the page after logout to reset UI
    setTimeout(() => {
      window.location.reload();
    }, 200);
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/league">League Table</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/officials">ASA Officials</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/donate" className="donate-button">Donate</Link></li>

          {canPost && <li><Link to="/post-news">➕ Post News</Link></li>}
          {user?.role === 'admin' && <li><Link to="/admin/dashboard">Dashboard</Link></li>}

          {!user ? (
            <li><Link to="/admin/login">🔐 Login</Link></li>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="logout-button"
                style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
              >
                🚪 Logout
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Hamburger Icon (Mobile) */}
      <div className="hamburger" onClick={toggleMenu}>
        <svg className="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="30" height="30">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
            <li><Link to="/donate" onClick={toggleMenu} className="donate-button">Donate</Link></li>

            {canPost && <li><Link to="/post-news" onClick={toggleMenu}>➕ Post News</Link></li>}
            {user?.role === 'admin' && <li><Link to="/admin/dashboard" onClick={toggleMenu}>Dashboard</Link></li>}

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
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
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
