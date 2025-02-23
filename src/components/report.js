import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBullhorn, FaQrcode, FaFileAlt, FaUserCheck, FaSearch, FaFilter, FaUser,FaSignOutAlt  } from 'react-icons/fa';
import '../style/report.css';
import Sidebar from "./sidebar";


function ReportItem() {
  return (
    <div className="home-container">

      <Sidebar />
      <header className="header">
      <h2>FIRI LOGO</h2>
        </header>
        
      
      <div className="content">

        <div className="manage-bulletin">
          <div className="breadcrumb">Manage Lost and Found {'>'} Manage Database</div>
                      {/* Buttons at the top-right */}

          <div className="reqsearch-bar">
            <input type="text" placeholder="Search" />
            <FaSearch className="search-icon" />
            <FaFilter className="filter-icon" />
          </div>

                    
          <table className="found-items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID Number</th>
                <th>College</th>
                <th>Gmail Account</th>
                <th>Contact Number</th>
                <th>Date Request</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Paul Gary Oca', type: 'Electronics', date: '2021-0424', location: 'Gym', time: '9:00 am' },
                { name: 'Jean Dhea', type: 'Electronics', date: '2021-0423', location: 'Gym', time: '9:00 am' },
                { name: 'Christian Albert', type: 'Electronics', date: '2021-0423', location: 'Gym', time: '9:00 am' },
                { name: 'Laptop', type: 'Electronics', date: '2021-0423', location: 'Gym', time: '9:00 am' },
                { name: 'Laptop', type: 'Electronics', date: '2021-0423', location: 'Gym', time: '9:00 am' },
                { name: 'Redmi 10 C Redmi 10', type: 'Electronics', date: '2021-0424', location: 'Gym', time: '9:00 am' },
        
                // Add more items as needed
              ].map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.id}</td>
                  <td>{item.college}</td>
                  <td>{item.gaccount}</td>
                  <td>{item.number}</td>
                  <td>{item.request}</td>
                  <td>{item.statues}</td>



                  <td>
                    <button className="show-btn">Show</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
        <div className="pagination">
          <button className="page-nav">&lt; Previous</button>
          <button className="page-nav">Next&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default ReportItem;
