
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
const originalWarn = console.warn;
console.warn = (message, ...args) => {
  if (typeof message === "string" && message.includes("Reader: Support for defaultProps")) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, [message, ...args]);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
