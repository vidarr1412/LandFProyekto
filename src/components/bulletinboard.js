import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import '../style/userBulletin.css';

import { storage, db, uploadBytesResumable, getDownloadURL, ref, doc, updateDoc } from "../firebase";
import Sidebar from "./sidebar";
import axios from 'axios';
import { FaTable } from "react-icons/fa6";
import { IoGridOutline } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6"
import Pagination from './pagination';
import { jwtDecode } from 'jwt-decode';
import Header from './header';
import Filter from '../filterered/bulletinBoardFilt'; // Adjust the import path as necessary
import  showAlert from '../utils/alert';


function Bulletin() {
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploading, setUploading] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);



  //for Request
  const [itemData, setItemData] = useState({
    item_name: '',//11
    description: '',//22
    specific_location: '',//33
    general_location: '',//44
    date_Lost: '',//55
    time_Lost: '',//66
    owner_image: '',
    id: '',
    status: 'pending',
  });



  useEffect(() => {
    fetchItems();
  }, []);

  // Function to filter requests based on search text
  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }

    return filteredRequests.filter(request =>
      request.ITEM.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://10.10.83.224:5000/useritems');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Handle modal data changes
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };
  const handleModalSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id; // Get userId from the token
      const claimer_name = `${decodedToken.firstName || ''} ${decodedToken.lastName || ''}`.trim();//user based,
      const contactNumber = decodedToken.contactNumber;//2 user based
      const claimer_college = decodedToken.college;//3 user based
      const claimer_lvl = decodedToken.year_lvl;//4user based
      const now = new Date();
      const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD //5 user based
      const formattedTime = now.toTimeString().split(" ")[0]; // HH:MM:SS //6 user based
      const response = await axios.post('http://10.10.83.224:5000/retrieval-request', {
        claimer_name: claimer_name,//1
        claimer_college: claimer_college,//2
        claimer_lvl: claimer_lvl,//3
        contactNumber: contactNumber,//4
        date_complained: formattedDate,//5
        time_complained: formattedTime,//6

        item_name: itemData.item_name,//11
        description: itemData.description,//22
        general_location: itemData.general_location,//33
        specific_location: itemData.specific_location,//44
        date_Lost: itemData.date_Lost,//55
        time_Lost: itemData.time_Lost,//66
        owner_image: itemData.owner_image,
        id: itemData.id,
        itemId: selectedItem._id, // Assuming you're passing the selected item ID
        userId: userId, // Include userId in the request
        status: itemData.status,
      });

      console.log('Response:', response.data); // Log the response
      showAlert('Retrieve Request Sent!', 'complaint_success');
      // Reset itemData to clear the form fields
      setItemData({
        // item_name: '',//11
        // description: '',//22
        // specific_Location:'',//33
        // general_Location:'',//44
        // date_Lost:'',//55
        // time_Lost:'',//66
        // id: '',

        item_name: '',
        description: '',
        general_location: '',
        specific_location: '',
        date_Lost: '',
        time_Lost: '',
        id: '',
        owner_image: '',
        status: 'pending',
      });

      setShowModal(false); // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting the form:', error); // Log any errors
      alert('Error submitting the form. Please try again.'); // Alert on error
    }
  };


  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0]; // Get the selected file
  //   if (!file) return;

  //   setUploading(true); // Show upload progress

  //   const storageRef = ref(storage, `FIRI/requests/${file.name}`);
  //   const uploadTask = uploadBytesResumable(storageRef, file);

  //   uploadTask.on(
  //     "state_changed",
  //     (snapshot) => {
  //       // Optional: Track upload progress
  //       const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       console.log(`Upload Progress: ${progress}%`);
  //     },
  //     (error) => {
  //       console.error("Upload failed", error);
  //       setUploading(false);
  //     },
  //     async () => {
  //       // Get the download URL after successful upload
  //       const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  //       setItemData((prev) => ({ ...prev, owner_image: downloadURL }));
  //       setUploading(false);
  //     }
  //   );
  // };

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
        showAlert('Image Uploaded!', 'complaint_success');
        setItemData((prev) => ({ ...prev, owner_image: downloadURL }));
        setImagePreview(downloadURL); // Set the image preview URL
        setUploading(false);
      }
    );
  };

  const handleAddComplaint = () => {
    setSelectedRequest(null); // Clear selected request for new complaint
    setItemData({
      item_name: '',
      description: '',
      general_location: '',
      specific_location: '',
      date_Lost: '',
      time_Lost: '',

      status: 'pending',
    });
    setImagePreview(null); // Reset image preview
    setShowModal(true); // Open modal for adding a complaint
  };

  // // Filtered requests based on the filterText
  // const filteredRequests = requests.filter((item) => {
  //   return item.ITEM && item.ITEM.toLowerCase().includes(filterText.toLowerCase());
  // });

  const applyFilters = (filters) => {
    let filtered = [...requests]; // Use a copy of the original requests state


    if (filters.dateFound) {
      filtered = filtered.filter(item => item.DATE_FOUND === filters.dateFound);
    }

    if (filters.generalLocation) {
      filtered = filtered.filter(item => item.GENERAL_LOCATION.toLowerCase().includes(filters.generalLocation.toLowerCase()));
    }


    // Apply sorting
    if (filters.sortByDate === 'ascending') {
      filtered.sort((a, b) => (a.DATE_FOUND || "").localeCompare(b.DATE_FOUND || ""));
    } else if (filters.sortByDate === 'descending') {
      filtered.sort((a, b) => (b.DATE_FOUND || "").localeCompare(a.DATE_FOUND || ""));
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

  // When closing the modal, reset the image preview and item data
  const closeModal = () => {
    setShowModal(false);
    setImagePreview(null); // Reset image preview
    setItemData((prev) => ({ ...prev, owner_image: '' })); // Reset owner_image in itemData
  };



  return (
    <div className="home-container">
      <Sidebar />
      <Header />


      <div className="content">
        <div className="manage-bulletin4">
          <div className="breadcrumb4">Lost and Found {'>'} Bulletin</div>





          <div className="search-bar4">
            <input
              type="text"
              placeholder="Search Item Name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input4"
            />

          </div>

          <Filter onApplyFilters={applyFilters} />


          <div className="grid-container4">
            {displayedRequests.map((item) => (
              <div className="grid-item4" key={item._id}>
                <h2>{item.ITEM}</h2>
                {item.IMAGE_URL && (
                  <img src={item.IMAGE_URL || "default-image-url"} alt="Product" className="item-image4" />
                )}
                <p><span>Date Found: </span> {item.DATE_FOUND}</p>
                <p><span>Location: </span> {item.GENERAL_LOCATION}</p>

                <button className="view-btn4" onClick={() => {
                  setSelectedItem(item);
                  setShowModal(true);
                }}>
                  <FaPlus /> View More
                </button>
              </div>
            ))}
          </div>

        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </div>


      {showModal && (
        <div className="modal-overlay4">
          <div className="modal4">
            <h2>File a Request</h2>
            <div className="form-and-camera4">
              <form onSubmit={handleModalSubmit} className="form-fields4">
                {/* Form fields */}
                <div className="form-group4">
                  <label htmlFor="item_name">Item Name:</label>
                  <input
                    type="text"
                    id="item_name"
                    name="item_name"
                    maxLength="50"
                    placeholder="Item Name"
                    value={itemData.item_name}
                    onChange={handleModalChange}
                    required
                  />
                </div>

                <div className="form-group4">
                  <label htmlFor="description">Description</label>
                  <textarea
                    type="text"
                    id="description"
                    name="description"
                    maxLength="500"
                    placeholder="Description"
                    value={itemData.description}
                    onChange={handleModalChange}
                    required
                  />
                </div>

                <div className="form-group4">
                  <label htmlFor="general_location">General Location</label>
                  <select
                    id="general_location"
                    name="general_location"
                    placeholder="General Location"
                    value={itemData.general_location}
                    onChange={(e) =>
                      setItemData({ ...itemData, general_location: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>Select a location</option>
                    <option value="Gym">GYM</option>
                    <option value="mainLibrary">MAIN LIBRARY</option>
                  </select>
                </div>

                <div className="form-group4">
                  <label htmlFor="specific_location">Specific Location</label>
                  <textarea
                    type="text"
                    id="specific_location"
                    name="specific_location"
                    maxLength="500"
                    placeholder="Specific location"
                    value={itemData.specific_location}
                    onChange={handleModalChange}
                    required
                  />
                </div>

                <div className="form-group4">
                  <label htmlFor="date_Lost">Date Lost</label>
                  <input
                    type="date"
                    id="date_Lost"
                    name="date_Lost"
                    maxLength="500"
                    placeholder="Date Lost"
                    value={itemData.date_Lost}
                    onChange={handleModalChange}
                    required
                  />
                </div>

                <div className="form-group4">
                  <label htmlFor="time_Lost">Time Lost</label>
                  <input
                    type="time"
                    id="time_Lost"
                    name="time_Lost"
                    maxLength="500"
                    placeholder="Time Lost"
                    value={itemData.time_Lost}
                    onChange={handleModalChange}
                    required
                  />
                </div>

                <div className="form-group4">
                  <label htmlFor="owner_image">Image Upload</label>
                  <input
                    type="file"
                    id="owner_image"
                    name="owner_image"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="button-container4">
                <button 
  type="submit" 
  className="submit-btn4"
  disabled={!localStorage.getItem("token")} // Disable if token is missing
>
  Submit
</button>

                  < button
                    type="button"
                    className="cancel-btn4"
                    onClick={closeModal} // Use the closeModal function
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="camera-section4">



                {/* Image Preview */}
                <div className="image-preview4">
                  {imagePreview && (
                    <>

                      <img src={imagePreview} alt="Uploaded Preview" className="uploaded-image4" />
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
}

export default Bulletin;
