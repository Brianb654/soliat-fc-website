import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import TeamList from './components/TeamList';
import NewsForm from './components/NewsForm';
import NewsList from './components/NewsList';
import './App.css';

// League page component
const LeaguePage = () => (
  <div className="main-content">
    <TeamList />
  </div>
);

// News page component
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

// About page component
const AboutPage = () => (
  <div className="main-content">
    <h2>About Soliat FC</h2>
    <p>
      Soliat FC is a local football club dedicated to nurturing talent
      and bringing the community together through sports.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/league" element={<LeaguePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
