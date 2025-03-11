import React, { useState } from "react";
import "..//style/log.css";
import  showAlert from '../utils/alert';
function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleFormSwitch = () => {
    setIsLogin(!isLogin);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const email = e.target.email.value;
    const contactNumber = e.target.contactNumber.value;
    const password = e.target.password.value;
    const college=e.target.college.value;
    const year_lvl=e.target.year_lvl.value;
 

    try {
      const response = await fetch("http://10.10.83.224:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName,lastName,contactNumber, email, password,college ,year_lvl,}),
      });

      const data = await response.json();
      setLoading(false); // Hide loading animation

      if (response.ok) {
     
        showAlert('Sign Up Success!', 'signup_success');
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
      const response = await fetch("http://10.10.83.224:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      // Delay hiding loading animation for 3 seconds
      setTimeout(() => {
        setLoading(false);
  
        if (response.ok && data.token) {
          localStorage.setItem("token", data.token); // Store JWT token
          showAlert("Log In Success!", "complaint_success");
          window.location.href = "/"; // Redirect to home page
        } else {
          alert(data.message || "Login failed. Please check your credentials.");
        }
      }, 3000); // 3-second delay
  
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
        console.error("Login error:", err);
        alert("An error occurred during login. Please try again.");
      }, 3000); // Ensure error handling also respects the delay
    }
  };
  
  return (
    <>
      {/* Loading Animation */}
      {loading && (
        <div className="loading-overlay">
          <img src="/load.gif" alt="Loading..." className="loading-gif" />
        </div>
      )}
      
      <div className={`container ${!isLogin ? "active" : ""}`} id="container">
      {/* Sign Up Form */}
      <div className={`form-container sign-up`}>
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <input type="text" name="firstName" placeholder="First Name" required />
          <input type="text" name="lastName" placeholder="Last Name" required />
          <select name="college" placeholder="college"  required >  
                     <option value="">Please Select</option>
                      <option value="coe">COE</option>
                      <option value="ccs">CCS</option>
                      <option value="cass">CASS</option>
                      <option value="csm">CSM</option>
                      <option value="ceba">CEBA</option>
                      <option value="chs">CHS</option>
                      <option value="ced">CED</option>
                    </select> 
          <select name="year_lvl" placeholder="year_lvl"  required >  
                  <option value="">Please Select</option>
                  <option value="First Year">1</option>
                    <option value="Second Year">2</option>
                    <option value="Third Year">3</option>
                    <option value="Fourth Year">4</option>
                    </select> 
          <input type="text" name="contactNumber" placeholder="Contact Number" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
     
          <button type="submit">Sign Up</button>
        </form>
      </div>
        {/* Sign In Form */}
        <div className={`form-container sign-in`}>
          <form onSubmit={handleSignIn}>
            <h1>Sign In</h1>
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
            <img 
                src="firigif.gif" 
                alt="Welcome GIF" 
                className="welcome-gifleft"
              />
            <img 
                src="firi2.png" 
                alt="Welcome GIF" 
                className="welcome-gif1left"
              />
              <div className="churva"> 
              <p>Join FIRI – Find It, Retrieve It!
                <br></br>
                <br></br>
                Sign up to report, track, and reclaim lost items with ease! 🔍✨ </p>
              </div>

              <button className="hidden1" id="login" onClick={handleFormSwitch}>
                SignIn
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <img 
                src="firigif.gif" 
                alt="Welcome GIF" 
                className="welcome-gif"
              />
            <img 
                src="firi.png" 
                alt="Welcome GIF" 
                className="welcome-gif1"
              />
              <p>Welcome to FIRI – Find It, Retrieve It!
                <br></br>
                <br></br>
                Easily report lost and found items. Let’s help reunite valuables with their owners! 🔍✨
                </p>
              <button className="hidden" id="register" onClick={handleFormSwitch}>
                SignUp
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;