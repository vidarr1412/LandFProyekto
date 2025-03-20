import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Scanner from './components/scanner';
import Home from './components/home';
import Manage from './components/Complaints';
import ManageRequest from './components/manageRequest';
import ReportItem from './components/report';
import Dashboard from './components/dash';
import Auth from './components/log';
import Foundation from './components/donation';
import Additem from './components/additem';
import UserComplaint from './components/userComplaint';
import Bulletin from './components/bulletinboard';
import Profile from './components/prof';
import RetrievalRequests from './components/retrievalrequest';
import DonatedItems from './components/donatedList';
import Return from './components/return';

const originalWarn = console.warn;
console.warn = (message, ...args) => {
  if (!message.includes("Reader: Support for defaultProps")) {
    originalWarn(message, ...args);
  }
};

// Helper function to check if the user is an admin
const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.email === 'admin@gmail.com';
    } catch (err) {
      console.error('Invalid token:', err);
      return false;
    }
  }
  return false;
};

const loggedin = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const isStudent = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.email !== 'admin@gmail.com';
    } catch (err) {
      console.error('Invalid token:', err);
      return false;
    }
  }
  return false;
};

// AdminRoute component for protected routes
const AdminRoute = ({ children }) => (isAdmin() ? children : <Navigate to="/login" />);
const StudentRoute = ({ children }) => (isStudent() ? children : <Navigate to="/login" />);
const NotLoggedIn = ({ children }) => (loggedin() ? children : <Navigate to="/login" />);

function App() {
  const [cache, setCache] = useState(() => {
    const storedCache = localStorage.getItem('routeCache');
    return storedCache ? JSON.parse(storedCache) : {};
  });

  useEffect(() => {
    localStorage.setItem('routeCache', JSON.stringify(cache));
  }, [cache]);

  const cacheData = (route, data) => {
    setCache((prevCache) => ({
      ...prevCache,
      [route]: data,
    }));
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaints" element={<AdminRoute><Manage cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/donation" element={<AdminRoute><Foundation cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/profile" element={<NotLoggedIn><Profile cacheData={cacheData} cache={cache} /></NotLoggedIn>} />
          <Route path="/manaRequests" element={<AdminRoute><ManageRequest cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/foundation/:foundationId" element={<AdminRoute><DonatedItems cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/database" element={<AdminRoute><ReportItem cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/scan_item" element={<AdminRoute><Scanner cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/dashboard" element={<AdminRoute><Dashboard cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/additem" element={<AdminRoute><Additem cacheData={cacheData} cache={cache} /></AdminRoute>} />
          <Route path="/userComplaints" element={<StudentRoute><UserComplaint cacheData={cacheData} cache={cache} /></StudentRoute>} />
          <Route path="/retrievalRequests" element={<StudentRoute><RetrievalRequests cacheData={cacheData} cache={cache} /></StudentRoute>} />
          <Route path="/login" element={<Auth />} />
          <Route path="/bulletinboard" element={<Bulletin />} />
       
        </Routes>
      </div>
    </Router>
  );
}

export default App;
