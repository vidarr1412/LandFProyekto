import { jwtDecode } from 'jwt-decode';

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Scanner from './components/scanner';
import Home from './components/home'; // Adjust the path if necessary
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
import { unstable_batchedUpdates } from "react-dom";
const originalWarn = console.warn;
console.warn = (message, ...args) => {
  if (!message.includes("Reader: Support for defaultProps")) {
    originalWarn(message, ...args);
  }
};
// Helper function to check if the user is an admin
const isAdmin = () => {
  const token = localStorage.getItem('token'); // Assuming the JWT token is stored in localStorage
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.email === 'admin@gmail.com'; // Check if the usertype is 'admin'
    } catch (err) {
      console.error('Invalid token:', err);
      return false;
    }
  }
  return false;
};
const loggedin = () => {
  const token = localStorage.getItem('token'); // Check if the token exists in localStorage
  return token ? true : false; // Return true if logged in, false otherwise
};
const isStudent=()=>{
  const token = localStorage.getItem('token'); // Assuming the JWT token is stored in localStorage
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.email !== 'admin@gmail.com'; // Check if the usertype is 'admin'
    } catch (err) {
      console.error('Invalid token:', err);
      return false;
    }
  }
  return false;
}
// AdminRoute component for protected routes
const AdminRoute = ({ children }) => {
  return isAdmin() ? children : <Navigate to="/login" />;
};
const StudentRoute = ({ children }) => {
  return isStudent() ? children : <Navigate to="/login" />;
};
const NotLoggedIn = ({ children }) => {
  return loggedin() ? children : <Navigate to="/login" />;
};


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        {/* <Route path="/prof" element={<Profile />} /> */}
          <Route path="/" element={<Home />} />
          <Route
            path="/complaints"
            element={
              <AdminRoute>
                <Manage />
              </AdminRoute>
            }
          />
                 <Route
            path="/donation"
            element={
              <AdminRoute>
                <Foundation />
              </AdminRoute>
            }
          />
  
        <Route
            path="/profile"
            element={
              <NotLoggedIn>
                <Profile />
              </NotLoggedIn>
            }
          />
          <Route
            path="/manaRequests"
            element={
              <AdminRoute>
                <ManageRequest />
              </AdminRoute>
            }
          />
           <Route
           path="/foundation/:foundationId"
            element={
              <AdminRoute>
                <DonatedItems />
              </AdminRoute>
            }
          />
   

          <Route
            path="/database"
            element={
              <AdminRoute>
                <ReportItem />
              </AdminRoute>
            }
          />

<Route
            path="/scan_item"
            element={
              <AdminRoute>
                <Scanner />
              </AdminRoute>
            }
          />

<Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
    <Route
            path="/additem"
            element={
              <AdminRoute>
                <Additem />
              </AdminRoute>
            }
          />
    
    
    
      <Route
           path="/userComplaints"
            element={
              <StudentRoute>
                <UserComplaint />
              </StudentRoute>
            }
          />
            <Route
           path="/retrievalRequests"
            element={
              <StudentRoute>
                <RetrievalRequests />
              </StudentRoute>
            }
          />
        
       
          <Route path="/login" element={<Auth />} />
          <Route path="/bulletinboard" element={ <Bulletin/> }/>
          <Route path="/return_me" element={<Return />} />
          <Route path="/return_me*" element={<Navigate to="/return_me" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        

      </div>
    </Router>
    
  );
  console.warn = () => {};

}

export default App;