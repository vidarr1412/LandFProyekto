import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Sidebar from "./sidebar";
import '../style/scanner.css';
import axios from 'axios';
import ReactQrScanner from 'react-qr-scanner'; // Import the QR scanner
import emailjs from 'emailjs-com'; // Import EmailJS SDK

function ItemScanner() {
  const [qrData, setQrData] = useState(""); // State to hold the QR code data
  const [userDetails, setUserDetails] = useState({ email: '', firstName: '', lastName: '' }); // State to hold user details
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [message, setMessage] = useState("We found your item uwu"); // State to hold the custom message

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
        <div className="modal-overlaysms">
          <div className="modal-contentsms">
            <h2>Enter Your Message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              
            />
            <div className="modal-buttonssms">
              <button onClick={sendEmail}>Send Email</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemScanner;
