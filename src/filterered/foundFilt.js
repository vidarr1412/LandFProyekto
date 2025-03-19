// Filter.js
import React, { useState, useEffect } from 'react';
import '../style/filtered.css';

const Filter = ({ onApplyFilters }) => {
    const [itemType, setItemType] = useState('');
    const [dateFound, setDateFound] = useState(''); // Changed from dateLost to dateFound
    const [generalLocation, setGeneralLocation] = useState('');
    const [status, setStatus] = useState('');
    const [finderType, setFinderType] = useState(''); // New state for Finder Type
    const [sortByDate, setSortByDate] = useState('ascending');

    // State to keep track of the initial filters for undo functionality
    const [initialFilters, setInitialFilters] = useState({
        itemType: '',
        dateFound: '',
        generalLocation: '',
        status: '',
        finderType: '', // Added Finder Type to initial filters
        sortByDate: 'ascending',
    });

    // Effect to apply filters whenever any filter changes
    useEffect(() => {
        onApplyFilters({ itemType, dateFound, generalLocation, status, finderType, sortByDate });
    }, [itemType, dateFound, generalLocation, status, finderType, sortByDate, onApplyFilters]);

    // Effect to set initial filters on mount
    useEffect(() => {
        setInitialFilters({ itemType, dateFound, generalLocation, status, finderType, sortByDate });
    }, []);

    

    const handleUndoAllChanges = () => {
        setItemType(initialFilters.itemType);
        setDateFound(initialFilters.dateFound);
        setGeneralLocation(initialFilters.generalLocation);
        setStatus(initialFilters.status);
        setFinderType(initialFilters.finderType); // Reset Finder Type
        setSortByDate(initialFilters.sortByDate);
        onApplyFilters(initialFilters);
    };

    return (
        <div className="filter-container">
            <div className="filter-inputs-container">
                <select value={finderType} onChange={(e) => setFinderType(e.target.value)}>
                    <option value="">Select Finder Type</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="UTILITIES">UTILITIES</option>
                    <option value="GUARD">GUARD</option>
                    <option value="VISITORS">VISITORS</option>
                </select>

                <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                    <option value="">Select Item Type</option>
                    <option value="Electronics">Electronics</option>
                            <option value="Personal Items">Personal Items</option>
                            <option value="Clothing Accessories">Clothing & Accessories</option>
                            <option value="Bags and Stationery">Bags & stationary</option>
                            <option value="Sports and Miscellaneous">Sports & Miscellaneous</option>
                </select>

               
                <select value={generalLocation} onChange={(e) => setGeneralLocation(e.target.value)}>
                    <option value="">Select General Location</option>
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

                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Select Status</option>
                    <option value="unclaimed">Unclaimed</option>
                    <option value="claimed">Claimed</option>
                    <option value="donated">Donated</option>
                </select>


                <div className="tooltip-container">
                    <input
                        type="date"
                        id="dateFound"
                        className={dateFound ? 'active-filter' : ''}
                        value={dateFound}
                        onChange={(e) => setDateFound(e.target.value)}
                    />
                    <span className="tooltip">Select Date Found</span>
                </div>

                <div className="tooltip-container">
                <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                    <option value="ascending">Sort by Date (Ascending)</option>
                    <option value="descending">Sort by Date (Descending)</option>
                </select>
                <span className="tooltip">Sort Date Found</span>
                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({ itemType, dateFound, generalLocation, status, finderType, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;