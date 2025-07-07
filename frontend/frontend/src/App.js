import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import TeamList from './components/TeamList';
import NewsForm from './components/NewsForm';
import NewsList from './components/NewsList';
import './App.css';

const Home = () => (
  <div className="home-intro">
    <h2>Welcome to Soliat FC League</h2>
    <p>This is the official Soliat FC League website. Stay updated with the latest news, match results, and league standings.</p>
  </div>
);

const LeaguePage = () => (
  <div className="main-content">
    <TeamList />
  </div>
);

const NewsPage = () => (
  <div className="news-page-container">
    <div className="news-form-wrapper">
      <NewsForm />
    </div>
    <div className="news-list-wrapper">
      <NewsList />
    </div>
  </div>
);

const AboutPage = () => (
  <div className="main-content">
    <h2>About Soliat FC</h2>
    <p>Soliat FC is a local football club dedicated to nurturing talent and bringing the community together through sports.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/league" element={<LeaguePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>

        <footer className="soliat-footer">
          <p>&copy; {new Date().getFullYear()} Soliat FC</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
