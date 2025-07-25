import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// 🔷 UI Components
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// 📄 Pages
import HomePage from './components/HomePage';
import About from './components/About';
import TeamList from './components/TeamList';
import NewsList from './components/NewsList';

// 📰 Admin/Editor Pages
import NewsForm from './components/NewsForm';
import ManageNews from './components/ManageNews'; // ✅ Make sure this import exists
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import EditorDashboard from './components/EditorDashboard';
import AdminUsers from './components/AdminUsers';
import CreateEditorPage from './components/CreateEditorPage';
import UpdateLeagueTable from './components/UpdateLeagueTable';

import './App.css';

// ✅ Public Page Wrappers
const LeaguePage = () => (
  <div className="main-content">
    <TeamList />
  </div>
);

const NewsPage = () => (
  <div className="news-page-container">
    <div className="news-list-wrapper">
      <NewsList />
    </div>
  </div>
);

// 🔐 Protected Route Logic
const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && allowedRoles.includes(userInfo.role)) {
      setIsAllowed(true);
    } else {
      navigate('/admin/login');
    }
    setLoading(false);
  }, [navigate, allowedRoles]);

  if (loading) return null;
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
          {/* 🌍 Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/league" element={<LeaguePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<About />} />

          {/* 🔒 Admin Only */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-editor"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateEditorPage />
              </ProtectedRoute>
            }
          />

          {/* 🔒 Shared: Admin + Editor */}
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <ManageNews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/post-news"
            element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <NewsForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/table"
            element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <UpdateLeagueTable />
              </ProtectedRoute>
            }
          />

          {/* 🔒 Editor Only */}
          <Route
            path="/admin/editor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['editor']}>
                <EditorDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🧑‍💼 Auth */}
          <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
