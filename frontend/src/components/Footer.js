import React from 'react';
import './Footer.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Font Awesome

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2025 Soliat Football Club. WebDev Brian Bett.</p>
      
      <div className="social-icons">
        <a href="https://facebook.com/soliatfc" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://wa.me/yourwhatsapplink" target="_blank" rel="noreferrer">
          <i className="fab fa-whatsapp"></i>
        </a>

        <a href="https://instagram.com/soliatfc" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://youtube.com/@soliatfc" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-youtube"></i>
        </a>
         <a href="https://www.tiktok.com/@yourpage" target="_blank" rel="noreferrer">
          <i className="fab fa-tiktok"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
