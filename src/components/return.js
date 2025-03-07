import React from 'react';
import { NavLink } from "react-router-dom"; 
import Sidebar from "./sidebar";
import Header from "./header";
import '../style/home.css'; 

function Return() {
  return (
    <div className="home-container">
      <Sidebar />
      <Header />

      <div className="main-content">
        {/* Content Section */}
        <div className="cont">
          <h1>Please Return <br /> me to SID</h1>
          <p>
            Step into a world where the art of Interior Design is meticulously crafted to bring together timeless elegance and cutting-edge modern innovation. Allowing you to transform your living spaces into the epitome of luxury and sophistication.
          </p>
          <NavLink to="/mana">
            <button className="get-qr-button">Register Now</button>
          </NavLink>
          <div className='divider'></div>
          {/* <NavLink to="/mana">
            <button className="get-qr-button">Find your Lost Item Now</button>
          </NavLink> */}
        </div>

        {/* Statistics Section */}
        <div className="statistics">
          <div className="stat-item">
            <h2>400+</h2>
            <p>Found Items</p>
          </div>
          <div className="stat-item">
            <h2>600+</h2>
            <p>Retrieve Items</p>
          </div>
          <div className="stat-item">
            <h2>100+</h2>
            <p>Missing Items</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <h2 className="services1">Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Mission</h3>
            <p>To safeguard the lives of all persons and properties in the campus by providing sound security measures and policies which are instinctive under all circumstances.</p>
            <div className='bottom'>
              <img src="pin.png" alt="miss" className="pin" />
              <p>MSU-IIT SECURITY AND INVESTIGATION DIVISION</p>
            </div>
          </div>
          <div className="service-card">
            <h3>Mandate</h3>
            <p>A responsive division actively promoting a culture of peace and order, safeguarding Institute physical assets and infrastructures, and ensuring protective services to the constituents of the Institute and its immediate environs.</p>
            <div className='bottom'>
              <img src="pin.png" alt="miss" className="pin" />
              <p>MSU-IIT SECURITY AND INVESTIGATION DIVISION</p>
            </div>
          </div>
        </div>
      </div>
    {/* Developer Team Section */}
    <div className="developer-team-section">
          <h2>Meet Our Developer Team</h2>
          <div className="developer-grid">
            <div className="developer-card">
              <img src="1.png" alt="John Doe" className="developer-img" />
              <h3>John Doe</h3>
              <p>Front-End Devel oper</p>
            </div>
            <div className="developer-card">
              <img src="2.png" alt="Jane Smith" className="developer-img" />
              <h3>Jane Smith</h3>
              <p>Front-End Developer</p>
            </div>
            <div className="developer-card">
              <img src="2.png " alt="Mark Johnson" className="developer-img" />
              <h3>Mark Johnson</h3>
              <p>Back-End Developer</p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Return;
