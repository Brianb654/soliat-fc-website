import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('React app running on port:', process.env.REACT_APP_PORT || 3000);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// To measure performance, pass a function like reportWebVitals(console.log)
reportWebVitals();
