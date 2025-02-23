import React from "react";
import { FaBox, FaCheck, FaFileAlt, FaUserCheck } from "react-icons/fa";
import "../style/dash.css";
import Sidebar from "./sidebar";
import Header from "./header";

function Dashboard () {
  // Mock data for the dashboard
  const dashboardData = {
    listedFoundItems: 120,
    totalClaims: 75,
    totalLostReports: 45,
    totalRetrievalRequests: 30,
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      {/* Fixed Header */}
    <Header /> 

      <div className="name" >
        <div className="dah">
          <h2>Dashboard</h2>
        </div>
      <div className="dashboard-cards">
        {/* Listed Found Items */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaBox />
          </div>
          <div className="card-details">
            <h2>{dashboardData.listedFoundItems}</h2>
            <p>Listed Found Items</p>
          </div>
        </div>

        {/* Total Claims */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaCheck />
          </div>
          <div className="card-details">
            <h2>{dashboardData.totalClaims}</h2>
            <p>Total Claims</p>
          </div>
        </div>

        {/* Total Lost Reports */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaFileAlt />
          </div>
          <div className="card-details">
            <h2>{dashboardData.totalLostReports}</h2>
            <p>Total Lost Reports</p>
          </div>
        </div>

        {/* Total Retrieval Requests */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaUserCheck />
          </div>
          <div className="card-details">
            <h2>{dashboardData.totalRetrievalRequests}</h2>
            <p>Total Retrieval Requests</p>
          </div>
        </div>
      </div>
      </div>

    </div>
  );
};

export default Dashboard;
