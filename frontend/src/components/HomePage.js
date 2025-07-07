import React, { useState, useEffect } from 'react';
import './HomePage.css';
import team1 from '../assets/team1.jpg';
import team2 from '../assets/team2.jpg';
import team3 from '../assets/team3.jpg';

const images = [team1, team2, team3];
const texts = ['Soliat Football Club', 'The Tigers'];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const fullText = texts[currentTextIndex];
    const speed = isDeleting ? 70 : 120;

    if (!isDeleting && charIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, speed);
      return () => clearTimeout(timeout);
    }

    if (charIndex === fullText.length && !isDeleting) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }

    if (charIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }
  }, [typedText, isDeleting, charIndex, currentTextIndex]);

  return (
    <div className="home-container">
      <div className="slider">
        <div
          className="slider-wrapper"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((img, index) => (
            <div className="slide" key={index}>
              <img src={img} alt={`Slide ${index + 1}`} className="slider-image" />
              <div className="slider-overlay"></div>
            </div>
          ))}
        </div>

        <div className="slider-text">
          <h1>{typedText}</h1>
          <button className="contact-button">Contact Us</button>
        </div>
      </div>

      <div className="welcome-card">
        <h2>Welcome to Soliat FC</h2>
        <img src={team1} alt="Soliat FC team" className="welcome-image" />
        <p>
          Soliat Football Club — bringing the community together through football, passion, and talent.
          Based in Ainabkoi, we compete in local and regional leagues, focusing on teamwork,
          discipline, and excellence on and off the pitch.
        </p>
      </div>

<div className="two-column">
  <div className="info-card">
    <h2>🌟 Our Vision</h2>
    <p>
      To become a leading football club in the region, known for producing top talent,
      promoting sportsmanship, and strengthening our community through football.
    </p>
  </div>
  <div className="info-card">
    <h2>🌟 Our Mission</h2>
    <p>
      Develop and support players of all ages. Compete at the highest level with integrity
      and respect. Promote positive values through sport. Engage and uplift our community
      through football initiatives.
    </p>
  </div>
</div>


      <div className="info-card full-width">
        <h2>🌟 Get Involved</h2>
        <p>
          ✅ Join Soliat FC as a player.<br />
          ✅ Support the team at matches.<br />
          ✅ Become a sponsor or partner.<br />
          ✅ Follow us on social media for updates!
        </p>
      </div>
    </div>
  );
};

export default HomePage;
