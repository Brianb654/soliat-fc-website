import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import TeamList from './components/TeamList';
import NewsForm from './components/NewsForm';
import NewsList from './components/NewsList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import CreateEditorPage from './components/CreateEditorPage';
import About from './components/About'; // ✅ Properly used now
import './App.css';

// League page
const LeaguePage = () => (
  <div className="main-content">
    <TeamList />
  </div>
);

// ✅ News page – Only show news list to public
const NewsPage = () => (
  <div className="news-page-container">
    <div className="news-list-wrapper">
      <NewsList />
    </div>
  </div>
);

// 🔐 Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && allowedRoles.includes(userInfo.role)) {
      setIsAllowed(true);
    } else {
      navigate('/admin/login');
    }
  }, [navigate, allowedRoles]);

  return isAllowed ? children : null;
};

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <NavBar user={user} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/league" element={<LeaguePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
          <Route path="/admin/users" element={<AdminUsers />} />

          {/* 🔐 Admin-only dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🔐 Admin-only: Create new editor */}
          <Route
            path="/admin/create-editor"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateEditorPage />
              </ProtectedRoute>
            }
          />

          {/* 🔐 Admin/editor-only Post News */}
          <Route
            path="/post-news"
            element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <NewsForm />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
