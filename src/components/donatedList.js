import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "./header"; 
import Sidebar from "./sidebar"; 
import { IoGridOutline } from "react-icons/io5";
import { FaTable } from "react-icons/fa6";
const FoundationItems = () => {
  const { foundationId } = useParams(); // ✅ Extract foundationId from URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState('');
  useEffect(() => {
    if (foundationId) {
      fetchItems();
    }
  }, [foundationId]);
  const [viewMode, setViewMode] = useState('grid'); // Default to 'table' mode
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'table' ? 'grid' : 'table'));
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `http://10.10.83.224:5000/items/foundation/${foundationId}`
      );
      setItems(response.data);
    } catch (error) {
      console.error("❌ Error fetching foundation-specific items:", error);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div>
        
      <h2>Lost and Found Items for Foundation ID: {foundationId}</h2>
      <Header />
<Sidebar />
<div className="search-bar7">
            <input
              type="text"
              placeholder="Search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input7"
            />
            <button onClick={toggleViewMode} className="view-mode-toggle7">
              {viewMode === 'table' ? <FaTable /> : <IoGridOutline />}
            </button>
            </div>
      {loading ? (
        <p>Loading items...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : items.length > 0 ? (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Finder</th>
              <th>Item</th>
              <th>Description</th>
              <th>Finder's Contact</th>
              <th>Date Found</th>
              <th>Found Location</th>
              <th>Status</th>
              <th>Foundation Name</th>
              <th>Foundation Contact</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.FINDER || "N/A"}</td>
                <td>{item.ITEM || "N/A"}</td>
                <td>{item.DESCRIPTION || "N/A"}</td>
                <td>{item.CONTACT_OF_THE_FINDER || "N/A"}</td>
                <td>{item.DATE_FOUND || "N/A"}</td>
                <td>{item.FOUND_LOCATION || "N/A"}</td>
                <td>{item.STATUS || "N/A"}</td>
                <td>{item.foundation_id?.foundation_name || "N/A"}</td>
                <td>{item.foundation_id?.foundation_contact || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items found for this foundation.</p>
      )}
    </div>
  );
};

export default FoundationItems;
