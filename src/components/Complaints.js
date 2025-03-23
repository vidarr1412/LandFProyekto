import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Sidebar from "./sidebar";
import "../style/complaints.css";
import { FaTable } from "react-icons/fa6";
import { IoGridOutline } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import Pagination from './pagination';
import axios from 'axios';
import Header from "./header";
import Filter from '../filterered/complaintsFilt'; // Import the Filter component
import showAlert from '../utils/alert';
import Modal from './image'; // Import the Modal component
const accessToken = process.env.REACT_APP_ACCESS_TOKEN;
const pageId = process.env.REACT_APP_pageId ;
const API_URL = process.env.REACT_APP_API_URL;
function Manage() {
    const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  // const [showUpdateModal, setShowUpdateModal] = useState(false);  // State to manage update modal visibility
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]); // No initial data here
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewMore, setIsViewMore] = useState(false); // New state to track if modal is for viewing more details
  const itemsPerPage = 10;
  const [imageModalOpen, setImageModalOpen] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState(''); // State for selected image

  const [itemData, setItemData] = useState({
    complainer: '',
    college: '',
    year_lvl: '',
    itemname: '',
    type: '',
    description: '',
    contact: '',
    general_location: '',
    location: '',
    date: '',
    time: '',
    date_complained: '',
    time_complained: '',
    status: '',
    finder: '',
  });

  // Fetch all data from the database when the component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/complaints`);
        const data = await response.json();
        setRequests(data);
        setFilteredRequests(data);
        setCurrentPage(1); // Set current page to 1 when data is fetched 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  // Function to filter requests based on search text
  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }

    return filteredRequests.filter(request => {
      const complainerMatch = request.complainer && request.complainer.toLowerCase().includes(filterText.toLowerCase());
      const itemNameMatch = request.itemname && request.itemname.toLowerCase().includes(filterText.toLowerCase());
      return complainerMatch || itemNameMatch;
    });
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (timerId) {
      clearInterval(timerId); // Stop the timer
      setTimerId(null);
    }

    console.log(`⏳ Complaint duration: ${time} seconds`); // ✅ Console log the duration

    const formData = new FormData(e.target);
    const newComplaint = {
      complainer: formData.get("complainer"),
      college: formData.get("college"),
      year_lvl: formData.get("year_lvl"),
      itemname: formData.get("itemname"),
      type: formData.get("type"),
      description: formData.get("description"),
      contact: formData.get("contact"),
      general_location: formData.get("general_location"),
      location: formData.get("location"),
      date: formData.get("date"),
      time: formData.get("time"),
      date_complained: formData.get("date_complained"),
      time_complained: formData.get("time_complained"),
      status: formData.get("status"),
      duration: time, // Include duration
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint),
      });

      if (response.ok) {
        const result = await response.json();
        setLoading(false);
        showAlert("Complaint Submitted", "complaint_success");
        setRequests([...requests, { ...newComplaint, finder: "N/A" }]);
        setShowModal(false);
        fetchRequests()
      } else {
        alert("Error filing complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error filing complaint:", error);
      alert("Error filing complaint. Please try again.");
    }
  };
  const handleViewMore = (request) => {
    fetchRequests();
    setSelectedRequest(request);
    setItemData(request);
    setIsEditing(false); // Ensure we are in view mode
    setIsViewMore(true); // Set to view more mode
    setShowModal(true); // Open modal for viewing more details
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      // Optimistically remove the complaint from the state
      const updatedRequests = requests.filter((req) => req._id !== selectedRequest._id);
      setRequests(updatedRequests);
setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/complaints/${selectedRequest._id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          const result = await response.json();
          setLoading(false);
          showAlert('Complaint Deleted', 'complaint_error');
          setShowViewMoreModal(false); // Close modal after successful deletion
        } else {
          // Roll back the change in case of failure
          setRequests([...updatedRequests, selectedRequest]);
          alert("Failed to delete the complaint. Please try again.");
        }
      } catch (error) {
        // Roll back the change in case of failure
        setRequests([...updatedRequests, selectedRequest]);
        console.error("Error deleting complaint:", error);
        alert("An error occurred while deleting the complaint. Please try again.");
      }
    }
    fetchRequests();
  };



  // const handleUpdate = () => {
  //   setShowUpdateModal(true);  // Show the update modal when the "Update" button is clicked
  // };
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedRequest = {
      ...selectedRequest,
      ...itemData,
    };

    try {
      const response = await fetch(`${API_URL}/complaints/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRequest),
      });

      if (response.ok) {
        const result = await response.json();
        setLoading(false);
        showAlert('Complaint Updated', 'complaint_success');

        setRequests(
          requests.map((req) =>
            req._id === selectedRequest._id ? updatedRequest : req
          )
        );

        setShowModal(false); // Close the modal after successful update
        setSelectedRequest(null);// Clear selected request
        setItemData({ // Reset itemData after update
          // itemname: '',
          // type: '',
          // contact: '',
          // date: '',
          // location: '',
          // description: '',
          // time: '',
          // status: 'not-found',
          // finder: ''
          complainer: '',
          college: '',
          year_lvl: '',
          itemname: '',
          type: '',
          description: '',
          contact: '',
          general_location: '',
          location: '',
          time: '',
          date: '',
          date_complained: '',
          time_complained: '',
          status: '',
          finder: '',
        });
        setIsEditing(false);
        setIsViewMore(false);
      } else {
        alert("Error updating complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("Error updating complaint. Please try again.");
    }
  };


  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/complaints`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };


  const applyFilters = (filters) => {
    let filtered = [...requests]; // Use a copy of the original requests state

    // Apply filters
    if (filters.itemType) {
      filtered = filtered.filter(item => item.type === filters.itemType);
    }

    if (filters.dateLost) {
      filtered = filtered.filter(item => item.date_complained === filters.dateLost);
    }

    if (filters.generalLocation) {
      filtered = filtered.filter(item => item.general_location.toLowerCase().includes(filters.generalLocation.toLowerCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply sorting
       if (filters.sortByDate === 'descending') {
      filtered.sort((a, b) => (a.date_complained || "").localeCompare(b.date_complained || ""));
    } else if (filters.sortByDate === 'ascending') {
      filtered.sort((a, b) => (b.date_complained || "").localeCompare(a.date_complained || ""));
    }
    

    // Only update filteredRequests if it has changed
    if (JSON.stringify(filtered) !== JSON.stringify(filteredRequests)) {
      setFilteredRequests(filtered);
    }




  };

  //UPDATE PAGINATIOn
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const displayedRequests = filterRequests().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const [viewMode, setViewMode] = useState('table'); // Default to 'table' mode
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'table' ? 'grid' : 'table'));
  };

  const [time, setTime] = useState(0);
  const [timerId, setTimerId] = useState(null);

  // Reset and start the timer when the modal opens
  const handleAddComplaint = () => {
    setItemData({
      complainer: '',
      college: '',
      year_lvl: '',
      itemname: '',
      type: '',
      description: '',
      contact: '',
      general_location: '',
      location: '',
      time: '',
      date: '',
      date_complained: '',
      time_complained: '',
      status: '',
    });

    setTime(0); // Reset timer
    setShowModal(true); // Open modal

    // Start the timer
    if (timerId) {
      clearInterval(timerId);
    }
    const id = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    setTimerId(id);
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === 'not-found' ? 'found' : 'not-found'; // Toggle status
    try {
      await axios.put(`${API_URL}/complaints/${item._id}`, { ...item, status: newStatus });

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === item._id ? { ...req, status: newStatus } : req
        )
      );
      // Alert the user of the status change
      showAlert('Status Updated', 'complaint_success');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true); // Open the image modal
  };


  const handleCloseImageModal = () => {
    setIsEditing(false);
    fetchRequests();
    setImageModalOpen(false);
    setSelectedImage('');
    fetchRequests();
  };

  return (
    <>
        {loading && (
          <div className="loading-overlay">
            <img src="/load.gif" alt="Loading..." className="loading-gif" />
          </div>
        )}
    <div className="home-container">
      <Sidebar />
      <Header />



      <div className="content">
        <div className="manage-bulletin3">
          <div className="breadcrumb3">
            Manage Lost And Found {'>'} Manage Reports and Complaints
          </div>



          <div className="search-bar3">
            <input
              type="text"
              placeholder="Search Complainer"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input3"
            />
            <button onClick={toggleViewMode} className="view-mode-toggle3">
              {viewMode === 'table' ? <FaTable /> : <IoGridOutline />}
            </button>

          </div>

          <div className="top-right-buttons3">

            <button className="add-item-btn3"onClick={() => { setIsEditing(false); handleAddComplaint(true) }} >+ File Complaint</button>
            {/* <button className="register-qr-btn3">Register QR Code</button>*/}
          </div>

          <Filter onApplyFilters={applyFilters} />

          {viewMode === 'table' ? (
            <div className="table-container3">
              <table className="ffound-items-table3">
                <thead>
                  <tr>
                    <th>COMPLAINER</th>
                    <th>College</th>
                    <th>Year Level</th>
                    <th>Item Name</th>
                    <th>Item Type</th>
                    <th>Item Description</th>
                    <th>Contact of the Complainer</th>
                    <th>General Location</th>
                    <th>Specific Location</th>
                    <th>Date Lost</th>
                    <th>Time Lost</th>
                    <th>Date Complained</th>
                    <th>Time Complained</th>
                    <th>Status</th>

                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.map((item) => (
                    <tr key={item._id}>
                      <td>{item.complainer}</td>
                      <td>{item.college}</td>
                      <td>{item.year_lvl}</td>
                      <td>{item.itemname}</td>
                      <td>{item.type}</td>
                      <td>{item.description}</td>
                      <td>{item.contact}</td>
                      <td>{item.general_location}</td>
                      <td>{item.location}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.date_complained}</td>
                      <td>{item.time_complained}</td>
                      <td>
                        <button
                          className={`status-btn3 ${item.status && typeof item.status === 'string' && item.status.toLowerCase() === 'not-found' ? 'not-found' : 'found'}`}
                          onClick={() => handleStatusChange(item)}
                        >
                          {item.status || 'not-found'}
                          <IoMdArrowDropdown className='arrow3' />
                        </button>
                      </td>

                      <td>
                        <button className="view-btn3" onClick={() => handleViewMore(item)}>
                          <FaPlus /> View More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid-container3">
              {displayedRequests.map((item) => (
                <div className="grid-item3" key={item._id}>
                  <h2>{item.complainer}</h2>
                  <p><span>Item Name: </span>{item.itemname}</p>
                  <p><span>Item Type: </span> {item.type}</p>
                  <p><span>Item Description: </span> {item.description}</p>
                  <p><span>General Location: </span> {item.general_location}</p>
                  <p><span>Contact of the Complainer: </span> {item.contact}</p>
                  <p><span>Date: </span> {item.date}</p>
                  <p><span>Time: </span> {item.time}</p>
                 
                  <button
                    className={`status-btn3 ${item.status && typeof item.status === 'string' && item.status.toLowerCase() === 'not-found' ? 'not-found' : 'found'}`}
                    onClick={() => handleStatusChange(item)}
                  >
                    {item.status || 'not-found'}
                    <IoMdArrowDropdown className='arrow3' />
                  </button>
                  <button className="view-btn3" onClick={() => handleViewMore(item)}>
                    <FaPlus /> View More
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </div>

      <Modal isOpen={imageModalOpen} onClose={handleCloseImageModal} imageUrl={selectedImage} />

      {showModal && (
        <div className="modal-overlay3">
          <div className="modal3">
            <h2>{isViewMore ? (isEditing ? 'Edit Complaint' : 'View Complaint Details') : 'File a Complaint'}</h2>

            {isViewMore ? (
              isEditing ? (
                <form onSubmit={handleUpdate} className="form-fields3">
                  {/* Form fields for editing */}
                  <div className="form-group3">
                    <label htmlFor="complainerName">Complainer Name</label>
                    <input
                      type="text"
                      id="complainerName"
                      name="complainer"
                      maxLength="100"
                      placeholder="Complainer Name"
                      value={itemData.complainer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="complainerCollege">College</label>
                    <select
                      id="college"
                      name="college"
                      value={itemData.college}
                      onChange={handleInputChange}
                    >
                      <option value="coe">COE</option>
                      <option value="ccs">CCS</option>
                      <option value="cass">CASS</option>
                      <option value="csm">CSM</option>
                      <option value="ceba">CEBA</option>
                      <option value="chs">CHS</option>
                      <option value="ced">CED</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div className="form-group3">
                    <label htmlFor="complainerLevel">Year Level</label>
                    <select
                      id="year_lvl"
                      name="year_lvl"
                      value={itemData.year_lvl}
                      onChange={handleInputChange}
                    >
                            <option value="Faculty">Faculty</option>
                      <option value="First Year">1st Year</option>
                      <option value="Second Year">2nd Year</option>
                      <option value="Third Year">3rd Year</option>
                      <option value="Fourth Year">4th Year</option>
                      <option value="Fifth Year">5th Year</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div className="form-group3">
                    <label htmlFor="itemName">Item Name</label>
                    <input
                      type="text"
                      id="itemName"
                      name="itemname"
                      maxLength="100"
                      placeholder="Item Name"
                      value={itemData.itemname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      maxLength="500"
                      placeholder="Description"
                      value={itemData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="itemType">Item Type</label>
                    <select
                      id="itemType"
                      name="type"
                      value={itemData.type}
                      onChange={handleInputChange}
                    >
                            <option value="">Please select</option>
                               <option value="Electronics">Electronics</option>
                            <option value="Personal Items">Personal Items</option>
                            <option value="Clothing Accessories">Clothing & Accessories</option>
                            <option value="Bags and Stationery">Bags & stationary</option>
                            <option value="Sports and Miscellaneous">Sports & Miscellaneous</option>
                    </select>
                  </div>
                  <div className="form-group3">
                    <label htmlFor="contact">Contact of the Complainer</label>
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                       maxLength="100"
                      placeholder="Contact of the Complainer"
                      value={itemData.contact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="general_location">General Location</label>
                    <select
                      id="general_location"
                      name="general_location"
                      placeholder="General Location"
                      value={itemData.general_location}
                      onChange={handleInputChange}
                    >
                            <option value="CCS Area">CCS Area</option>
                                <option value="CASS Area">CASS Area</option>
                                <option value="CHS Area">CHS Area</option>
                                <option value="CSM Area">CSM Area</option>
                                <option value="IDS Area">IDS Area</option>
                                <option value="CEBA Area">CEBA Area</option>
                                <option value="CED Area">CED Area</option>
                                <option value="INSIDE IIT">INSIDE IIT</option>
                                <option value="OUTSIDE IIT">OUTSIDE IIT</option>
                                <option value="Pedestrian & Traffic Zones">Pedestrian & Traffic Zones</option>
                                <option value="Institute Gymnasium Area">Institute Gymnasium Area</option>
                                <option value="Admission & Admin Offices">Admission & Admin Offices</option>
                                <option value="Food Court Area">Food Court Area</option>
                                <option value="Research Facility">Research Facility</option>
                                <option value="ATM & Banking Area">ATM & Banking Area</option>
                                <option value="Institute Park & Lawn">Institute Park & Lawn</option>
                                <option value="Restrooms (CRs)">Restrooms(CRs)</option>
                                

                    </select>
                  </div>
                  <div className="form-group3">
                    <label htmlFor="location">Specific Location</label>
                    <textarea
                      id="locationn"
                      name="location"
                      maxLength="200"
                      placeholder="Specific location"
                      value={itemData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="date">Date Lost</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={itemData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="time">Time Lost</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={itemData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="date_complained">Date Complained</label>
                    <input
                      type="date"
                      id="date_complained"
                      name="date_complained"
                      value={itemData.date_complained}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="time_complained">Time Complained</label>
                    <input
                      type="time"
                      id="time_complained"
                      name="time_complained"
                      value={itemData.time_complained}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={itemData.status}
                      onChange={handleInputChange}
                    >
                         <option value="not-found">not-found</option>
                      <option value="found">found</option>
                   
                    </select>
                  </div>

                  <div className="button-container3">
                    <button type="submit" className="submit-btn3">Update</button>
                    {/* delete modal */}
                    <button type="button" className="delete-btn3" onClick={() => { handleDelete(selectedRequest._id); setShowModal(false); }}> Delete</button>
                 <button type="button" className="cancel-btn3" onClick={() => { setIsViewMore(false);setIsEditing(false); setShowModal(false); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="complaint-details3">
                  <div className="detail-grid3">
                    <div className="detail-item3">
                      <strong>Complain:</strong>
                      <span>{itemData.complainer}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>College:</strong>
                      <span>{itemData.college}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Year Level:</strong>
                      <span>{itemData.year_lvl}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Item Name:</strong>
                      <span>{itemData.itemname}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Item Type:</strong>
                      <span>{itemData.type}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Description:</strong>
                      <span>{itemData.description}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Contact:</strong>
                      <span>{itemData.contact}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>General Location:</strong>
                      <span>{itemData.general_location}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Specific Location:</strong>
                      <span>{itemData.location}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Date Lost:</strong>
                      <span>{itemData.date}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Time Lost:</strong>
                      <span>{itemData.time}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Date Complained:</strong>
                      <span>{itemData.date_complained}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Time Complained:</strong>
                      <span>{itemData.time_complained}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Status:</strong>
                      <span>{itemData.status}</span>
                    </div>
                    <div className="detail-item3">
                      <strong>Image:</strong>
                      <span> <img
                        src={itemData.item_image || 'sad.jpg'}
                        alt="Product"
                        className="default-table-url33"
                        onClick={() => handleImageClick(itemData.item_image || 'sad.jpg')} // Add click handler
                      /></span>
                    </div>

                  </div>
                  <div className="button-container3">
                    <button className="edit-btn3" onClick={() => setIsEditing(true)}>Edit</button>
                    <button className="cancel-btn3" onClick={() => { setIsViewMore(false);setIsEditing(false); setShowModal(false); }}>Cancel</button>
                  </div>
                </div>
              )
            ) : (
              <form onSubmit={handleComplaintSubmit} className="form-fields3">
                <div className="form-group3">
                  <label htmlFor="complainerName">Complainer Name<span className="asterisk3"> *</span></label>
                  <input
                    type="text"
                    id="complainerName"
                    name="complainer"
                    maxLength="100"
                    placeholder="Complainer Name"
                    value={itemData.complainer}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>
                <div className="form-group3">
                  <label htmlFor="complainerCollege">College<span className="asterisk3"> *</span></label>
                  <select
                    id="college"
                    name="college"
                    value={itemData.college}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  >
                    <option value="">Please select</option>
                    <option value="coe">COE</option>
                    <option value="ccs">CCS</option>
                    <option value="cass">CASS</option>
                    <option value="csm">CSM</option>
                    <option value="ceba">CEBA</option>
                    <option value="chs">CHS</option>
                    <option value="ced">CED</option>
                    <option value="N/A">N/A</option>
                  </select>
                  
                </div>

                <div className="form-group3">
                  <label htmlFor="complainerLevel">Year Level<span className="asterisk3"> *</span></label>

                  <select
                    id="year_lvl"
                    name="year_lvl"

                    placeholder="Year Level"
                    value={itemData.year_lvl}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                    >
                    <option value="">Please select</option>
                    <option value="Faculty">Faculty</option>
                    <option value="First Year">1st Year</option>
                    <option value="Second Year">2nd Year</option>
                    <option value="Third Year">3rd Year</option>
                    <option value="Fourth Year">4th Year</option>
                    <option value="Fifth Year">5th Year</option>
                    <option value="N/A">N/A</option>
                  </select>

                </div>
                <div className="form-group3">
                  <label htmlFor="itemName">Item Name<span className="asterisk3"> *</span></label>
                  <input
                    type="text"
                    id="itemName"
                    name="itemname"
                    maxlength="100"
                    placeholder="Item Name"
                    value={itemData.itemname}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>

                <div className="form-group3">
                  <label htmlFor="description">Description<span className="asterisk3"> *</span></label>
                  <textarea
                    type="text"
                    id="description"
                    name="description"
                    maxlength="500"
                    placeholder="Description"
                    value={itemData.description}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>

                <div className="form-group3">
                  <label htmlFor="itemType">Item Type<span className="asterisk3"> *</span></label>
                  <select
                    id="itemType"
                    name="type"
                    placeholder="Item Type"
                    value={itemData.type}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                    >
                      <option value="">Please select</option>
                               <option value="Electronics">Electronics</option>
                            <option value="Personal Items">Personal Items</option>
                            <option value="Clothing Accessories">Clothing & Accessories</option>
                            <option value="Bags and Stationery">Bags & stationary</option>
                            <option value="Sports and Miscellaneous">Sports & Miscellaneous</option>
                  </select>
                </div>


                <div className="form-group3">
                  <label htmlFor="contact">Contact of the Complainer<span className="asterisk3"> *</span></label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    maxlength="50"
                    placeholder="Contact of the Complainer"
                    value={itemData.contact}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>


                <div className="form-group3">
                  <label htmlFor="general_location">General Location<span className="asterisk3"> *</span></label>
                  <select
                    id="general_location"
                    name="general_location"
                    placeholder="General Location"
                    value={itemData.general_location}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                    >
                     
                     <option value="COET Area">COET Area</option>
                                <option value="CCS Area">CCS Area</option>
                                <option value="CASS Area">CASS Area</option>
                                <option value="CHS Area">CHS Area</option>
                                <option value="CSM Area">CSM Area</option>
                                <option value="IDS Area">IDS Area</option>
                                <option value="CEBA Area">CEBA Area</option>
                                <option value="CED Area">CED Area</option>
                                <option value="INSIDE IIT">INSIDE IIT</option>
                                <option value="OUTSIDE IIT">OUTSIDE IIT</option>
                                <option value="Pedestrian & Traffic Zones">Pedestrian & Traffic Zones</option>
                                <option value="Institute Gymnasium Area">Institute Gymnasium Area</option>
                                <option value="Admission & Admin Offices">Admission & Admin Offices</option>
                                <option value="Food Court Area">Food Court Area</option>
                                <option value="Research Facility">Research Facility</option>
                                <option value="ATM & Banking Area">ATM & Banking Area</option>
                                <option value="Institute Park & Lawn">Institute Park & Lawn</option>
                                <option value="Restrooms (CRs)">Restrooms(CRs)</option>
                  </select>
                </div>
                <div className="form-group3">
                  <label htmlFor="location">Specific Location<span className="asterisk3"> *</span></label>
                  <textarea
                    type="text"
                    id="location"
                    name="location"
                    maxlength="200"
                    placeholder="Specific Location"
                    value={itemData.location}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>
                <div className="form-group3">
                  <label htmlFor="date">Date Lost<span className="asterisk3"> *</span></label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={itemData.date}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>
                <div className="form-group3">
                  <label htmlFor="time">Time Lost<span className="asterisk3"> *</span></label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={itemData.time}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>
                <div className="form-group3">
                  <label htmlFor="date_complained">Date Complained<span className="asterisk3"> *</span></label>
                  <input
                    type="date"
                    id="date_complained"
                    name="date_complained"
                    value={itemData.date_complained}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>
                <div className="form-group3">
                  <label htmlFor="time_complained">Time Complained<span className="asterisk3"> *</span></label>
                  <input
                    type="time"
                    id="time_complained"
                    name="time_complained"
                    value={itemData.time_complained}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={itemData.status}
                    onChange={handleInputChange}
                  >
                    option
                    <option value="not-found">not-found</option>
                    <option value="found">found</option>
               
                  </select>
                </div>

                {/* <div className="form-group3">
                  <label htmlFor="finder">Finder</label>
                  <input
                    type="text"
                    id="finder"
                    name="finder"
                    placeholder="Finder's Name"
                    value={itemData.finder}
                    onChange={handleInputChange}

                  />
                </div> */}

                <div className="button-container3">
                  <button type="submit" className="submit-btn3">Submit</button>
                  <button type="button" className="cancel-btn3"onClick={() => { setIsEditing(false);setIsViewMore(false); setShowModal(false); }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}



export default Manage;
