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

  // Slide changer
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Typing + deleting logic
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
      }, 1000); // pause at full text
      return () => clearTimeout(timeout);
    }

    if (charIndex === 0 && isDeleting) {
      // Switch text after deleting
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }
  }, [typedText, isDeleting, charIndex, currentTextIndex]);

  // Reset typing when slide changes
  useEffect(() => {
    setTypedText('');
    setCharIndex(0);
    setIsDeleting(false);
    setCurrentTextIndex(0);
  }, [currentSlide]);

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
        <h1>Welcome to Soliat FC</h1>
        <img src={team1} alt="Soliat FC team" />
        <p>
          Soliat Football Club — bringing the community together through football, passion, and talent.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
