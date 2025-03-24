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
import { FaFileExcel } from "react-icons/fa"; // Import the Excel icon
import showAlert from '../utils/alert';

function Additem() {
    const [loading, setLoading] = useState(false);
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
  const accessToken = process.env.REACT_APP_ACCESS_TOKEN;
  const pageId = process.env.REACT_APP_pageId ;
  const API_URL = process.env.REACT_APP_API_URL;

  const [time, setTime] = useState(0);
  const [timerId, setTimerId] = useState(null);


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
    POST_ID:'',
    foundation_id:'',
    STATUS: 'unclaimed',
  });

  const [image, setImage] = useState(null); // State to hold the captured image
  const [ownerImage, setOwnerImage] = useState(null); // State to hold the captured owner image
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchItems()
    if (showModal) {
      setTime(0); // Reset timer when modal opens
      const id = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      setTimerId(id);
    } else {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    }
    
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [showModal]);
  
  //NEW FIXED

  const filterRequests = () => {
    if (!filterText) {
      return filteredRequests; // If no filter text, return all filtered requests
    }

    return filteredRequests.filter(request => {
      // Check if request.ITEM is defined before calling toLowerCase
      const itemMatch = request.ITEM && request.ITEM.toLowerCase().includes(filterText.toLowerCase());
      const specificMatch = request.FOUND_LOCATION && request.FOUND_LOCATION.toLowerCase().includes(filterText.toLowerCase());
      const descriptionMatch = request.DESCRIPTION && request.DESCRIPTION.toLowerCase().includes(filterText.toLowerCase());
      return itemMatch || specificMatch || descriptionMatch;
    });
  };

  async function blurImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Allow cross-origin image fetching
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Apply blur effect
            ctx.filter = "blur(10px)"; // Adjust blur intensity as needed
            ctx.drawImage(img, 0, 0);

            // Convert to base64
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = (err) => reject(err);
    });
}
const CACHE_KEY = 'cachedItems';
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // Cache expiration: 5 minutes

const fetchItems = async () => {
    setLoading(true);

    try {
        // Check if cached data exists
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            const now = new Date().getTime();

            // Use cached data if it's still valid
            if (now - timestamp < CACHE_EXPIRATION_MS) {
                setRequests(data);
      
                return;
            }
        }

        // Fetch new data if cache is expired or missing
        const response = await axios.get(`${API_URL}/items`); // ✅ Correct
        
        console.log(process.env);

        // Sort fetched data
        const sortedRequests = response.data.sort((a, b) => {
            const dateA = new Date(`${a.DATE_FOUND}T${a.TIME_RETURNED}`);
            const dateB = new Date(`${b.DATE_FOUND}T${b.TIME_RETURNED}`);
            return dateB - dateA; // Descending order
        });

        // Save sorted data in cache
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: sortedRequests, timestamp: new Date().getTime() }));

        setCurrentPage(1); // Reset to first page
        setRequests(sortedRequests);

    } catch (error) {
        console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }

   setLoading(false);
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "DATE_FOUND" ? new Date(value).toISOString().split("T")[0] : value;

    setItemData({ ...itemData, [name]:  formattedValue,});
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (timerId) {
      clearInterval(timerId); // Stop the timer
      setTimerId(null);
    }
  
    console.log("Final Duration:", time); // Debugging to see if time is correct
  
    setLoading(true);
    let imageUrl = itemData.IMAGE_URL || "";
    let ownerImageUrl = itemData.OWNER_IMAGE || "";
    let postId = selectedItem?.POST_ID || itemData.POST_ID; // ✅ Use POST_ID from database


    if (!selectedItem && !image && !ownerImage) {
        alert('Please capture an image before submitting the form.');
        return;
    }

    try {
        // Upload images to Firebase
        if (image) {
            const imageRef = ref(storage, `FIRI/${Date.now()}.png`);
            await uploadString(imageRef, image, 'data_url');
            imageUrl = await getDownloadURL(imageRef);
        }

        if (ownerImage) {
            const ownerImageRef = ref(storage, `FIRI/owner_${Date.now()}.png`);
            await uploadString(ownerImageRef, ownerImage, 'data_url');
            ownerImageUrl = await getDownloadURL(ownerImageRef);
        }

        // Prepare item data
        const updatedData = { 
            ...itemData, 
            IMAGE_URL: imageUrl, 
            OWNER_IMAGE: ownerImageUrl ,
            DURATION: time // Include duration
        };

        // If updating an existing item
        if (selectedItem) {

          
          console.log("🔄 Updating database for item ID:", selectedItem._id);

      await axios.put(`${API_URL}/items/${selectedItem._id}`, updatedData); // ✅ Correct
          console.log("✅ Database updated successfully!");
          sessionStorage.removeItem('cachedItems');

          // 🚀 Fetch updated data and store in cache again
          await fetchItems();
          showAlert('Item Updated!', 'complaint_success');

          if (postId) { // ✅ Ensure we have a valid POST_ID before updating Facebook
              console.log("🔄 Attempting to update Facebook post...");
              console.log("📌 Using existing POST_ID:", postId);

              const message = `
              ❗❗❗Updated Lost & Found Item❗❗❗
              
              Item Found: ${itemData.ITEM}  
              Location Found: ${itemData.GENERAL_LOCATION}  
              Date Found: ${itemData.DATE_FOUND}  
              Time Received: ${itemData.TIME_RETURNED}  

              For inquiries: SECURITY AND INVESTIGATION DIVISION(SID) MSU-IIT
              Located at Infront of Cafeteria and behind MPH (Multipurpose Hall/Basketball Court)
              `;

              let fbUpdateData = new FormData();
              fbUpdateData.append("message", message);
              fbUpdateData.append("access_token", accessToken);

              try {
                  const fbUpdateResponse = await fetch(`https://graph.facebook.com/v19.0/${postId}`, {
                      method: "POST",
                      body: fbUpdateData,
                  });

                  const fbUpdateResult = await fbUpdateResponse.json();
                  console.log("📡 Facebook API Response:", fbUpdateResult);
                  
                  if (fbUpdateResult.success) {
                      alert("✅ Successfully updated the Facebook post!");
                      console.log("🎉 Facebook post updated successfully!");
                      setLoading(false);
                      setShowModal(false);
               
                  } else {
                      alert("❌ Error updating Facebook post: " + JSON.stringify(fbUpdateResult));
                      console.error("❌ Facebook update error:", fbUpdateResult);
                  }
              } catch (fbError) {
                  console.error("❌ Facebook update request failed:", fbError);
              }
          } else {
              console.log("⚠️ No POST_ID found, skipping Facebook update.");
          }
       
      } else {
            console.log("Form Submitted! Sending request to Facebook...");

            // Construct message
            const message = `
            ❗❗❗Lost & Found Item❗❗❗
            
            Item Found: ${itemData.ITEM}  
            Location Found: ${itemData.GENERAL_LOCATION}  
            Date Found: ${itemData.DATE_FOUND}  
            Time Received: ${itemData.TIME_RETURNED}  

            For inquiries: SECURITY AND INVESTIGATION DIVISION(SID) MSU-IIT
            Located at Infront of Cafeteria and behind MPH (Multipurpose Hall/Basketball Court)
            `;

            // Facebook API setup
    
              

            let formData = new FormData();
            formData.append("message", message);
            formData.append("access_token", accessToken);

            if (imageUrl) {
                formData.append("url", imageUrl);
            }

            try {
                // **Post to Facebook**
                const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
                    method: "POST",
                    body: formData,
                });

                const fbResult = await fbResponse.json();
                console.log("Facebook API Response:", fbResult);

                if (fbResult.post_id) {
                  postId = fbResult.post_id; // ✅ Store the actual post ID for deletion
              } else {
                  console.warn("Warning: No post_id received from Facebook API.");
              }
              
              
            } catch (error) {
                console.error("Error posting to Facebook:", error);
            }

            // **Include Facebook Post ID in Database (Single Request)**
            const finalData = { 
                ...updatedData, 
                POST_ID: postId || null // Store POST_ID even if Facebook fails
            };

            console.log("Final Data to be stored in DB:", finalData);

            // Save to Database (Only ONE Post Request)
            const dbResponse = await axios.post(`${API_URL}/items`, finalData);
            // const response = await axios.post(`${API_URL}/items`, updatedData); // ✅ Correct
            console.log("Database Response:", dbResponse.data);

            setRequests([...requests, dbResponse.data]);
            showAlert('Item Added!', 'complaint_success');

            setShowModal(false);
            sessionStorage.removeItem('cachedItems');

            // 🚀 Fetch updated data and store in cache again
            await fetchItems();
            setLoading(false);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Error submitting form. Please try again.");
    }
    setLoading(false);
    setShowModal(false);

};

const handleDelete = async (id) => {
  sessionStorage.removeItem('cachedItems');

  if (!id) {
      console.log("⚠️ No ID provided. Skipping deletion.");
      return;
  }
setLoading(true);

  try {
    const res = await axios.get(`${API_URL}/items`); // ✅ Correct
      const item = res.data;
      console.log("Fetched item before delete:", item);

      if (!item.POST_ID) {
          console.log("⚠️ No POST_ID found. Skipping Facebook deletion.");
      } else {
          console.log("🗑️ Deleting Facebook post with POST_ID:", item.POST_ID);
          try {
              const response = await fetch(`https://graph.facebook.com/v19.0/${item.POST_ID}?access_token=${accessToken}`, {
                  method: "DELETE",
              });

              if (!response.ok) {
                  throw new Error(`Facebook API error: ${response.status}`);
              }

              console.log(`✅ Successfully deleted Facebook post ${item.POST_ID}`);
          } catch (fbError) {
              console.log("⚠️ Skipping Facebook deletion due to error.");
          }
      }

      console.log("🗑️ Deleting item from database with ID:", id);
      await axios.delete(`${API_URL}/items/${id}`);
      console.log(`✅ Item with ID ${id} deleted from database.`);
      setLoading(false);
      setShowModal(false);
  } catch (error) {
      console.log("❌ Error deleting item:", error);
  }
  fetchItems();
  
};


  const handleDownload = () => {
    const DOWNLOAD_LINK = process.env.REACT_APP_DOWNLOAD_LINK;

    window.open(DOWNLOAD_LINK, "_blank");
  };
  const openModal = (item = null) => {
    setSelectedItem(item);
    setItemData(
      item || {
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
        POST_ID:'',
        TIME_CLAIMED: '',
        foundation_id:'',
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
    if (filters.sortByDate === 'descending') {
      filtered.sort((a, b) => (a.DATE_FOUND || "").localeCompare(b.DATE_FOUND || ""));
    } else if (filters.sortByDate === 'ascending') {
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



  const handleStatusChange = async (item) => {
    const newStatus = item.STATUS === 'unclaimed' ? 'claimed' : 'unclaimed'; // Toggle status
    try {
      await axios.put(`${API_URL}/items/${item._id}`, { ...item, STATUS: newStatus });
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === item._id ? { ...req, STATUS: newStatus } : req
        )
      );

      showAlert('Status Updated', 'complaint_success');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const [viewMode, setViewMode] = useState('table'); // Default to 'table' mode
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'table' ? 'grid' : 'table'));
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

  return (
    <>
    {loading && (
      <div className="loading-overlay">
        <img src="/loadinggif.gif" alt="Loading..." className="loading-gif" />
      </div>
    )}
    <div className="home-container">
      <Sidebar />
      <Header />

      <div className="content">
        <div className="manage-bulletin1">
          <div className="breadcrumb1">Manage Lost and Found {'>'} Manage Found Items</div>




          <div className="search-bar1">
            <input
              type="text"
              placeholder="Search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input1"
            />
            <button onClick={toggleViewMode} className="view-mode-toggle1">
              {viewMode === 'table' ? <FaTable /> : <IoGridOutline />}
            </button>
            <div className="tooltip-contexcel">
              <button
                  className="view-excel-toggle1"
                  onClick={handleDownload} >
                  <FaFileExcel size={30} />


                </button>
                    <span className="tooltip-excel">Download</span>
              

          </div>

          </div>

          <div className="top-right-buttons1">
            
            <button className="add-item-btn1" onClick={() => openModal()}>+ Add Found Item</button>
         
            {/* <button className="register-qr-btn1">Register QR Code</button> */}
          </div>

          <Filter onApplyFilters={applyFilters} />

          {displayedRequests.length === 0 ? (
  <div className="no-data-found">No data found</div>
) :(viewMode === 'table' ? (
            <div className="table-container1">
              <table className="ffound-items-table1">
                <thead>
                  <tr>
                    <th>ITEM NAME</th>
                    <th>Finder</th>
                    <th>Finder Type</th>{/* for visualization */}
                    <th>Item Type</th>{/* for visualization */}
                    <th>Item Description</th>
                    <th>Item Image</th>
                    <th>Finder Contact</th>
                    <th>Date Found</th>
                    <th>General Location</th>{/* for visualization */}
                    <th>Specific Location</th>

                    <th>Time Recieved</th>
                    <th>Owner</th>
                    <th>Owner College</th>{/* for visualization */}
                    <th>Contact</th>
                    <th>Owner Image</th>
                    <th>Date Claimed</th>{/* for visualization */}
                    <th>Time Claimed</th>
                    <th>Status</th>{/* for visualization */}
                    <th>Foundation</th>{/* for visualization */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.map((item) => (
                    <tr key={item._id}>
                      <td>{item.ITEM}</td>
                      <td>{item.FINDER}</td>
                      <td>{item.FINDER_TYPE}</td>
                      <td>{item.ITEM_TYPE}</td>
                      <td>{item.DESCRIPTION}</td>
                      <td><img
                        src={item.IMAGE_URL || 'sad.jpg'}
                        alt="Product"
                        className={`default-table-url11 ${!item.IMAGE_URL ? '.default-table-url1' : ''}`} // Add fallback class conditionally
                        onClick={() => handleImageClick(item.IMAGE_URL || 'sad.jpg')}
                      /></td>
                      <td>{item.CONTACT_OF_THE_FINDER}</td>
                      <td>{item.DATE_FOUND}</td>
                      <td>{item.GENERAL_LOCATION}</td>
                      <td>{item.FOUND_LOCATION}</td>

                      <td>{item.TIME_RETURNED} </td>{/* it supposed to be TIME_RECIEVED */}
                      <td>{item.OWNER}</td>
                      <td>{item.OWNER_COLLEGE}</td>
                      <td>{item.OWNER_CONTACT}</td>
                      <td><img
                        src={item.OWNER_IMAGE || 'sad.jpg'}
                        alt="Product"
                        className={`default-table-url11 ${!item.OWNER_IMAGE ? '.default-table-url1' : ''}`} // Add fallback class conditionally
                        onClick={() => handleImageClick(item.OWNER_IMAGE || 'sad.jpg')} // Add click handler
                      /></td>
                      <td>{item.DATE_CLAIMED}</td>
                      <td>{item.TIME_CLAIMED}</td>
                      <td>
                        <button
                          className={`status-btn1 ${item.STATUS && typeof item.STATUS === 'string' ?
                            (item.STATUS.toLowerCase() === 'unclaimed' ? 'unclaimed' :
                              (item.STATUS.toLowerCase() === 'claimed' ? 'claimed' : 'donated')) : ''} 
      ${item.STATUS && item.STATUS.toLowerCase() === 'donated' ? 'disabled' : ''}`}
      onClick={() => item.STATUS && item.STATUS.toLowerCase() !== 'donated'}

                          disabled={item.STATUS && item.STATUS.toLowerCase() === 'donated'}
                        >
                          {item.STATUS || 'Unclaimed'}
                          <IoMdArrowDropdown className='arrow1' />
                        </button>
                      </td>
                      <td>{item.foundation_id?.foundation_name||'N/A'}</td>
                      <td>
                        <button className="view-btn1" onClick={() => handleViewMore(item)}>
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
              {displayedRequests.map((item) => (
                <div className="grid-item1" key={item._id}>
                  <h2>{item.ITEM}</h2>
                  <img
                    src={item.IMAGE_URL || 'sad.jpg'}
                    alt="Product"
                    className={`default-grid-url11 ${!item.IMAGE_URL ? '.default-grid-url1' : ''}`} // Add fallback class conditionally
                    onClick={() => handleImageClick(item.IMAGE_URL || 'sad.jpg')} // Add click handler
                  />
                  <p><span>Description: </span>{item.DESCRIPTION}</p>
                  <p><span>Finder: </span> {item.FINDER}</p>
                  <p><span>Contact: </span> {item.CONTACT_OF_THE_FINDER}</p>
                  <p><span>Date Found: </span> {item.DATE_FOUND}</p>
                  <p><span>General Location: </span> {item.GENERAL_LOCATION}</p>
                  <p><span>Location: </span> {item.FOUND_LOCATION}</p>
                  <p><span>Time: </span> {item.TIME_RETURNED}</p>
                  <p><span>Owner: </span> {item.OWNER}</p>
                  <p><span>Foundation: </span> {item.foundation_id?.foundation_name}</p>
                  <button
                    className={`status-btn1 ${item.STATUS && typeof item.STATUS === 'string' ?
                      (item.STATUS.toLowerCase() === 'unclaimed' ? 'unclaimed' :
                        (item.STATUS.toLowerCase() === 'claimed' ? 'claimed' : 'donated')) : ''} 
                               ${item.STATUS.toLowerCase() === 'donated' ? 'disabled' : ''}`} // Add 'disabled' class if status is 'donated'
                    onClick={() => item.STATUS.toLowerCase() !== 'donated' && handleStatusChange(item)} // Prevent click if status is 'donated'
                    disabled={item.STATUS.toLowerCase() === 'donated'} // Disable button if status is 'donated'
                  >
                    {item.STATUS || 'Unclaimed'}
                    <IoMdArrowDropdown className='arrow1' />
                  </button>
                  <button className="view-btn1" onClick={() => handleViewMore(item)}>
                    <FaPlus /> View More
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </div>

      <Modal isOpen={imageModalOpen} onClose={handleCloseImageModal} imageUrl={selectedImage} />

      {showModal && (
        <div className="modal-overlay1">
          <div className="modal1">
            <h2>{isViewMore ? (isEditing ? 'Edit Item' : 'View Found Item Details') : 'File a Found Item'}</h2>

            {/* Conditionally render the tab buttons */}
            {!isViewMore || isEditing ? (
              <div className="tabs1">
                <button className={`tab-button1 ${activeTab === 'item' ? 'active' : ''}`} onClick={() => setActiveTab('item')}>Item Details</button>
                <button className={`tab-button1 ${activeTab === 'owner' ? 'active' : ''}`} onClick={() => setActiveTab('owner')}>Owner Details </button>
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
                          <label htmlFor="finderName">Finder Nameedit</label>
                          <input
                            type="text"
                            id="finderName"
                            name="FINDER"
                            maxLength="100"
                            placeholder="Finder Name"
                            value={itemData.FINDER||''}
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
                            value={itemData.FINDER_TYPE||''}
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
                            value={itemData.ITEM||''}
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
                            value={itemData.ITEM_TYPE||''}
                            onChange={handleInputChange}
                            required={!selectedItem}
                          >
                               <option value="">Please select</option>
                               <option value="Electronics">Electronics</option>
                            <option value="Personal Items">Personal Items</option>
                            <option value="Clothing Accessories">Clothing & Accessories</option>
                            <option value="Bags and Stationery">Bags & stationary</option>
                            <option value="Sports and Miscellaneous">Sports & Miscellaneous</option>
                          </select>
                        </div>
                        <div className="form-group1">
                          <label htmlFor="description">Item Description</label>
                          <textarea
                            id="description"
                            name="DESCRIPTION"
                            maxLength="500"
                            placeholder="Description"
                            value={itemData.DESCRIPTION||''}
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
                            value={itemData.CONTACT_OF_THE_FINDER||''}
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
                            value={itemData.GENERAL_LOCATION||''}
                            onChange={handleInputChange}
                          >
                      <option value="Pedestrian & Traffic Zones">Pedestrian & Traffic Zones</option>
                                <option value="INSIDE IIT">INSIDE IIT</option>
                                <option value="Institute Gymnasium Area">Institute Gymnasium Area</option>
                                <option value="COET Area">COET Area</option>
                                <option value="Admission & Admin Offices">Admission & Admin Offices</option>
                                <option value="CHS Area">CHS Area</option>
                                <option value="CSM Area">CSM Area</option>
                                <option value="IDS Area">IDS Area</option>
                                <option value="Food Court Area">Food Court Area</option>
                                <option value="Research Facility">Research Facility</option>
                                <option value="CCS Area">CCS Area</option>
                                <option value="CASS Area">CASS Area</option>
                                <option value="ATM & Banking Area">ATM & Banking Area</option>
                                <option value="Institute Park & Lawn">Institute Park & Lawn</option>
                                <option value="Restrooms (CRs)">Restrooms(CRs)</option>
                                <option value="CEBA Area">CEBA Area</option>
                                <option value="CED Area">CED Area</option>
                                <option value="OUTSIDE IIT">OUTSIDE IIT</option>
                             
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
                            value={itemData.FOUND_LOCATION||''}
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
                            value={itemData.DATE_FOUND||''}
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
                            value={itemData.TIME_RETURNED||''}
                            onChange={handleInputChange}
                            required={!selectedItem}
                          />
                        </div>


                        <div className="form-group1">
                          <label htmlFor="status">Status</label>
                          <select
                            id="status"
                            name="STATUS"
                            value={itemData.STATUS||''}
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
                            value={itemData.OWNER||''}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group1">
                          <label htmlFor="ownerCollege">Owner College</label>
                          <select
                            id="ownerCollege"
                            name="OWNER_COLLEGE"
                            value={itemData.OWNER_COLLEGE||''}
                            onChange={handleInputChange}
                            >
                         <option value="">Please select</option>
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
                            value={itemData.OWNER_CONTACT||''}
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
                            value={itemData.DATE_CLAIMED||''}
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
                            value={itemData.TIME_CLAIMED||''}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group1">
                          <label htmlFor="status">Status</label>
                          <select
                            id="status"
                            name="STATUS"
                            value={itemData.STATUS||'' }
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
                      <button type="button" className="delete-btn1" onClick={() => { handleDelete(selectedItem._id); }}>Delete</button>
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
                  {/* {selectedItem && itemData.IMAGE_URL && !image && (
                      <img src={itemData.IMAGE_URL} alt="Saved" className="captured-image" />
                    )} */}

                  {/* Show the captured image if available */}
                  {/* {image && (
                      <img src={image} alt="Captured" className="captured-image" />
                    )}
                  </div> */}





                  {/* Camera Section for both Item and Owner */}
                  <div className="camera-section">
                    <video ref={videoRef} width="320" height="240" autoPlay   style={{ transform: 'scaleX(-1)' }} />
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
                        <img src={itemData.IMAGE_URL || 'sad.jpg'} alt="Saved" className="captured-image" />
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
                        <img src={itemData.OWNER_IMAGE || 'sad.jpg'} alt="Saved" className="captured-image" />
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
                      <span>{itemData.foundation_id ? itemData.foundation_id.foundation_name : 'No Foundation'}</span>
                    </div>
                  </div>
                  <div className="button-container1">
                    <button className="edit-btn1" onClick={handleEdit}>Edit</button>
                    <button type="button" className="delete-btn1" onClick={() => { handleDelete(selectedItem._id);  }}>Delete</button>
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
                        <label htmlFor="finderName">Finder Name<span className="asterisk3"> *</span></label>
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
                        <label htmlFor="finderType">Finder TYPE submit ni<span className="asterisk3"> *</span></label>  {/* ADD DROP DOWN */}

                        <select
                          id="finderType"
                          name="FINDER_TYPE"

                          placeholder="Finder TYPE"
                          value={itemData.FINDER_TYPE}
                          onChange={handleInputChange}
                          required={!selectedItem}
                          >
                          <option value="">Please select</option>
                          <option value="STUDENT">STUDENT</option>
                          <option value="UTILITIES">UTILITIES</option>
                          <option value="GUARD">GUARD</option>
                          <option value="VISITORS">VISITORS</option>
                        </select>
                      </div>
                      <div className="form-group1">
                        <label htmlFor="itemName">Item Name<span className="asterisk3"> *</span></label>
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
                        <label htmlFor="itemType">ITEM TYPE<span className="asterisk3"> *</span></label>  {/* ADD DROP DOWN */}
                        <select

                          id="itemType"
                          name="ITEM_TYPE"
                          placeholder="Item TYPE"
                          value={itemData.ITEM_TYPE}
                          onChange={handleInputChange}
                          required={!selectedItem}
                          >
                         <option value="">Please select</option>
                         <option value="Electronics">Electronics</option>
                            <option value="Personal Items">Personal Items</option>
                            <option value="Clothing Accessories">Clothing & Accessories</option>
                            <option value="Bags and Stationery">Bags & stationary</option>
                            <option value="Sports and Miscellaneous">Sports & Miscellaneous</option>
                        </select>
                      </div>
                      <div className="form-group1">
                        <label htmlFor="description">Item Description<span className="asterisk3"> *</span></label>
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
                        <label htmlFor="contact">Finder Contact<span className="asterisk3"> *</span></label>
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
                        <label htmlFor="generalLocation">General Location<span className="asterisk3"> *</span></label>  {/* ADD DROP DOWN */}

                        <select
                          id="generalLocation"
                          name="GENERAL_LOCATION"
                          placeholder="General Location"
                          value={itemData.GENERAL_LOCATION}
                          onChange={handleInputChange}
                          required={!selectedItem}
                          >
                        <option value="Pedestrian & Traffic Zones">Pedestrian & Traffic Zones</option>
                        <option value="INSIDE IIT">INSIDE IIT</option>
                                <option value="Institute Gymnasium Area">Institute Gymnasium Area</option>
                                <option value="COET Area">COET Area</option>
                                <option value="Admission & Admin Offices">Admission & Admin Offices</option>
                                <option value="CHS Area">CHS Area</option>
                                <option value="CSM Area">CSM Area</option>
                                <option value="IDS Area">IDS Area</option>
                                <option value="Food Court Area">Food Court Area</option>
                                <option value="Research Facility">Research Facility</option>
                                <option value="CCS Area">CCS Area</option>
                                <option value="CASS Area">CASS Area</option>
                                <option value="ATM & Banking Area">ATM & Banking Area</option>
                                <option value="Institute Park & Lawn">Institute Park & Lawn</option>
                                <option value="Restrooms (CRs)">Restrooms(CRs)</option>
                                <option value="CEBA Area">CEBA Area</option>
                                <option value="CED Area">CED Area</option>
                                <option value="OUTSIDE IIT">OUTSIDE IIT</option>
                             
                        </select>
                      </div>
                      <div className="form-group1">
                        <label htmlFor="location">Specific Location<span className="asterisk3"> *</span></label>
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
                        <label htmlFor="dateFound">Date Found<span className="asterisk3"> *</span></label>
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
                        <label htmlFor="timeReceived">Time Received<span className="asterisk3"> *</span></label>
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
                         <option value="">Please select</option>
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
                    <button type="submit" className="submit-btn1" disabled={!image && !ownerImage} // Disable if no image is captured
    >
      Submit
    </button>
                    {/* delete modal */}

                    <button type="button" className="cancel-btn1" onClick={() => setShowModal(false)}> Cancel </button>
                  </div>
                </form>


                <div className="camera-section">
                  <video ref={videoRef} width="320" height="240" autoPlay   style={{ transform: 'scaleX(-1)' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="camera-buttons">
                    <button type="button" onClick={captureImage}>Capture Imagesubmit</button>
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
    </>
  );
  
}

export default Additem;