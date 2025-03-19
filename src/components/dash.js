// Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaCheck, FaFileAlt, FaUser  } from "react-icons/fa";
import "../style/dash.css";
import Sidebar from "./sidebar";
import Header from "./header";
import Charts1 from "../visualization/lostChart.js"; // Import the Charts component
import Charts2 from "../visualization/foundChart.js"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

function Dashboard() {
  // State to store dashboard data
      const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    listedFoundItems: 0,
    totalClaims: 0,
    totalLostReports: 0,
    totalRetrievalRequests: 0,
  });
  const [complaintsData, setComplaintsData] = useState([]);
  const [foundItemsData, setFoundItemsData] = useState([]); // State for found items data

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
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
        const totalRetrievalRequests = retrievalRequests.length;

        // Update state
        setDashboardData({
          listedFoundItems,
          totalClaims,
          totalLostReports,
          totalRetrievalRequests,
        });

        // Set complaints data for charts
        setComplaintsData(lostReports);
        setFoundItemsData(foundItems); // Set found items data
     setLoading(false); 
      
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const [timeInterval, setTimeInterval] = useState('monthly'); // Default to monthly
  const [timelineInterval, setTimelineInterval] = useState('monthly'); // Default to monthly
  const [claimingTimelineInterval, setClaimingTimelineInterval] = useState('daily');

  const handleIntervalChange = (event) => {
    setTimeInterval(event.target.value);
    setTimelineInterval(event.target.value);
    setClaimingTimelineInterval(event.target.value);
  };

  return (
    <>
        {loading && (
      <div className="loading-overlay">
        <img src="/load.gif" alt="Loading..." className="loading-gif" />
      </div>
    )}
    <div className="dashboard-container1">
      <Sidebar />
      <Header />

      <div className="name">
        <div className="dah1">
          <h2>Dashboard</h2>
        </div>
        <div className="dashboard-cards1">
          {/* Listed Found Items */}
          <div className="dashboard-card1">
            <div className="card-icon1">
              <FaBox />
            </div>
            <div className="card-details1">
              <h2>{dashboardData.listedFoundItems}</h2>
              <p>Listed Found Items</p>
            </div>
          </div>

          {/* Total Claims */}
          <div className="dashboard-card1">
            <div className="card-icon1">
              <FaCheck />
            </div>
            <div className="card-details1">
              <h2>{dashboardData.totalClaims}</h2>
              <p>Total Claims</p>
            </div>
          </div>

          {/* Total Lost Reports */}
          <div className="dashboard-card1">
            <div className="card-icon1">
              <FaFileAlt />
            </div>
            <div className="card-details1">
              <h2>{dashboardData.totalLostReports}</h2>
              <p>Total Lost Reports</p>
            </div>
          </div>

          {/* Total Retrieval Requests */}
          <div className="dashboard-card1">
            <div className="card-icon1">
              <FaUser  />
            </div>
            <div className="card-details1">
              <h2>{dashboardData.totalRetrievalRequests}</h2>
              <p>Total Retrieval Requests</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <Charts1
          complaintsData={complaintsData}
          timeInterval={timeInterval}
          timelineInterval={timelineInterval}
          
          handleIntervalChange={handleIntervalChange}
        />
      <Charts2
          foundItemsData={foundItemsData}
          timeInterval={timeInterval}
          complaintsData={complaintsData}
          timelineInterval={timelineInterval}
          claimingTimelineInterval={claimingTimelineInterval}
          handleIntervalChange={handleIntervalChange}
        />
      </div>
    </div>
    </>
  );
  
}

export default Dashboard;