import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaCheck, FaFileAlt, FaUserCheck } from "react-icons/fa";
import "../style/dash.css";
import Sidebar from "./sidebar";
import Header from "./header";

function Dashboard() {
  // State to store dashboard data
  const [dashboardData, setDashboardData] = useState({
    listedFoundItems: 0,
    totalClaims: 0,
    totalLostReports: 0,
    totalRetrievalRequests: 0, // Updated to fetch from /retrieval-requests
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch found items
        const itemsResponse = await axios.get("http://10.10.83.224:5000/items");
        const foundItems = itemsResponse.data;

        // Fetch lost reports
        const complaintsResponse = await axios.get("http://10.10.83.224:5000/complaints");
        const lostReports = complaintsResponse.data;

        // Fetch retrieval requests
        const retrievalResponse = await axios.get("http://10.10.83.224:5000/retrieval-requests");
        const retrievalRequests = retrievalResponse.data;

        // Calculate data counts
        const listedFoundItems = foundItems.length;
        const totalClaims = foundItems.filter((item) => item.STATUS === "claimed").length;
        const totalLostReports = lostReports.length;
        const totalRetrievalRequests = retrievalRequests.length; // Direct count from API

        // Update state
        setDashboardData({
          listedFoundItems,
          totalClaims,
          totalLostReports,
          totalRetrievalRequests,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Header />

      <div className="name">
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
}

export default Dashboard;
