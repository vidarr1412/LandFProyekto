import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./sidebar";
import Header from "./header";
import { storage, db, uploadBytesResumable, getDownloadURL, ref, doc, updateDoc } from "../firebase";
import { QRCodeCanvas } from "qrcode.react";
import "../style/prof.css";
import  showAlert from '../utils/alert';
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
const accessToken = process.env.REACT_APP_ACCESS_TOKEN;
const pageId = process.env.REACT_APP_pageId ;
const API_URL = process.env.REACT_APP_API_URL;
function Profile() {
  const [user, setUser] = useState({
  

  });
  const qrCodeRef = useRef(null); // Reference for QRCodeCanvas
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`${API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          image_Url: data.image_Url || "prof.jpg",
          contactNumber:data.contactNumber||"",
          college:data.college||"",
          year_lvl:data.year_lvl||"",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId, token]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const generateQRCodePDF = () => {
    const canvas = qrCodeRef.current?.querySelector("canvas");
    if (!canvas) {
      alert("QR Code not available!");
      return;
    }
  
    const imageData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
  
    // QR code sizes
    const smallSize = 0.5 * 35.35; // 5 cm converted to PDF points
    const largeSize = 0.5 * 72; // 0.75 inch converted to PDF points
    const margin = 5; // Spacing between QR codes
    const qrPerRow = 7; // 7 QR codes per row
    const totalRows = 8; // 8 rows in total (4 small, 4 large)
  
    let x = margin;
    let y = margin;
    let count = 0;
  
    // First 4 rows: Small QR Codes (5x5 cm)
    for (let i = 0; i < qrPerRow * 4; i++) {
      doc.addImage(imageData, "PNG", x, y, smallSize, smallSize);
      x += smallSize + margin;
      count++;
  
      // Move to the next row after reaching 7 QR codes in a row
      if (count % qrPerRow === 0) {
        x = margin;
        y += smallSize + margin;
      }
    }
  
    // Next 4 rows: Large QR Codes (0.75x0.75 inch)
    for (let i = 0; i < qrPerRow * 4; i++) {
      doc.addImage(imageData, "PNG", x, y, largeSize, largeSize);
      x += largeSize + margin;
      count++;
  
      // Move to the next row after reaching 7 QR codes in a row
      if (count % qrPerRow === 0) {
        x = margin;
        y += largeSize + margin;
      }
    }
  
    doc.save("QRCode_Document.pdf");
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !userId) {
      showAlert('Image Uploaded!', 'complaint_success');
      return;
    }

    const fileName = `${userId}-${selectedFile.name}`;
    const storageRef = ref(storage, `FIRI/prof/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("An error occurred while uploading.");
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          showAlert('Image Uploaded!', 'complaint_success');

          setUser((prev) => ({ ...prev, image_Url: downloadURL }));

          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, { image_Url: downloadURL });
        } catch (error) {
          console.error("Error fetching download URL:", error);
        }
      }
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!userId) {
      showAlert('User ID not found!', 'complaint_error');
      return;
    }

    if (user.password && user.password !== user.confirmPassword) {
      showAlert('Passwors do not match!', 'complaint_error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/update-profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          contactNumber:user.contactNumber,
          image_Url: user.image_Url,
          college:user.college,
          year_lvl:user.year_lvl,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        showAlert('Profile Updated', 'complaint_success');
      } else {
        alert(result.message || "Error updating profile.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating profile.");
    }
  };
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }
  const generateQRValue = (id) => {
    if (!id) return "";
    
    // Encrypt user ID using AES
    const encryptedId = CryptoJS.AES.encrypt(id, "1412").toString();
    
    return `<${encryptedId}>`;
};

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current;
    if (canvas && canvas.querySelector("canvas")) {
      const qrCanvas = canvas.querySelector("canvas");
      const qrWidth = qrCanvas.width;
      const qrHeight = qrCanvas.height;
  
      // Create an off-screen canvas
      const newCanvas = document.createElement("canvas");
      const ctx = newCanvas.getContext("2d");
  
      // Set new canvas size (adding white border)
      const padding = 20; // Adjust for desired border thickness
      newCanvas.width = qrWidth + padding * 2;
      newCanvas.height = qrHeight + padding * 2;
  
      // Fill the background with white
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
  
      // Draw the original QR code onto the new canvas
      ctx.drawImage(qrCanvas, padding, padding);
  
      // Convert to image and download
      const imageURL = newCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = `${userId}-QRCode.png`;
      link.click();
    } else {
      alert("QR Code not available!");
    }
  };
  


  return (
    <div className="home-container1">
      <Sidebar />
      <Header />
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <h2>Profile</h2>
            <img src={user.image_Url} alt="Profile Avatar" className="avatar-image" />
            <h3>{user.firstName} {user.lastName}</h3>
            <input type="file" accept="image/*" id="fileInput" style={{ display: "none" }} onChange={handleImageChange} />
            <button className="change-avatar-button" onClick={() => document.getElementById("fileInput").click()}>
              Choose Avatar
            </button>
            <p>{selectedFile ? selectedFile.name : "No file chosen"}</p>
            <button onClick={handleUpload}>Upload Avatar</button>
          </div>
        </div>

        <div className="profile-form">
          <div className="form-fields">
            <h3>Profile Update</h3>
            <form onSubmit={handleUpdate}>

              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" value={user.contactNumber} onChange={(e) => setUser({ ...user, contactNumber: e.target.value })} />
              </div>

              <div className="form-group">
                <label>College</label>
                <select name="college"
                  placeholder="college"
                  value={user.college}
                  onChange={(e) => setUser({ ...user, college: e.target.value })}   >
                  <option value="">Please Select</option>
                  <option value="coe">COE</option>
                  <option value="ccs">CCS</option>
                  <option value="cass">CASS</option>
                  <option value="csm">CSM</option>
                  <option value="ceba">CEBA</option>
                  <option value="chs">CHS</option>
                  <option value="ced">CED</option>
                </select>
              </div>

              <div className="form-group">
                <label>Year Level</label>
                <select
                  name="year_lvl"
                  value={user.year_lvl || ""}
                  onChange={(e) => setUser({ ...user, year_lvl: e.target.value })}
                >
                  <option value="">Please Select</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Fourth Year">Fourth Year</option>
                </select>


              </div>

              <h3>Change Password</h3>

              <div className="form-group">
                <label>Password (Leave blank to keep current password)</label>
                <input
                  type="password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={user.confirmPassword}
                  onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                />
              </div>


              <div className="boton">
                <div className="qr-container">
                  <h3>QR Code</h3>
                  {userId && (
                    <div ref={qrCodeRef}>
                      <QRCodeCanvas value={generateQRValue(userId)} size={150} />
                    </div>
                  )}
                </div>
                <div className="button-container">
                  <button type="button" onClick={downloadQRCode} className="save-button">Download QR Code</button>
                  <br />
                  <button onClick={generateQRCodePDF} className="save-button">Download QR Codes PDF</button>
                  <br />
                  <button type="submit" className="ssave-button">Update Profile</button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;