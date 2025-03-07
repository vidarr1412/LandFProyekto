import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import "../style/Lost.css";
import Header from "./header"
import { FaTable } from "react-icons/fa6";
import { IoGridOutline } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { jwtDecode } from 'jwt-decode';
import Pagination from './pagination';
import axios from 'axios';
import { storage, db, uploadBytesResumable, getDownloadURL, ref, doc, updateDoc } from "../firebase";
import moment from 'moment';
import Filter from '../filterered/userCompFilt'; // Adjust the import path as necessary
import Modal from './image'; // Import the Modal component
import  showAlert from '../utils/alert';
function UserComplaint() {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploading, setUploading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState(''); // State for selected image
  const [imagePreview, setImagePreview] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // Default to 'table' mode
  const [itemData, setItemData] = useState({
    itemname: '',
    type: '',
    contact: '',
    date: '',
    location: '',
    time: '',
    description: '',
    status: 'not-found',
    item_image: '',
  });

  // Fetch all data from the database when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log("Updated Token:", decodedToken); // Debugging

      setItemData(prevData => ({
        ...prevData,
        college: decodedToken.college || '' // Should now be present
      }));
    }


    fetchRequests();

    

  }, []);




  // Function to filter requests based on search text
  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }

    return filteredRequests.filter(request =>
      request.itemname.toLowerCase().includes(filterText.toLowerCase())
    );
  };


  // Function to handle canceling the image upload
const handleCancelUpload = () => {
  setImagePreview(null); // Reset image preview
  setItemData((prev) => ({ ...prev, item_image: '' })); // Reset item_image in itemData
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Decode the JWT token to extract the userId
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    const decodedToken = jwtDecode(token);
    console.log("Decoded Token:", decodedToken); // Check if 'college' exists
    const userId = decodedToken.id;
    const userCollege = decodedToken.college;
    const userName = `${decodedToken.firstName || ''} ${decodedToken.lastName || ''}`.trim();
    const userContact = decodedToken.contactNumber;
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = now.toTimeString().split(" ")[0]; // HH:MM:SS
    const year_lvl = decodedToken.year_lvl;
    const newComplaint = {
      // complainer: formData.get("complainer"),
      // itemname: formData.get("itemname"),
      // type: formData.get("type"),
      // contact: formData.get("contact"),
      // date: formData.get("date"),
      // location: formData.get("location"),
      // time: formData.get("time"),
      // description: formData.get("description"),
      // userId: userId, // Include the userId here
      complainer: userName,
      college: userCollege, // Automatically set the college from the token
      year_lvl: year_lvl,
      itemname: formData.get("itemname"),
      type: formData.get("type"),
      description: formData.get("description"),
      contact: userContact,
      general_location: formData.get("general_location"),
      location: formData.get("location"),
      date: formData.get("date"),
      time: formData.get("time"),
      date_complained: formattedDate,
      time_complained: formattedTime,
      item_image: itemData.item_image, // Use the uploaded image URL
      userId: userId, // Include the userId here
    };

    try {
      const response = await fetch("http://10.10.83.224:5000/usercomplaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert('Complaint Sent', 'complaint_success');
        setRequests([...requests, { ...newComplaint, status: "not-found", finder: "N/A" }]);
        setShowModal(false);
        setImagePreview(null); // Reset image preview
      } else {
        alert("Error filing complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error filing complaint:", error);
      alert("Error filing complaint. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return;
  
    setUploading(true); // Show upload progress
  
    const storageRef = ref(storage, `FIRI/requests/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: Track upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload Progress: ${progress}%`);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
      },
      async () => {
        // Get the download URL after successful upload
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        showAlert('Upload Success', 'complaint_success');
        setItemData((prev) => ({ ...prev, item_image: downloadURL }));
        setImagePreview(downloadURL); // Set the image preview URL to the new image
        setUploading(false);
      }
    );
  };
  

  const handleViewMore = (request) => {
    setSelectedRequest(request); // Set the selected request
    setItemData(request); // Populate itemData with the selected request's data
    setImagePreview(request.item_image); // Set the image preview to the current image
    setShowModal(true); // Open modal for viewing more details
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      // Optimistically remove the complaint from the state
      const updatedRequests = requests.filter((req) => req._id !== selectedRequest._id);
      setRequests(updatedRequests);

      try {
        const response = await fetch(
          `http://10.10.83.224:5000/usercomplaints/${selectedRequest._id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          const result = await response.json();
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
  };



  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedRequest = {
      ...selectedRequest,
      ...itemData,
    };
  
    try {
      const response = await fetch(`http://10.10.83.224:5000/usercomplaints/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRequest),
      });
  
      if (response.ok) {
        const result = await response.json();
        showAlert('Complaint Updated', 'complaint_success');
  
        // Update the requests state with the updated request
        setRequests((prevRequests) =>
          prevRequests.map((req) => (req._id === selectedRequest._id ? updatedRequest : req))
        );
  
        // Reset the image preview and modal state
        setImagePreview(null);
        setShowModal(false);
        setSelectedRequest(null);
        setItemData({
          itemname: '',
          type: '',
          contact: '',
          date: '',
          location: '',
          time: '',
          description: '',
          status: 'not-found',
          item_image: '',
        });
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
      // Get token and decode it to get userId
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token); // Decode the token
      const userId = decodedToken.id; // Extract userId

      // Fetch user-specific complaints using userId
      const response = await fetch(`http://10.10.83.224:5000/usercomplaints/${userId}`);
      const data = await response.json();
      setRequests(data); // Set the fetched data to the state
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests(); // Call fetchRequests on component mount
  }, []);

  // const filteredRequests = requests.filter((item) => {
  //   return item.itemname && item.itemname.toLowerCase().includes(filterText.toLowerCase());
  // });





  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'grid' ? 'table' : 'grid'));
  };

  const handleAddComplaint = () => {
    setSelectedRequest(null); // Clear selected request for new complaint
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
      status: 'not-found',
      item_image: '',
    });
    setImagePreview(null); // Reset image preview
    setShowModal(true); // Open modal for adding a complaint
  };


  const applyFilters = (filters) => {
    let filtered = [...requests]; // Use a copy of the original requests state



    if (filters.itemType) {
      filtered = filtered.filter(item => item.type === filters.itemType);
    }

    if (filters.dateLost) {
      filtered = filtered.filter(item => item.date === filters.dateLost);
    }

    if (filters.generalLocation) {
      filtered = filtered.filter(item => item.general_location.toLowerCase().includes(filters.generalLocation.toLowerCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply sorting
    if (filters.sortByDate === 'ascending') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filters.sortByDate === 'descending') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
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


  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true); // Open the image modal
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage('');
  };

  return (
    <div className="home-container">
      <Sidebar />
      <Header />

      <div className="content">
        <div className="manage-bulletin2">
          <div className="breadcrumb2">
            Lost and Found {'>'} File Report
          </div>



          <div className="search-bar2">
            <input
              type="text"
              placeholder="Search Item Name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input3"
            />
            <button onClick={toggleViewMode} className="view-mode-toggle2">
              {viewMode === 'grid' ? <IoGridOutline /> : <FaTable />}
            </button>




          </div>
          <div className="top-right-buttons2">
            <button className="add-item-btn2" onClick={handleAddComplaint}>+ File Report</button>

          </div>

          <Filter onApplyFilters={applyFilters} />


          {viewMode === 'table' ? (
            <div className="table-container2">
              <table className="ffound-items-table2">
                <thead>
                  <tr>
                    {/* <th>Complainer</th> */}
                    {/* <th>College</th>
                  <th>Year Level</th> */}
                    <th>ITEM NAME</th>
                    <th>Item Type</th>
                    <th>Item Description</th>
                    {/* <th>Contact of the Complainer</th> */}
                    <th>General Location</th>
                    <th>Specific Location</th>
                    <th>Date Lost</th>
                    <th>Time Lost</th>
                    {/* <th>Date Complained</th>
                  <th>Time Complained</th> */}
                    <th>Status</th>

                    <th>Image</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.map((item) => (
                    <tr key={item._id}>
                      {/* <td>{item.complainer}</td> */}
                      {/* <td>{item.college}</td>for visualization */}
                      {/* <td>{item.year_lvl}</td>for visualization */}
                      <td>{item.itemname}</td>
                      <td>{item.type}</td>{/* for visualization */}
                      <td>{item.description}</td>
                      {/* <td>{item.contact}</td> */}
                      <td>{item.general_location}</td>{/* for visualization */}
                      <td>{item.location}</td>
                      <td>{item.date}</td>{/* for visualization */}
                      <td>{item.time}</td>{/* for visualization */}
                      {/* <td>{item.date_complained}</td> */}
                      {/* <td>{item.time_complained}</td> */}
                      <td><span className={`status-btn2 ${item.status}`}>
                        {item.status || "N/A"}
                      </span></td>
                      <td>    <img
                    src={item.item_image || "default-table-url3"}
                    alt="Product"
                    className="default-table-url13"
                    onClick={() => handleImageClick(item.item_image || "default-table-url3")} // Add click handler
                  /> </td>
                      <td>

                        <button className="view-btn2" onClick={() => handleViewMore(item)}>
                          <FaPlus /> View More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (

            <div className="grid-container2">
              {displayedRequests.map((item) => (
                <div className="grid-item2" key={item._id}>
                  <h2>{item.itemname}</h2>
                  <img
                    src={item.item_image || "default-grid-url3"}
                    alt="Product"
                    className="default-grid-url13"
                    onClick={() => handleImageClick(item.item_image || "default-grid-url3")} // Add click handler
                  />
                  <p><strong>Complainer:</strong><span>{item.complainer}</span></p>
                  <p><strong>Item Type:</strong><span>{item.type} </span> </p>
                  <p><strong>Contact of the Complainer:</strong><span>  {item.contact}</span></p>
                  <p><strong>Date:</strong><span>{item.date} </span> </p>
                  <p><strong>Location:</strong><span> {item.location}</span> </p>
                  <p><strong>Time:</strong><span>{item.time} </span> </p>
                  <p><strong>Status:</strong><span className={`status-btn2 ${item.status}`}>{item.status} </span> </p>
                  <p><strong>Finder:</strong><span>{item.finder} </span> </p>

                  <button className="view-btn2" onClick={() => handleViewMore(item)}>
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

      {/* Modal for filing complaints */}

      {showModal && (
        <div className="modal-overlay2">
          <div className="modal2">
            <h2>{selectedRequest ? 'Update Report' : 'File a Report'}</h2>
            <div className="form-and-camera2">
              <form onSubmit={selectedRequest ? handleUpdate : handleComplaintSubmit} className="form-fields2">




                <div className="form-group2">
                  <label htmlFor="itemName">Item Name<span className="asterisk3"> *</span></label>
                  <input
                    type="text"
                    id="itemName"
                    name="itemname"
                    maxLength="100"
                    placeholder="Item Name"
                    value={itemData.itemname}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>

                <div className="form-group2">
                  <label htmlFor="description">Description<span className="asterisk3"> *</span></label>
                  <textarea
                    type="text"
                    id="description"
                    name="description"
                    maxLength="500"
                    placeholder="Description"
                    value={itemData.description}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>

                <div className="form-group2">
                  <label htmlFor="itemType">Item Type<span className="asterisk3"> *</span></label>
                  <select
                    id="itemType"
                    name="type"
                    maxLength="100"
                    placeholder="Item Type"
                    value={itemData.type}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  >
                    <option value="">Please select</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Personal-Items">Personal Items</option>
                    <option value="Clothing_Accessories">Clothing & Accessories</option>
                    <option value="Bags_Stationery">Bags & stationary</option>
                    <option value="Documents">Documents</option>
                    <option value="Sports_Miscellaneous">Sports & Miscellaneous</option>
                  </select>
                </div>




                <div className="form-group2">
                  <label htmlFor="general_location">General Location<span className="asterisk3"> *</span></label>
                  <select
                    id="general_location"
                    name="general_location"
                    maxLength="200"
                    placeholder="General Location"
                    value={itemData.general_location}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  >
                    <option value="">Please select</option>
                    <option value="Gym">GYMNASIUM</option>
                    <option value="adminBuilding">ADMIN BLG</option>
                    <option value="mph">MPH</option>
                    <option value="mainLibrary">MAIN LIBRARY</option>
                    <option value="lawn">LAWN</option>
                    <option value="ids">IDS</option>
                    <option value="clinic">CLINIC</option>
                    <option value="canteen">CANTEEN</option>
                    <option value="ceba">CEBA</option>
                    <option value="ccs">CCS</option>
                    <option value="cass">CASS</option>
                    <option value="csm">CSM</option>
                    <option value="coe">COE</option>
                    <option value="ced">CED</option>
                    <option value="chs">CHS</option>
                    <option value="outsideIit">OUTSIDE IIT</option>
                  </select>
                </div>
                <div className="form-group2">
                  <label htmlFor="Slocation">Specific Location<span className="asterisk3"> *</span></label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    maxLength="200"
                    placeholder="Location"
                    value={itemData.location}
                    onChange={handleInputChange}
                    required={!selectedRequest}
                  />
                </div>
                <div className="form-group2">
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
                <div className="form-group2">
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


                <div className="form-group2">
                  <label htmlFor="item_image">Item Image<span className="asterisk3"> *</span></label>
                  <input
                    type="file"
                    id="item_image"
                    name="item_image"
                    accept="image/*"
                    required={!selectedRequest}
                    onChange={(e) => {
                      handleImageUpload(e);
                      setImagePreview(null); // Reset preview when a new file is selected
                    }}
                    
/>
                </div>




                <div className="button-container2">
                  <button type="submit" className="submit-btn2">

                    {selectedRequest ? 'Update' : 'Submit'}
                  </button>
                  {selectedRequest && (
                    <button
                      type="button"
                      className="delete-btn1"
                      onClick={() => {
                        handleDelete(selectedRequest._id);
                        setShowModal(false); // Close the modal after deletion
                      }}
                    >
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    className="cancel-btn2"
                    onClick={() => {
                      handleCancelUpload(); // Call the cancel upload function
                      setShowModal(false); // Close the modal
                    }}
                  >
                    Cancel
                  </button>
                </div>

              </form>

              <div className="camera-section2">



                {/* Image Preview */}
                <div className="image-preview2">
                  {imagePreview && (
                    <>

                      <img src={imagePreview} alt="Uploaded Preview" className="uploaded-image2" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default UserComplaint;
