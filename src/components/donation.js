import React, { useState, useEffect, useRef } from 'react';
import { FaTable } from "react-icons/fa6";
import { IoGridOutline } from "react-icons/io5";
import { FaSearch, FaFilter } from 'react-icons/fa';
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import Sidebar from "./sidebar";
import '../style/Found.css';
import axios from 'axios';
import { storage } from "../firebase"; // Import Firebase storage
import Pagination from './pagination';
import { ref, uploadBytesResumable, uploadString, getDownloadURL } from "firebase/storage";
import Header from './header';
import Filter from '../filterered/foundFilt'; // Adjust the import path as necessary
import Modal from './image'; // Import the Modal component

import  showAlert from '../utils/alert';

function Foundation() {
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);
 const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewMore, setIsViewMore] = useState(false); // New state to track if modal is for viewing more details
  const itemsPerPage = 10;
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState(''); // State for selected image
  

  const [foundationData, setFoundationData] = useState({
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
    foundation_name:'',
    foundation_image:'',
    foundation_description :'',
    foundation_type:'',
    foundation_link:'',
    foundation_contact:'',
    foundation_start_date:'',
    foundation_end_date:'',
  });

  const [image, setImage] = useState(null); // State to hold the captured image
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchItems();
    if (showModal) {
      // startCamera(); // Start camera when modal is shown
    }
  }, [showModal]);


  //NEW FIXED

  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }
  
    return filteredRequests.filter(request => {
      // Check if request.ITEM is defined before calling toLowerCase
      const foundationName = request.foundation_name ? request.foundation_name.toLowerCase() : '';
      return foundationName.includes(filterText.toLowerCase());
    });
  };


  const fetchItems = async () => {
    try {
      const response = await axios.get('http://10.10.83.224:5000/foundations');
      //10.10.83.224 SID
      //10.10.83.224 BH
      const response2 = await axios.get('http://10.10.83.224:5000/items');
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
    setFoundationData({ ...foundationData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check if adding a new item and no image is captured
//ep 1: Upload the image to Firebase Storage if available


    // Step 2: Update foundationData with the image URL
    const updatedData = { ...foundationData, };

    try {
      if (selectedItem) {
        await axios.put(`http://10.10.83.224:5000/foundations/${selectedItem._id}`, updatedData);
        showAlert('Item Updated!', 'complaint_success');
      } else {
        const response = await axios.post('http://10.10.83.224:5000/foundations', updatedData);
        setRequests([...requests, response.data]);
        showAlert('Item Added!', 'complaint_success');
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
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
          setFoundationData((prev) => ({ ...prev, foundation_image: downloadURL }));
          setImagePreview(downloadURL); // Set the image preview URL to the new image
          setUploading(false);
        }
      );
    };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://10.10.83.224:5000/foundations/${id}`);
        fetchItems();
        showAlert('Item Deleted!', 'complaint_error');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.'); // Alert on error
      }
    }
  };

  const openModal = (foundation = null) => {
    setSelectedItem(foundation);
    setFoundationData(
      foundation || {
        foundation_name:'',
        foundation_image:'',
        foundation_description :'',
        foundation_type:'',
        foundation_link:'',
        foundation_contact:'',
        foundation_start_date:'',
        foundation_end_date:'',
      }
    );
    setImage(null); // Reset the captured image when opening the modal
    setShowModal(true);

    // Reset the view mode and editing state when opening the "Add Found Item" modal
    setIsViewMore(false); // Ensure we are not in view mode
    setIsEditing(false); // Ensure we are not in editing mode
    // startCamera();
  };

  const applyFilters = (filters) => {
    let filtered = [...requests]; // Use a copy of the original requests state
  
    // Apply filters
    if (filters.foundation_type) {
      filtered = filtered.filter(foundation => foundation.foundation_type === filters.foundation_type);
    }
  
    if (filters.foundation_name) {
      filtered = filtered.filter(foundation => foundation.foundation_name === filters.foundation_name);
    }
  
    // if (filters.dateFound) {
    //   filtered = filtered.filter(foundation => foundation.DATE_FOUND === filters.dateFound);
    // }
  
    // if (filters.generalLocation) {
    //   filtered = filtered.filter(foundation => foundation.GENERAL_LOCATION.toLowerCase().includes(filters.generalLocation.toLowerCase()));
    // }
  
    // if (filters.status) {
    //   filtered = filtered.filter(foundation => foundation.STATUS === filters.status);
    // }
  
    // Apply sorting
    // if (filters.sortByDate === 'ascending') {
    //   filtered.sort((a, b) => new Date(a.DATE_FOUND) - new Date(b.DATE_FOUND));
    // } else if (filters.sortByDate === 'descending') {
    //   filtered.sort((a, b) => new Date(b.DATE_FOUND) - new Date(a.DATE_FOUND));
    // }
  
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

 

  const handleStatusChange = async (foundation) => {
    const newStatus = foundation.foundation_type === 'unclaimed' ? 'claimed' : 'unclaimed'; // Toggle status
    try {
      await axios.put(`http://10.10.83.224:5000/foundation/${foundation._id}`, { ...foundation, foundation_type: newStatus });
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === foundation._id ? { ...req, foundation_type: newStatus } : req
        )
      );
  
      showAlert('Status Uodated', 'complaint_success');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const [viewMode, setViewMode] = useState('table'); // Default to 'table' mode
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'table' ? 'grid' : 'table'));
  };






  const handleViewMore = (request) => {
    setSelectedItem(request);
    setFoundationData(request);
    setIsEditing(false); // Ensure we are in view mode
    setIsViewMore(true); // Set to view more mode
    setShowModal(true); // Open modal for viewing more details
    // // Start the camera when viewing more details
    // startCamera();
  };

  const handleEdit = () => {
    setIsEditing(true); // Switch to edit mode
    // startCamera(); // Start the camera when editing
  };

  const handleShow = () => {
    setIsEditing(true); // Switch to edit mode
    // startCamera(); // Start the camera when editing
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
        <div className="manage-bulletin1">
          <div className="breadcrumb1">Manage Lost and Found {'>'} Manage Found Items</div>




          <div className="search-bar1">
            <input
              type="text"
              placeholder="Search Item Name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input1"
            />
            <button onClick={toggleViewMode} className="view-mode-toggle1">
              {viewMode === 'table' ? <FaTable /> : <IoGridOutline />}
            </button>

            
          </div>

          <div className="top-right-buttons1">
              <button className="add-item-btn1" onClick={() => openModal()}>+ Add Foundation</button>
              {/* <button className="register-qr-btn1">Register QR Code</button> */}
            </div>
            
          <Filter onApplyFilters={applyFilters} />

          {viewMode === 'table' ? (
            <div className="table-container1">
              <table className="ffound-items-table1">
                <thead>
                  <tr>
                  <th>Foundation Name</th>
                    <th>Foundation Type</th>
                    <th>Foundation Image</th>{/* for visualization */}
                    <th>Foundation Contact</th>{/* for visualization */}
                    <th>Foundation Description</th>
                    {/* <th>Foundation Link</th>
                    <th>Date Donated</th> */}
                  
                    <th>Status</th>{/* for visualization */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.map((foundation) => (
                    <tr key={foundation._id}>
                      <td>{foundation.foundation_name}</td>
                      <td>{foundation.foundation_type}</td>
                      <td>{foundation.foundation_image}</td>
                      <td>{foundation.foundation_contact}</td>
                      <td>{foundation.foundation_description}</td>
                      {/* <td>{foundation.foundation_link}</td> */}
                      {/* <td><img
                          src={item.IMAGE_URL || "default-image-url1"}
                          alt="Product"
                          className="default-image-url11"
                          onClick={() => handleImageClick(item.IMAGE_URL || "default-image-url1")} // Add click handler
                        /></td> */}
                    
                    
                      {/* <td>{foundation.foundation_start_date}</td>
                      <td>{foundation.foundation_end_date}</td> */}
                      <td>
                        <button
                          className={`status-btn1 ${foundation.foundation_type && typeof foundation.foundation_type === 'string' && foundation.foundation_type.toLowerCase() === 'Ended' ? 'Ongoing' : 'Ended'}`}
                          onClick={() => handleStatusChange(foundation)}
                        >
                          {foundation.foundation_type || 'Ended'}
                          <IoMdArrowDropdown className='arrow1' />
                        </button>
                      </td>
                      <td>
                        <button className="view-btn1" onClick={() => handleViewMore(foundation)}>
                          <FaPlus /> View More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid-container1">
              {displayedRequests.map((foundation) => (
                <div className="grid-item1" key={foundation._id}>
                  <h2>{foundation.foundation_name}</h2>
                  {/* <img
                    src={item.IMAGE_URL || "default-image-url1"}
                    alt="Product"
                    className="default-image-url11"
                    onClick={() => handleImageClick(item.IMAGE_URL || "default-image-url1")} // Add click handler
                  /> */}
                  <p><span>Description: </span>{foundation.foundation_description}</p>
                  <p><span>Type: </span> {foundation.foundation_type}</p>
                  <p><span>Image: </span> {foundation.foundation_image}</p>
                  <p><span>Link: </span> {foundation.foundation_link}</p>
                  <p><span>Contact: </span> {foundation.foundation_contact}</p>
             
                  <p><span>Start DAte: </span> {foundation.foundation_start_date}</p>
                  <p><span>End DAte: </span> {foundation.foundation_end_date}</p>
             
                  <button
                    className={`status-btn1 ${foundation.foundation_type && typeof foundation.foundation_type === 'string' && foundation.foundation_type.toLowerCase() === 'Ended' ? 'Ongoing' : 'Ongoing'}`}
                    onClick={() => handleStatusChange(foundation)}
                  >
                    {foundation.foundation_type|| 'Ongoing'}
                    <IoMdArrowDropdown className='arrow1' />
                  </button>
                  <button className="view-btn1" onClick={() => handleViewMore(foundation)}>
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

      <Modal isOpen={imageModalOpen} onClose={handleCloseImageModal} foundation_image={selectedImage} />

      {showModal && (
        <div className="modal-overlay1">
          <div className="modal1">
            <h2>{isViewMore ? (isEditing ? 'Edit Item' : 'View Found Item Details') : 'File a Found Item'}</h2>

            {/* Wrap form fields and camera in a flex container */}
            {isViewMore ? (
              isEditing ? (
                <div className="form-and-camera">
                  <form onSubmit={handleFormSubmit} className="form-fields">
                    <div className="form-group1">
                      <label htmlFor="foundation_name">Foundation Name</label>
                      <input
                        type="text"
                        id="foundation_name"
                        name="foundation_name"
                        maxLength="100"
                        placeholder="Finder Name"///diari nako
                        value={foundationData.foundation_name}
                        onChange={handleInputChange}
                        required={!selectedItem}
                      />
                    </div>


                    <div className="form-group1">
                      <label htmlFor="foundation_type">Foundation Type</label>  {/* ADD DROP DOWN */}

                      <select
                        id="foundation_type"
                        name="foundation_type"

                        placeholder="Foundation TYPE"
                        value={foundationData.foundation_type}
                        onChange={handleInputChange}
                        required={!selectedItem}
                      >
                        <option value="PubChar">Public Charities</option>
                        <option value="PubChar2">Public Charities2</option>
                  
                      </select>
                    </div>
                    <div className="form-group1">
                      <label htmlFor="foundationDescription">Description</label>
                      <textarea
                
                        id="foundation_description"
                        name="foundation_description"
                        maxLength="100"
                        placeholder="Foundation Description"
                        value={foundationData.foundation_description}
                        onChange={handleInputChange}
                        required={!selectedItem}
                      />
                    </div>
                    <div className="form-group1">
                      <label htmlFor="foundation_link">Foundation Link</label>  {/* ADD DROP DOWN */}
                  <input
                        type="text"
                        id="foundation_link"
                        name="foundation_link"
                        placeholder="Foundation"
                        value={foundationData.foundation_link}
                        onChange={handleInputChange}
                        required={!selectedItem}
                   />
                    </div>
                    {/* <div className="form-group1">
                      <label htmlFor="foundation_description">Item Description</label>
                      <textarea
                        id="foundation_description"
                        name="foundation_description"
                        maxLength="500"
                        placeholder="foundation_description"
                        value={foundationData.foundation_description}
                        onChange={handleInputChange}
                        required={!selectedItem}
                      ></textarea>
                    </div> */}

                    <div className="form-group1">
                      <label htmlFor="foundation_contact">Foundation Contact</label>
                      <input
                        type="text"
                        id="foundation_contact"
                        name="foundation_contact"
                        maxLength="50"
                        placeholder="Contact Number"
                        value={foundationData.foundation_contact}
                        onChange={handleInputChange}
                        required={!selectedItem}
                      />
                    </div>

                    <div className="form-group1">
                  <label htmlFor="foundation_image">Foundation Image</label>
                  <input
                    type="file"
                    id="foundation_image"
                    name="foundation_image"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageUpload(e);
                      setImagePreview(null); // Reset preview when a new file is selected
                    }}
/>
                </div>
                <div className="form-group1">
                    <label htmlFor="description">Start Date</label>
                    <input
                    type="date"
                      id="foundation_start_date"
                      name="foundation_start_date"
                      maxLength="500"
                      placeholder="Foundation Start Date"
                      value={foundationData.foundation_start_date}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>
                  <div className="form-group1">
                    <label htmlFor="description">End Date</label>
                    <input
                    type="date"
                      id="foundation_end_date"
                      name="foundation_end_date"
                      maxLength="500"
                      placeholder="Foundation End Date"
                      value={foundationData.foundation_end_date}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>

                    {/* Buttons inside the form */}
                    <div className="button-container1">
                      <button type="submit" className="submit-btn1">Update</button>
                      {/* delete modal */}
                      <button type="button" className="delete-btn1" onClick={() => { handleDelete(selectedItem._id); setShowModal(false); }}>Delete</button>
                      <button type="button" className="cancel-btn1" onClick={() => { setIsEditing(false); setShowModal(false); }}> Cancel </button>
                    </div>
                  </form>


                  {/* Camera Section on the Right */}
                  {/* <div className="camera-section">
                    <video ref={videoRef} width="320" height="240" autoPlay />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-buttons">
                      <button type="button" onClick={captureImage}>Capture Image</button>
                    </div> */}
                    {/* Show the saved image only when updating an existing item */}
                    {/* {selectedItem && foundationData.IMAGE_URL && !image && (
                      <img src={foundationData.IMAGE_URL} alt="Saved" className="captured-image" />
                    )} */}

                    {/* Show the captured image if available */}
                    {/* {image && (
                      <img src={image} alt="Captured" className="captured-image" />
                    )}
                  </div> */}
              {/* <div className="camera-section">
                    <video ref={videoRef} width="320" height="240" autoPlay />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-buttons">
                      <button type="button" onClick={captureImage}>Capture Image</button>
                    </div>
            
                    {selectedItem && foundationData.foundation_image && !image && (
                      <img src={foundationData.foundation_image} alt="Saved" className="captured-image" />
                    )}

                    {image && (
                      <img src={image} alt="Captured" className="captured-image" />
                    )}
                  </div> */}

                </div>
              ) : (
                <div className="found-details1">
                  <div className="detail-grid1">
                    <div className="detail-item1">
                      <strong>Foundation Name:</strong>
                      <span> {foundationData.foundation_name}</span>
                    </div>
                    <div className="detail-item1">
                      <strong>Foundation Type: </strong>
                      <span> {foundationData.foundation_type}</span>
                    </div>
                    <div className="detail-item1">
                      <strong>Foundation Description:</strong>
                      <span>{foundationData.foundation_description}</span>
                    </div>
                    <div className="detail-item1">
                      <strong>Foundation Link:</strong>
                      <span>{foundationData.foundation_link}</span>
                    </div>
                    <div className="detail-item1">
                      <strong>Foundation Contact:</strong>
                      <span>{foundationData.foundation_contact}</span>
                    </div>
                    {/* <div className="detail-item1">
                      <strong>Foundation image:</strong>

                      {
                        <img src={foundationData.foundation_image} alt="Saved" className="captured-image" />
                      }
                    </div> */}
                  
                  </div>
                  <div className="button-container1">
                    <button className="edit-btn1" onClick={handleEdit}>Edit</button>
                    <button className="edit-btn1" onClick={handleShow}>Show List</button>
                    <button className="cancel-btn1" onClick={() => setShowModal(false)}>Cancel</button>
                  </div>
                </div>
              )
            ) : (
              <div className="form-and-camera">
                <form onSubmit={handleFormSubmit} className="form-fields">
                  <div className="form-group1">
                    <label htmlFor="foundationName">Foundation Name</label>
                    <input
                      type="text"
                      id="finder_name"
                      name="foundation_name"
                      maxLength="100"
                      placeholder="Finder Name"
                      value={foundationData.foundation_name}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>


                  <div className="form-group1">
                    <label htmlFor="finderTye">Foundation Type</label>  {/* ADD DROP DOWN */}

                    <select
                      id="foundation_type"
                      name="foundation_type"

                      placeholder="foundation_type"
                      value={foundationData.foundation_type}
                      onChange={handleInputChange}
                      
                      required={!selectedItem}
                    >    <option value="PubChar">Public Charities</option>
                        <option value="PubChar2">Public Charities2</option>
                    </select>
                  </div>
                  <div className="form-group1">
                    <label htmlFor="foundation_description">Foundation Description</label>
                    <input
                      type="text"
                      id="foundation_description"
                      name="foundation_description"
                      maxLength="100"
                      placeholder="Foundation Description"
                      value={foundationData.foundation_description}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>
                  <div className="form-group1">
                    <label htmlFor="itemType">Foundation Link</label>  {/* ADD DROP DOWN */}
                 <input 
                      type="link"
                      id="foundation_link"
                      name="foundation_link"
                      placeholder="Input Link"
                      value={foundationData.foundation_link}
                      onChange={handleInputChange}
                      required={!selectedItem}
                 />
                  </div>
                  <div className="form-group1">
                    <label htmlFor="description">Foundation Contact</label>
                    <input
                    type="contact"
                      id="foundation_contact"
                      name="foundation_contact"
                      maxLength="500"
                      placeholder="Foundation Contact"
                      value={foundationData.foundation_contact}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>
                  <div className="form-group2">
                  <label htmlFor="foundation_image">Foundation Image</label>
                  <input
                    type="file"
                    id="foundation_image"
                    name="foundation_image"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageUpload(e);
                      setImagePreview(null); // Reset preview when a new file is selected
                    }}
/>
                </div>
                <div className="form-group1">
                    <label htmlFor="description">Start Date</label>
                    <input
                    type="date"
                      id="foundation_start_date"
                      name="foundation_start_date"
                      maxLength="500"
                      placeholder="Foundation Start Date"
                      value={foundationData.foundation_start_date}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>
                  <div className="form-group1">
                    <label htmlFor="description">End Date</label>
                    <input
                    type="date"
                      id="foundation_end_date"
                      name="foundation_end_date"
                      maxLength="500"
                      placeholder="Foundation End Date"
                      value={foundationData.foundation_end_date}
                      onChange={handleInputChange}
                      required={!selectedItem}
                    />
                  </div>

                  {/* Buttons inside the form */}
                  <div className="button-container1">
                    <button type="submit" className="submit-btn1">Submit</button>
                    {/* delete modal */}

                    <button type="button" className="cancel-btn1" onClick={() => setShowModal(false)}> Cancel </button>
                  </div>
                  
                </form>


                {/* Camera Section on the Right */}



              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default Foundation;