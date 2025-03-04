
import { FaSearch, FaFilter } from 'react-icons/fa';
import Sidebar from "./sidebar";
// import '../style/scanner.css';
import axios from 'axios';
import ReactQrScanner from 'react-qr-scanner'; // Import the QR scanner
import emailjs from 'emailjs-com'; // Import EmailJS SDK
import React, { useState, useEffect, useRef } from 'react';
import { FaTable } from "react-icons/fa6";
import { IoGridOutline } from "react-icons/io5";

import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";

import '../style/Found.css';

import { storage } from "../firebase"; // Import Firebase storage
import Pagination from './pagination';
import { ref, uploadBytesResumable, uploadString, getDownloadURL } from "firebase/storage";
import Header from './header';
import Filter from '../filterered/foundFilt'; // Adjust the import path as necessary
import Modal from './image'; // Import the Modal component

import showAlert from '../utils/alert';


function ItemScanner() {
  const [qrData, setQrData] = useState(""); // State to hold the QR code data
  const [userDetails, setUserDetails] = useState({ email: '', firstName: '', lastName: '' }); // State to hold user details
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewMore, setIsViewMore] = useState(false); // New state to track if modal is for viewing more details
  const itemsPerPage = 10;
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState(''); // State for selected image
  const [activeTab, setActiveTab] = useState('item'); // State for selected image
  const [message, setMessage] = useState(
    `Dear ${userDetails.firstName || "Recipient"},\n\nWe found your item and would love to return it to you. Please let us know how we can arrange for you to get it back.\n\nBest regards,\nMindanao State University - Iligan Insitute of Technology - Security and Investigation Division`
  );
  
  const [itemData, setItemData] = useState({
    // ITEM: '',
    // DESCRIPTION: '',
    // DATE_FOUND: '',
    // TIME_RETURNED: '',
    // FINDER: '',
    // CONTACT_OF_THE_FINDER: '',
    // FOUND_LOCATION: '',
    // OWNER: '',
    // DATE_CLAIMED: '',
    // STATUS: 'unclaimed',
    // IMAGE_URL: '',  // Store image URL
    FINDER: '',//based  on their csv
    FINDER_TYPE: '',//for data visualization 
    ITEM: '',//item name ,based on their csv
    ITEM_TYPE: '',//for data visualization
    DESCRIPTION: '',//item description ,base on their csv
    IMAGE_URL: '',//change to item image later
    CONTACT_OF_THE_FINDER: '',//based on their csv
    DATE_FOUND: '',//based on their csv
    GENERAL_LOCATION: '',//for data visualization
    FOUND_LOCATION: '',//based on their csv
    TIME_RETURNED: '',  //time received
    OWNER: '',
    OWNER_COLLEGE: '',
    OWNER_CONTACT: '',
    OWNER_IMAGE: '',
    DATE_CLAIMED: '',
    TIME_CLAIMED: '',
    STATUS: 'unclaimed',
  });

  const [image, setImage] = useState(null); // State to hold the captured image
  const [ownerImage, setOwnerImage] = useState(null); // State to hold the captured owner image
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchItems();
    if (showModal) {
      startCamera(); // Start camera when modal is shown
    }
  }, [showModal]);


  //NEW FIXED

  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }

    return filteredRequests.filter(request => {
      // Check if request.ITEM is defined before calling toLowerCase
      const itemName = request.ITEM ? request.ITEM.toLowerCase() : '';
      return itemName.includes(filterText.toLowerCase());
    });
  };


  const fetchItems = async () => {
    try {
      const response = await axios.get('http://10.10.83.224:5000/items');
      //10.10.83.224 SID
      //10.10.83.224 BH
      const sortedRequests = response.data.sort((a, b) => {
        // Combine DATE_FOUND and TIME_RETURNED into a single Date object
        const dateA = new Date(`${a.DATE_FOUND}T${a.TIME_RETURNED}`);
        const dateB = new Date(`${b.DATE_FOUND}T${b.TIME_RETURNED}`);
        return dateB - dateA; // Sort in descending order
      });
      setCurrentPage(1); // Set current page to 1 when data is fetched
      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = itemData.IMAGE_URL; // Default to existing URL if any
    let ownerImageUrl = itemData.OWNER_IMAGE; // Default to existing owner image URL if any

    // Check if adding a new item and no image is captured
    if (!selectedItem && !image && !ownerImage) {
      alert('Please capture an image before submitting the form.'); // Alert if no image is captured
      return; // Exit the function
    }
    // Step 1: Upload the image to Firebase Storage if available
    if (image) {
      const imageRef = ref(storage, `FIRI/${Date.now()}.png`);
      try {
        await uploadString(imageRef, image, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);

        imageUrl = downloadURL; // Update the URL

      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    // Step 2: Upload the owner image to Firebase Storage if available
    if (ownerImage) {
      const ownerImageRef = ref(storage, `FIRI/owner_${Date.now()}.png`);
      try {
        await uploadString(ownerImageRef, ownerImage, 'data_url');
        const downloadURL = await getDownloadURL(ownerImageRef);
        ownerImageUrl = downloadURL; // Update the URL for the owner image
      } catch (error) {
        console.error('Error uploading owner image:', error);
        alert('Error uploading owner image. Please try again.'); // Alert on error
        return; // Exit the function
      }
    }

    // Step 3: Update itemData with the image URLs
    const updatedData = { ...itemData, IMAGE_URL: imageUrl, OWNER_IMAGE: ownerImageUrl };

    try {
      if (selectedItem) {
        await axios.put(`http://10.10.83.224:5000/items/${selectedItem._id}`, updatedData);
        showAlert('Item Updated!', 'complaint_success');
      } else {
        const response = await axios.post('http://10.10.83.224:5000/items', updatedData);
        setRequests([...requests, response.data]);
        showAlert('Item Added!', 'complaint_success');
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
    e.preventDefault();

    // Prepare email content
    const emailContent = {
      to_email: userDetails.email,
      subject: "Message from FIRI",
      message: message || "Hello " + userDetails.firstName + ",\n\nThis is a default message from the FIRI system. Please let us know if you have any questions.\n\nBest regards,\nFIRI Team",
    };

    // Use EmailJS to send the email
    emailjs.send('service_8p4ma2j', 'template_2jox1ye', emailContent, '2NJW8I3MXFf2Xs7EJ')
      .then((response) => {
        console.log('Email sent successfully!', response);
        setShowModal(false); // Close the modal on successful email
      })
      .catch((error) => {
        console.error('Failed to send email', error);
      });
  };



  const openModal = (item = null) => {
    setSelectedItem(item);
    setItemData(
      item || {
        FINDER: '',//based  on their csv
        FINDER_TYPE: 'STUDENT',//for data visualization 
        ITEM: '',//item name ,based on their csv
        ITEM_TYPE: 'Electronics',//for data visualization
        DESCRIPTION: '',//item description ,base on their csv
        IMAGE_URL: '',//change to item image later
        CONTACT_OF_THE_FINDER: '',//based on their csv
        DATE_FOUND: '',//based on their csv
        GENERAL_LOCATION: 'Gym',//for data visualization
        FOUND_LOCATION: '',//based on their csv
        TIME_RETURNED: '',  //time received
        OWNER: '',
        OWNER_COLLEGE: '',
        OWNER_CONTACT: '',
        OWNER_IMAGE: '',
        DATE_CLAIMED: '',
        TIME_CLAIMED: '',
        STATUS: 'unclaimed',
      }
    );
    setImage(null); // Reset the captured image when opening the modal
    setShowModal(true);

    // Reset the view mode and editing state when opening the "Add Found Item" modal
    setIsViewMore(false); // Ensure we are not in view mode
    setIsEditing(false); // Ensure we are not in editing mode
    startCamera();
  };

  const applyFilters = (filters) => {
    let filtered = [...requests]; // Use a copy of the original requests state

    // Apply filters
    if (filters.finderType) {
      filtered = filtered.filter(item => item.FINDER_TYPE === filters.finderType);
    }

    if (filters.itemType) {
      filtered = filtered.filter(item => item.ITEM_TYPE === filters.itemType);
    }

    if (filters.dateFound) {
      filtered = filtered.filter(item => item.DATE_FOUND === filters.dateFound);
    }

    if (filters.generalLocation) {
      filtered = filtered.filter(item => item.GENERAL_LOCATION.toLowerCase().includes(filters.generalLocation.toLowerCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.STATUS === filters.status);
    }

    // Apply sorting
    if (filters.sortByDate === 'ascending') {
      filtered.sort((a, b) => new Date(a.DATE_FOUND) - new Date(b.DATE_FOUND));
    } else if (filters.sortByDate === 'descending') {
      filtered.sort((a, b) => new Date(b.DATE_FOUND) - new Date(a.DATE_FOUND));
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



  





  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;

            // Wait for the stream to be ready before calling play
            videoRef.current.onloadeddata = () => {
              videoRef.current.play()
                .catch((err) => {
                  console.error('Error playing the video stream:', err);
                });
            };
          } else {
            console.error('Video reference is null');
          }
        })
        .catch((err) => {
          console.error('Error accessing the camera:', err);
        });
    } else {
      console.error('getUserMedia is not supported in this browser.');
    }
  };


  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png'); // Capturing the image in base64 format
      // Update the appropriate state based on the active tab
      if (activeTab === 'item') {
        setImage(imageData); // Set the captured image for the item
        setItemData({ ...itemData, IMAGE_URL: imageData }); // Update itemData with the captured image
      } else if (activeTab === 'owner') {
        setOwnerImage(imageData); // Set the captured image for the owner
        setItemData({ ...itemData, OWNER_IMAGE: imageData }); // Update itemData with the captured owner image
      }
    }
  };

  const handleViewMore = (request) => {
    setSelectedItem(request);
    setItemData(request);
    setIsEditing(false); // Ensure we are in view mode
    setIsViewMore(true); // Set to view more mode
    setShowModal(true); // Open modal for viewing more details
    // Start the camera when viewing more details
    startCamera();
  };

  const handleEdit = () => {
    setIsEditing(true); // Switch to edit mode
    startCamera(); // Start the camera when editing
  };


  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true); // Open the image modal
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage('');
  };

  useEffect(() => {
    setMessage(
      `Dear ${userDetails.firstName || "Recipient"},<br/><br/>
      We found your <strong>${itemData.ITEM || "item"}</strong> 
      at <strong>${itemData.FOUND_LOCATION || "location"}</strong> 
      and would love to return it to you.<br/><br/>
      Please let us know how we can arrange for you to get it back.<br/><br/>
      Best regards,<br/>
      Your Team`
    );
  }, [userDetails, itemData]);
  
  

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://10.10.83.224:5000/profile/${userId}`);
      const data = response.data;
      setUserDetails({
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleScan = (data) => {
    if (data) {
      setQrData(data.text); // Get QR code data (user ID in this case)
      fetchUserData(data.text); // Fetch user details using the user ID from QR code
    }
  };

  const handleError = (err) => {
    console.error("Error scanning QR code: ", err);
  };

  // Handle sending email
  const sendEmail = (e) => {
    e.preventDefault();

    // Prepare email content
    const emailContent = {
      to_email: userDetails.email,
      item:userDetails.firstName,
      subject: "Message from FIRI",
      message: message  };

    // Use EmailJS to send the email
    emailjs.send('service_8p4ma2j', 'template_2jox1ye', emailContent, '2NJW8I3MXFf2Xs7EJ')
      .then((response) => {
        console.log('Email sent successfully!', response);
        setShowModal(false); // Close the modal on successful email
      })
      .catch((error) => {
        console.error('Failed to send email', error);
      });
  };
  

  return (
    <div className="home-container">
      <Sidebar />
      <header className="header">
        <h2>FIRI LOGO</h2>
      </header>
      <div className="contentsms">
        <div className="manage-bulletin">
          <div className="breadcrumb">Manage Lost and Found {'>'} Manage Found Items</div>
          <div className="top-right-buttons">
            <button className="add-item-btn">+ Add Found Item</button>
            <button className="register-qr-btn">Register QR Code</button>
          </div>
          <div className="camera-sectionsms">
            {/* Use ReactQrScanner to handle QR code scanning */}
            <ReactQrScanner
              delay={300} // Set delay to 300ms to give time for the camera to load
              style={{ width: "100%" }} // Adjust the scanner view size
              onScan={handleScan} // Handle scan result
              onError={handleError} // Handle scan error
            />
          </div>
          <div>
            <p>Scanned QR Code Value: {qrData}</p>
            {userDetails.email && (
              <div>
                <p><strong>Email:</strong> {userDetails.email}</p>
                <p><strong>First Name:</strong> {userDetails.firstName}</p>
                <p><strong>Last Name:</strong> {userDetails.lastName}</p>
                <button>Send Message</button>
                {/* Open modal when clicking Send Email */}
                <button onClick={() => setShowModal(true)}>Send Email</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for custom message input */}
      {showModal && (
       <div className="modal-overlay1">
                <div className="modal1">
                  <h2>{isViewMore ? (isEditing ? 'Edit Item' : 'View Found Item Details') : 'File a Found Item'}</h2>
      
                  {/* Conditionally render the tab buttons */}
                  {!isViewMore || isEditing ? (
                    <div className="tabs1">
                      <button className={`tab-button1 ${activeTab === 'item' ? 'active' : ''}`} onClick={() => setActiveTab('item')}>Item Details</button>
                      <button className={`tab-button1 ${activeTab === 'owner' ? 'active' : ''}`} onClick={() => setActiveTab('owner')}>Owner Details (Optional)</button>
                    </div>
                  ) : null}
      
                  {/* Wrap form fields and camera in a flex container */}
                  {isViewMore ? (
                    isEditing ? (
                      <div className="form-and-camera">
                        <form onSubmit={handleFormSubmit} className="form-fields">
      
      
                          {activeTab === 'item' ? (
                            <>
                              <div className="form-group1">
                                <label htmlFor="finderName">Finder Name</label>
                                <input
                                  type="text"
                                  id="finderName"
                                  name="FINDER"
                                  maxLength="100"
                                  placeholder="Finder Name"
                                  value={itemData.FINDER}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                />
                              </div>
      
      
                              <div className="form-group1">
                                <label htmlFor="finderType">Finder TYPE</label>  {/* ADD DROP DOWN */}
      
                                <select
                                  id="finderType"
                                  name="FINDER_TYPE"
      
                                  placeholder="Finder TYPE"
                                  value={itemData.FINDER_TYPE}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                >
                                  <option value="STUDENT">STUDENT</option>
                                  <option value="UTILITIES">UTILITIES</option>
                                  <option value="GUARD">GUARD</option>
                                  <option value="VISITORS">VISITORS</option>
                                </select>
                              </div>
                              <div className="form-group1">
                                <label htmlFor="itemName">Item Name</label>
                                <input
                                  type="text"
                                  id="itemName"
                                  name="ITEM"
                                  maxLength="100"
                                  placeholder="Item Name"
                                  value={itemData.ITEM}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                />
                              </div>
                              <div className="form-group1">
                                <label htmlFor="itemType">ITEM TYPE</label>  {/* ADD DROP DOWN */}
                                <select
      
                                  id="item_Type"
                                  name="ITEM_TYPE"
                                  placeholder="Item TYPE"
                                  value={itemData.ITEM_TYPE}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                >
                                  <option value="Electronics">Electronics</option>
                                  <option value="Personal-Items">Personal Items</option>
                                  <option value="Clothing_Accessories">Clothing & Accessories</option>
                                  <option value="Bags_Stationery">Bags & stationary</option>
                                  <option value="Documents">Documents</option>
                                  <option value="Sports_Miscellaneous">Sports & Miscellaneous</option>
                                </select>
                              </div>
                              <div className="form-group1">
                                <label htmlFor="description">Item Description</label>
                                <textarea
                                  id="description"
                                  name="DESCRIPTION"
                                  maxLength="500"
                                  placeholder="Description"
                                  value={itemData.DESCRIPTION}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                ></textarea>
                              </div>
      
                              <div className="form-group1">
                                <label htmlFor="contact">Finder Contact</label>
                                <input
                                  type="text"
                                  id="contact"
                                  name="CONTACT_OF_THE_FINDER"
                                  maxLength="50"
                                  placeholder="Contact Number"
                                  value={itemData.CONTACT_OF_THE_FINDER}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                />
                              </div>
      
                             
                              <div className="form-group1">
                                <label htmlFor="generalLocation">General Location</label>  {/* ADD DROP DOWN */}
      
                                <select
                                  id="generalLocation"
                                  name="GENERAL_LOCATION"
                                  placeholder="General Location"
                                  value={itemData.GENERAL_LOCATION}
                                  onChange={handleInputChange}
                                >
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
                              <div className="form-group1">
                                <label htmlFor="location">Specific Location</label>
                                <input
                                  type="text"
                                  id="location"
                                  name="FOUND_LOCATION"
                                  maxLength="200"
                                  placeholder="Specific Location"
                                  value={itemData.FOUND_LOCATION}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                />
                              </div>
      
                              <div className="form-group1">
                                <label htmlFor="dateFound">Date Found</label>
                                <input
                                  type="date"
                                  id="dateFound"
                                  name="DATE_FOUND"
                                  value={itemData.DATE_FOUND}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                />
                              </div>
      
                              <div className="form-group1">
                                <label htmlFor="timeReceived">Time Received</label>
                                <input
                                  type="time"
                                  id="timeReceived"
                                  name="TIME_RETURNED"
                                  value={itemData.TIME_RETURNED}
                                  onChange={handleInputChange}
                                  required={!selectedItem}
                                />
                              </div>
      
      
                              <div className="form-group1">
                                <label htmlFor="status">Status</label>
                                <select
                                  id="status"
                                  name="STATUS"
                                  value={itemData.STATUS}
                                  onChange={handleInputChange}
                                >
                                  <option value="unclaimed">Unclaimed</option>
                                  <option value="claimed">Claimed</option>
                                </select>
                              </div>
      
      
                            </>
                          ) : (
                            <>
                              {/* Owner Details Form Fields */}
                              <div className="form-group1">
                                <label htmlFor="owner">Owner Name</label>
                                <input
                                  type="text"
                                  id="owner"
                                  name="OWNER"
                                  maxLength="50"
                                  placeholder="Owner Name"
                                  value={itemData.OWNER}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="form-group1">
                                <label htmlFor="ownerCollege">Owner College</label>
                                <select
                                  id="ownerCollege"
                                  name="OWNER_COLLEGE"
                                  value={itemData.OWNER_COLLEGE}
                                  onChange={handleInputChange}
                                >
                                  <option value="coe">COE</option>
                                  <option value="ccs">CCS</option>
                                  <option value="cass">CASS</option>
                                  <option value="csm">CSM</option>
                                  <option value="ceba">CEBA</option>
                                  <option value="chs">CHS</option>
                                  <option value="ced">CED</option>
                                </select>
                              </div>
                              {/* Add other owner fields here... */}
                              <div className="form-group1">
                                <label htmlFor="ownerContact">Owner Contact</label>
                                <input
                                  type="text"
                                  id="ownerContact"
                                  name="OWNER_CONTACT"
                                  maxLength="50"
                                  placeholder="Owner Contact"
                                  value={itemData.OWNER_CONTACT}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="form-group1">
                                <label htmlFor="dateClaimed">Date Claimed</label>
                                <input
                                  type="date"
                                  id="dateClaimed"
                                  name="DATE_CLAIMED"
                                  maxLength="50"
                                  placeholder="May skip if owner is not yet identified"
                                  value={itemData.DATE_CLAIMED}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="form-group1">
                                <label htmlFor="ownerImage">Time Claimed</label>
                                <input
                                  type="time"
                                  id="timeClaimed"
                                  name="TIME_CLAIMED"
                                  maxLength="50"
                                  placeholder="May skip if owner is not yet identified"
                                  value={itemData.TIME_CLAIMED}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="form-group1">
                                <label htmlFor="status">Status</label>
                                <select
                                  id="status"
                                  name="STATUS"
                                  value={itemData.STATUS}
                                  onChange={handleInputChange}
                                >
                                  <option value="unclaimed">Unclaimed</option>
                                  <option value="claimed">Claimed</option>
                                </select>
                              </div>
                            </>
                          )}
      
                          {/* Buttons inside the form */}
                          <div className="button-container1">
                            <button type="submit" className="submit-btn1">Update</button>
                            {/* delete modal */}
                          
                            <button type="button" className="cancel-btn1" onClick={() => { setIsEditing(false); setShowModal(false); }}> Cancel </button>
                          </div>
                        </form>
      
      
      
      
      
      
      
                        {/* Camera Section for both Item and Owner */}
                        <div className="camera-section">
                          <video ref={videoRef} width="320" height="240" autoPlay />
                          <canvas ref={canvasRef} style={{ display: 'none' }} />
                          <div className="camera-buttons">
                            <button type="button" onClick={captureImage}>Capture Image</button>
                          </div>
                          {/* Show the existing image if in edit mode */}
                          {activeTab === 'item' && itemData.IMAGE_URL && !image && (
                            <img src={itemData.IMAGE_URL} alt="Existing Item" className="captured-image" />
                          )}
                          {activeTab === 'owner' && itemData.OWNER_IMAGE && !ownerImage && (
                            <img src={itemData.OWNER_IMAGE} alt="Existing Owner" className="captured-image" />
                          )}
      
      
                          {/* Show the captured image based on the active tab */}
                          {activeTab === 'item' && image && (
                            <img src={image} alt="Captured Item" className="captured-image" />
                          )}
                          {activeTab === 'owner' && ownerImage && (
                            <img src={ownerImage} alt="Captured Owner" className="captured-image" />
                          )}
                        </div>
      
                      </div>
                    ) : (
                      <div className="found-details1">
                        <div className="detail-grid1">
                          <div className="detail-item1">
                            <strong>Finder:</strong>
                            <span>{itemData.FINDER}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>finder Type:</strong>
                            <span>{itemData.FINDER_TYPE}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Item Name:</strong>
                            <span>{itemData.ITEM}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Item Type:</strong>
                            <span>{itemData.ITEM_TYPE}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Description:</strong>
                            <span>{itemData.DESCRIPTION}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Item image:</strong>
                            {/* Show the saved image only when updating an existing item */}
                            {
                              <img src={itemData.IMAGE_URL} alt="Saved" className="captured-image" />
                            }
                          </div>
                          <div className="detail-item1">
                            <strong>Finder Contact:</strong>
                            <span>{itemData.CONTACT_OF_THE_FINDER}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Date Found:</strong>
                            <span>{itemData.DATE_FOUND}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>General Location:</strong>
                            <span>{itemData.GENERAL_LOCATION}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Specific Location:</strong>
                            <span>{itemData.FOUND_LOCATION}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Time Recieved:</strong>
                            <span>{itemData.TIME_RETURNED}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Owner:</strong>
                            <span>{itemData.OWNER}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Owner College:</strong>
                            <span>{itemData.OWNER_COLLEGE}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Contact:</strong>
                            <span>{itemData.OWNER_CONTACT}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Owner image:</strong>
                            {/* Show the saved image only when updating an existing item */}
                            {
                              <img src={itemData.OWNER_IMAGE} alt="Saved" className="captured-image" />
                            }
                          </div>
                          <div className="detail-item1">
                            <strong>Date Claimed:</strong>
                            <span>{itemData.DATE_CLAIMED}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Time Claimed:</strong>
                            <span>{itemData.TIME_CLAIMED}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Status:</strong>
                            <span>{itemData.STATUS}</span>
                          </div>
                          <div className="detail-item1">
                            <strong>Foundation:</strong>
                            
                          </div>
                        </div>
                        <div className="button-container1">
                          <button className="edit-btn1" onClick={handleEdit}>Edit</button>
                          <button className="cancel-btn1" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="form-and-camera">
                      <form onSubmit={handleFormSubmit} className="form-fields">
                        {activeTab === 'item' ? (
                          <>
                            <div className="form-group1">
                              <label htmlFor="finderName">Finder Name</label>
                              <input
                                type="text"
                                id="finderName"
                                name="FINDER"
                                maxLength="100"
                                placeholder="Finder Name"
                                value={itemData.FINDER}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              />
                            </div>
      
      
                            <div className="form-group1">
                              <label htmlFor="finderType">Finder TYPE</label>  {/* ADD DROP DOWN */}
      
                              <select
                                id="finderType"
                                name="FINDER_TYPE"
      
                                placeholder="Finder TYPE"
                                value={itemData.FINDER_TYPE}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="UTILITIES">UTILITIES</option>
                                <option value="GUARD">GUARD</option>
                                <option value="VISITORS">VISITORS</option>
                              </select>
                            </div>
                            <div className="form-group1">
                              <label htmlFor="itemName">Item Name</label>
                              <input
                                type="text"
                                id="itemName"
                                name="ITEM"
                                maxLength="100"
                                placeholder="Item Name"
                                value={itemData.ITEM}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              />
                            </div>
                            <div className="form-group1">
                              <label htmlFor="itemType">ITEM TYPE</label>  {/* ADD DROP DOWN */}
                              <select
      
                                id="itemType"
                                name="ITEM_TYPE"
                                placeholder="Item TYPE"
                                value={itemData.ITEM_TYPE}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              >
                                <option value="Electronics">Electronics</option>
                                <option value="Personal-Items">Personal Items</option>
                                <option value="Clothing_Accessories">Clothing & Accessories</option>
                                <option value="Bags_Stationery">Bags & stationary</option>
                                <option value="Documents">Documents</option>
                                <option value="Sports_Miscellaneous">Sports & Miscellaneous</option>
                              </select>
                            </div>
                            <div className="form-group1">
                              <label htmlFor="description">Item Description</label>
                              <textarea
                                id="description"
                                name="DESCRIPTION"
                                maxLength="500"
                                placeholder="Description"
                                value={itemData.DESCRIPTION}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              ></textarea>
                            </div>
      
                            <div className="form-group1">
                              <label htmlFor="contact">Finder Contact</label>
                              <input
                                type="text"
                                id="contact"
                                name="CONTACT_OF_THE_FINDER"
                                maxLength="50"
                                placeholder="Contact Number"
                                value={itemData.CONTACT_OF_THE_FINDER}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              />
                            </div>
      
                            
                            <div className="form-group1">
                              <label htmlFor="generalLocation">General Location</label>  {/* ADD DROP DOWN */}
      
                              <select
                                id="generalLocation"
                                name="GENERAL_LOCATION"
                                placeholder="General Location"
                                value={itemData.GENERAL_LOCATION}
                                onChange={handleInputChange}
                              >
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
                            <div className="form-group1">
                              <label htmlFor="location">Specific Location</label>
                              <input
                                type="text"
                                id="location"
                                name="FOUND_LOCATION"
                                maxLength="200"
                                placeholder="Specific Location"
                                value={itemData.FOUND_LOCATION}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              />
                            </div>
      
                            <div className="form-group1">
                              <label htmlFor="dateFound">Date Found</label>
                              <input
                                type="date"
                                id="dateFound"
                                name="DATE_FOUND"
                                value={itemData.DATE_FOUND}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              />
                            </div>
      
                            <div className="form-group1">
                              <label htmlFor="timeReceived">Time Received</label>
                              <input
                                type="time"
                                id="timeReceived"
                                name="TIME_RETURNED"
                                value={itemData.TIME_RETURNED}
                                onChange={handleInputChange}
                                required={!selectedItem}
                              />
                            </div>
      
      
      
      
                            <div className="form-group1">
                              <label htmlFor="status">Status</label>
                              <select
                                id="status"
                                name="STATUS"
                                value={itemData.STATUS}
                                onChange={handleInputChange}
                              >
                                <option value="unclaimed">Unclaimed</option>
                                <option value="claimed">Claimed</option>
                              </select>
                            </div>
      
                          </>
                        ) : (
                          <>
                            {/* Owner Details Form Fields */}
                            <div className="form-group1">
                              <label htmlFor="owner">Owner Name</label>
                              <input
                                type="text"
                                id="owner"
                                name="OWNER"
                                maxLength="50"
                                placeholder="Owner Name"
                                value={itemData.OWNER}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="form-group1">
                              <label htmlFor="ownerCollege">Owner College</label>
                              <select
                                id="ownerCollege"
                                name="OWNER_COLLEGE"
                                value={itemData.OWNER_COLLEGE}
                                onChange={handleInputChange}
                              >
                                <option value="coe">COE</option>
                                <option value="ccs">CCS</option>
                                <option value="cass">CASS</option>
                                <option value="csm">CSM</option>
                                <option value="ceba">CEBA</option>
                                <option value="chs">CHS</option>
                                <option value="ced">CED</option>
                              </select>
                            </div>
                            {/* Additional owner fields can be added here */}
                            <div className="form-group1">
                              <label htmlFor="ownerContact">Owner Contact</label>
                              <input
                                type="text"
                                id="ownerContact"
                                name="OWNER_CONTACT"
                                maxLength="50"
                                placeholder="Owner Contact"
                                value={itemData.OWNER_CONTACT}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="form-group1">
                              <label htmlFor="dateClaimed">Date Claimed</label>
                              <input
                                type="date"
                                id="dateClaimed"
                                name="DATE_CLAIMED"
                                maxLength="50"
                                placeholder="May skip if owner is not yet identified"
                                value={itemData.DATE_CLAIMED}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="form-group1">
                              <label htmlFor="ownerImage">Time Claimed</label>
                              <input
                                type="time"
                                id="timeClaimed"
                                name="TIME_CLAIMED"
                                maxLength="50"
                                placeholder="May skip if owner is not yet identified"
                                value={itemData.TIME_CLAIMED}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="form-group1">
                              <label htmlFor="status">Status</label>
                              <select
                                id="status"
                                name="STATUS"
                                value={itemData.STATUS}
                                onChange={handleInputChange}
                              >
                                <option value="unclaimed">Unclaimed</option>
                                <option value="claimed">Claimed</option>
                              </select>
                            </div>
      
                          </>
      
                        )}
      
                        {/* Buttons inside the form */}
                        <div className="button-container1">
                          <button type="submit" className="submit-btn1">Submit</button>
                          {/* delete modal */}
      
                          <button type="button" className="cancel-btn1" onClick={() => setShowModal(false)}> Cancel </button>
                        </div>
                      </form>
      
      
                      <div className="camera-section">
                        <video ref={videoRef} width="320" height="240" autoPlay />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div className="camera-buttons">
                          <button type="button" onClick={captureImage}>Capture Image</button>
                        </div>
                        {/* Show the captured image based on the active tab */}
                        {activeTab === 'item' && image && (
                          <img src={image} alt="Captured Item" className="captured-image" />
                        )}
                        {activeTab === 'owner' && ownerImage && (
                          <img src={ownerImage} alt="Captured Owner" className="captured-image" />
                        )}
                      </div>
      
                    </div>
                  )}
                </div>
      
              </div>
      )}
    </div>
  );
}

export default ItemScanner;
