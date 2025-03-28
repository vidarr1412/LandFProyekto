import React, { useState } from "react";
import "..//style/log.css";
import  showAlert from '../utils/alert';
const accessToken = process.env.REACT_APP_ACCESS_TOKEN;
const pageId = process.env.REACT_APP_pageId ;
const API_URL = process.env.REACT_APP_API_URL;
function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleFormSwitch = () => {
    setIsLogin(!isLogin);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const email = e.target.email.value;
    const contactNumber = e.target.contactNumber.value;
    const password = e.target.password.value;
    const college=e.target.college.value;
    const year_lvl=e.target.year_lvl.value;
 

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName,lastName,contactNumber, email, password,college ,year_lvl,}),
      });

      const data = await response.json();


      if (response.ok) {
     
        showAlert('Sign Up Success!', 'signup_success');
        setLoading(false); // Hide loading animation
        setIsLogin(true); // Switch to login form after successful sign up
      } else {
   
        showAlert('Email already used!', 'signup_error');
        //add alert here
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during sign up.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading animation
  
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();
  
    if (!email || !password) {
      setLoading(false);
      alert("Please enter both email and password.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      // Delay hiding loading animation for 3 seconds
      setTimeout(() => {
      
  
        if (response.ok && data.token) {
          localStorage.setItem("token", data.token); // Store JWT token
          showAlert("Log In Success!", "complaint_success");
          window.location.href = "/"; // Redirect to home page
          setLoading(false);
        } else {
          alert(data.message || "Login failed. Please check your credentials.");
          setLoading(false);
        }
      }, 3000); // 3-second delay
  
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
        console.error("Login error:", err);
        alert("An error occurred during login. Please try again.");
        setLoading(false);
      }, 3000); // Ensure error handling also respects the delay
    }
  };
  return (
    <>
     {loading && (
        <div className="loading-overlay">
          <img src="/logingif.gif" alt="Loading..." className="loading-gif" />
        </div>
      )}
          <div className="auth-page"> {/* Add this wrapper */}
      {/* Loading Animation */}
     

      <div className="auth-container2">
        {/* Sign Up Form */}
        <div className={`form-container2 ${isLogin ? "hide" : ""}`}>
          <form onSubmit={handleSignUp}>
            <span className="title2">Create Account</span>
          
            <div className="input-container">
            <input type="text" name="firstName" placeholder="" required />
            <label htmlFor="firstName">First Name</label>
            </div>
            <div className="input-container">
            <input type="text" name="lastName" placeholder="" required />
            <label htmlFor="lastName">Last Name</label>
            </div>
              
          <div className="flex-container2">
            <div class="input-container">
        
            <select name="college" required>
              <option value="" hidden></option>
              <option value="coe">COE</option>
              <option value="ccsa">CCS</option>
              <option value="cass">CASS</option>
              <option value="csm">CSM</option>
              <option value="ceba">CEBA</option>
              <option value="chs">CHS</option>
              <option value="ced">CED</option>
            </select>
            <label for="year_lvl">College</label>
            </div>
            <div class="input-container">
              <select name="year_lvl" required>
                <option value="" hidden></option>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Fourth Year">Fourth Year</option>
              </select>

              <label for="year_lvl">Year Level</label>
            </div>
          </div>
            <div className="input-container">
            <input type="text" name="contactNumber" placeholder="" required />
            <label htmlFor="contactNumber">Contact Numer</label>
            </div>
            <div className="input-container">
      <input type="text" id="email" placeholder=" " required />
      <label htmlFor="email">Email</label>
    </div>

            <div  className="input-container">
            <input type="password" name="password" placeholder="" required />
            <label htmlFor="email">Password</label>
            </div>
            <button type="submit" className="log-button"> Sign Up</button>
          </form>
          <p>Already have an account? <span onClick={handleFormSwitch}className="switch-link">Sign In</span></p>
        </div>

        {/* Sign In Form */}
        <div className={`form-container2 ${!isLogin ? "hide" : ""}`}>
        <h1 className="title2">Create Account</h1>
            <form className="form-container2"  onSubmit={handleSignIn}>
    <div className="input-container">
      <input type="text" id="email" placeholder=" " required />
      <label htmlFor="email">Email</label>
    </div>

    <div className="input-container">
      <input type="password" id="password" placeholder=" " required />
      <label htmlFor="password">Password</label>
    </div>
    <button type="submit" className="log-button">Sign In</button>
    </form>
          <p>Don't have an account? <span  onClick={handleFormSwitch} className="switch-link">Sign Up</span></p>
        </div>
      </div>
      </div>
    </>
  );
};

export default Auth;