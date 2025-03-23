import React, { useState, useEffect } from 'react';
import { FaSearch, FaTable } from 'react-icons/fa';
import { storage, db, uploadBytesResumable, getDownloadURL, ref, doc, updateDoc } from "../firebase";
import { FaPlus } from "react-icons/fa6";
import { IoGridOutline } from 'react-icons/io5';
import axios from 'axios';
import Sidebar from './sidebar';
import Header from './header';
import { jwtDecode } from 'jwt-decode';
import Pagination from './pagination';
import '../style/retrievalRequest.css';
import Filter from '../filterered/retrievalReqFilt'; // Adjust the import path as necessary
import Modal from './image'; // Import the Modal component
import  showAlert from '../utils/alert';
const accessToken = process.env.REACT_APP_ACCESS_TOKEN;
const pageId = process.env.REACT_APP_pageId ;
const API_URL = process.env.REACT_APP_API_URL;
function UserRetrievalRequests() {
  
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [itemDetails, setItemDetails] = useState(null); // State to hold item details
  const [showModal, setShowModal] = useState(null); // 'show', 'update', or 'delete'
  const [filteredRequests, setFilteredRequests] = useState([]);
  
  const [imageModalOpen, setImageModalOpen] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState(''); // State for selected image
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    general_location: '',
    specific_location: '',
    date_Lost: '',
    time_Lost: '',
    owner_image: '',
    status: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [showModal]);


  // Function to filter requests based on search text
  // Function to filter requests based on search text
  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }

    return filteredRequests.filter(request =>
      request.item_name.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken); // Check if 'college' exists
      const userId = decodedToken.id;
      if (!userId) {
        console.error("No user ID found.");
        return;
      }

      const response = await axios.get(`${API_URL}/user-retrieval-requests?userId=${userId}`);
      setRequests(Array.isArray(response.data) ? response.data : []);
    
    } catch (error) {
      console.error('Error fetching retrieval requests:', error);
 
    }
  };



  const fetchItemDetails = async (itemId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/items/${itemId}`);
      setItemDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    try {
      await axios.put(`${API_URL}/retrieval-requests/${selectedRequest._id}`, formData);
      fetchRequests();
      showAlert('Complaint Updated!', 'complaint_success');
      closeModal();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/retrieval-requests/${selectedRequest._id}`);
      fetchRequests();
      showAlert('Complaint Deleted!', 'complaint_error');
      setLoading(false);
      closeModal();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const openModal = (type, request) => {
    setShowModal(type);
    setSelectedRequest(request);
    if (type === 'update') {
      setFormData({
        item_name: request.item_name || '',
        description: request.description || '',
        general_location: request.general_location || '',
        specific_location: request.specific_location || '',
        date_Lost: request.date_Lost || '',
        time_Lost: request.time_Lost || '',
        owner_image: request.owner_image || '',
        status: request.status || '',
      });
      setImagePreview(request.owner_image || null); // Set the image preview to the current image
    } else if (type === 'view More') {
      setImagePreview(request.owner_image || null); // Set the image preview for viewing
    }
  };


  const handleRequestSelect = (request) => {
    console.log("Selected Request:", request); // Debugging
    setSelectedRequest(request);
    setShowModal('view More');

    const itemId = request.itemId || request.item_id || request._id; // Adjust based on API response
    if (itemId) {
      fetchItemDetails(itemId);
    } else {
      console.error("No valid itemId found in the request.");
    }
    setLoading(false);
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
        setFormData((prev) => ({ ...prev, owner_image: downloadURL }));
        setImagePreview(downloadURL); // Set the image preview URL
        setUploading(false);
      }
    );
  };

  // const filteredRequests = requests.filter((request) =>
  //   request.item_name?.toLowerCase().includes(filterText.toLowerCase())
  // );

  const toggleViewMode = () => setViewMode(viewMode === 'grid' ? 'table' : 'grid');

  const applyFilters = (filters) => {
    let filtered = [...requests]; // Use a copy of the original requests state


    if (filters.dateLost) {
      filtered = filtered.filter(item => item.date_Lost === filters.dateLost);
    }

    if (filters.generalLocation) {
      filtered = filtered.filter(item => item.general_location.toLowerCase().includes(filters.generalLocation.toLowerCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status.toLowerCase().includes(filters.status.toLowerCase()));
    }


    // Apply sorting
    if (filters.sortByDate === 'ascending') {
      filtered.sort((a, b) => new Date(a.date_Lost) - new Date(b.date_Lost));
    } else if (filters.sortByDate === 'descending') {
      filtered.sort((a, b) => new Date(b.date_Lost) - new Date(a.date_Lost));
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

  const closeModal = () => {
    setShowModal(null);
    setImagePreview(null); // Reset image preview
    setSelectedRequest(null);
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
        <div className="manage-bulletin6">
          <div className="breadcrumb6">Manage Lost and Found {'>'} Manage Request</div>

          <div className="search-bar6">
            <input type="text" placeholder="Search Item Names" value={filterText} onChange={(e) => setFilterText(e.target.value)}
              className="search-input6"
            />
            <button onClick={toggleViewMode} className="view-mode-toggle6">
              {viewMode === 'grid' ? <IoGridOutline /> : <FaTable />}
            </button>
          </div>


          <Filter onApplyFilters={applyFilters} />



          {viewMode === 'table' ? (
            <div className="table-container6">
              <table className="ffound-items-table6">
                <thead>
                  <tr>
                    <th>ITEM NAME</th>
                    <th>Description</th>
                    <th>General Location</th>
                    <th>Specific Location</th>
                    <th>Image</th>
                    <th>Date Lost</th>
                    <th>Time Lost</th>
                    <th>Item Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.item_name || "N/A"}</td>
                      <td>{request.description || "N/A"}</td>
                      <td>{request.general_location || "N/A"}</td>
                      <td>{request.specific_location || "N/A"}</td>
                      <td> <img
                        src={request.owner_image || "default-table-url4"}
                        alt="Product"
                        className="default-table-url14"
                        onClick={() => handleImageClick(request.owner_image || "default-table-url4")} // Add click handler
                      /></td>
                      <td>{request.date_Lost || "N/A"}</td>
                      <td>{request.time_Lost || "N/A"}</td>
                      <td><span className={`status-btn6 ${request.status}`}>{request.status || "N/A"}
                      </span></td>
                      <td>
                        <button className="view-btn6" onClick={() => handleRequestSelect(request)}> <FaPlus /> view More</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (

            <div className="grid-container6">
              {displayedRequests.map((request) => (
                <div className="grid-item6" key={request._id}>
                  <h2>{request.item_name}</h2>
                  <img
                    src={request.owner_image || "default-grid-url4"}
                    alt="Product"
                    className="default-grid-url14"
                    onClick={() => handleImageClick(request.owner_image || "default-image-url4")} // Add click handler
                  />
                  <p><strong>Description: </strong><span>{request.description} </span></p>
                  <p><strong>General Location: </strong><span>{request.general_location} </span></p>
                  <p><strong>Specific Location: </strong><span>{request.specific_location}</span> </p>
                  <p><strong>Date Lost: </strong><span>{request.date_Lost}</span> </p>
                  <p><strong>Time Lost: </strong><span>{request.time_Lost}</span> </p>
                  <p><strong>Item Status:</strong><span className={`status-btn6 ${request.status}`} >{request.status || "N/A"}</span> </p>


                  <button className="view-btn6" onClick={() => handleRequestSelect(request)}>
                    <FaPlus /> View More
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />
      </div>

      <Modal isOpen={imageModalOpen} onClose={handleCloseImageModal} imageUrl={selectedImage} />


      {showModal === 'view More' && selectedRequest && (
        <div className="modal-overlay6">
          <div className="modal6">

            <div className="modal-details6">
              <div className="card6">
                <h2>Item Details</h2>
                <img
                  src={selectedRequest.owner_image || "default-image-url6"}
                  alt="Product"
                  className="default-image-url16"
                />
                <p><strong>Item Name:</strong> {selectedRequest.item_name || "N/A"}</p>
                <p><strong>Description:</strong> {selectedRequest.description || "N/A"}</p>
                <p><strong>General Location:</strong> {selectedRequest.general_location || "N/A"}</p>
                <p><strong>Specific Location:</strong> {selectedRequest.specific_location || "N/A"}</p>
              </div>
              {itemDetails && (
                <div className="card6">
                  <h2>Requests Details</h2>
                  <img
                    src={itemDetails.IMAGE_URL || "default-image-url6"}
                    alt="Product"
                    className="default-image-url16"
                  />
                  <p><strong>Item Type:</strong> {itemDetails.ITEM || "N/A"}</p>
                  <p><strong>Description:</strong> {itemDetails.DESCRIPTION || "N/A"}</p>
                  <p><strong>Finder Contact:</strong> {itemDetails.CONTACT_OF_THE_FINDER || "N/A"}</p>
                  <p><strong>Date Found:</strong> {itemDetails.DATE_FOUND || "N/A"}</p>
                  <p><strong>Found Location:</strong> {itemDetails.FOUND_LOCATION || "N/A"}</p>
                </div>
              )}
            </div>
            <div className="button-container6">
              <button className="update-btn6" onClick={() => openModal('update', selectedRequest)}>Update</button>
              <button className="delete-btn6" onClick={() => openModal('delete', selectedRequest)}>Delete</button>
              <button onClick={closeModal} className="close-btn-manager6">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal with Editable Fields */}
      {showModal === 'update' && selectedRequest && (
        <div className="modal-overlay6">

          <div className="modal66">
            <h2>Edit Request Details</h2>
            <div className="form-and-camera6">

              <form className="form-fields6">
                <div className="form-group6">
                  <label htmlFor="item_name">Item Name</label>
                  <input type="text" name="item_name" value={formData.item_name} onChange={handleInputChange} placeholder="Item Name" />
                </div>
                <div className="form-group6">
                  <label htmlFor="description">Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" />
                </div>
                <div className="form-group6">
                  <label htmlFor="general_location">General Location</label>
                  <input type="text" name="general_location" value={formData.general_location} onChange={handleInputChange} placeholder="General Location" />
                </div>
                <div className="form-group6">
                  <label htmlFor="specific_location">Specific Location</label>
                  <input type="text" name="specific_location" value={formData.specific_location} onChange={handleInputChange} placeholder="Specific Location" />
                </div>
                <div className="form-group6">
                  <label htmlFor="date_Lost">Date Lost</label>
                  <input type="date" name="date_Lost" value={formData.date_Lost} onChange={handleInputChange} />
                </div>
                <div className="form-group6">
                  <label htmlFor="time_Lost">Time Lost</label>
                  <input type="time" name="time_Lost" value={formData.time_Lost} onChange={handleInputChange} />
                </div>
                <div className="form-group6">
                  <label htmlFor="owner_image">Image</label>
                  <input type="file" id="owner_image" name="owner_image" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="button-container6">
                  <button type="button" onClick={handleUpdateRequest} className="update-btn6">Save Changes</button>
                  <button type="button" onClick={closeModal} className="close-btn-manager6">Cancel</button>
                </div>
              </form>

              <div className="camera-section6">
                {/* Image Preview */}
                <div className="image-preview6">
                  {imagePreview && (
                    <>
                      <img src={imagePreview} alt="Uploaded Preview" className="uploaded-image6" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showModal === 'delete' && selectedRequest && (
        <div className="modal-overlay6">
          <div className="modal6">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this request?</p>
            <div className="button-container6">
              <button onClick={handleDeleteRequest} className="delete-btn6">Delete</button>
              <button onClick={closeModal} className="close-btn-manager6">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default UserRetrievalRequests;
