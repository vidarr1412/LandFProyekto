import React, { useState, useEffect } from 'react';
import '../style/filtered.css';

const Filter = ({ onApplyFilters }) => {
    const [itemType, setItemType] = useState('');
    const [dateLost, setDateLost] = useState('');
    const [generalLocation, setGeneralLocation] = useState('');
    const [status, setStatus] = useState('');
    const [sortByDate, setSortByDate] = useState('ascending');

    // State to keep track of the initial filters for undo functionality
    const [initialFilters, setInitialFilters] = useState({
        itemType: '',
        dateLost: '',
        generalLocation: '',
        status: '',
        sortByDate: 'ascending',
    });

    // Effect to apply filters whenever any filter changes
    useEffect(() => {
        onApplyFilters({ itemType, dateLost, generalLocation, status, sortByDate });
    }, [itemType, dateLost, generalLocation, status, sortByDate, onApplyFilters]);

    // Effect to set initial filters on mount
    useEffect(() => {
        setInitialFilters({ itemType, dateLost, generalLocation, status, sortByDate });
    }, []);

    const handleUndoAllChanges = () => {
        setItemType(initialFilters.itemType);
        setDateLost(initialFilters.dateLost);
        setGeneralLocation(initialFilters.generalLocation);
        setStatus(initialFilters.status);
        setSortByDate(initialFilters.sortByDate);
        onApplyFilters(initialFilters);
    };

    return (
        <div className="filter-container">
            <div className="filter-inputs-container">
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
                    <option value="found">Found</option>
                    <option value="not-found">Not Found</option>
                </select>

                <div className="tooltip-container">
                    <input
                        type="date"
                        id="dateLost"
                        className={dateLost ? 'active-filter' : ''}
                        value={dateLost}
                        onChange={(e) => setDateLost(e.target.value)}
                    />
                    <span className="tooltip">Select Date Lost</span>
                </div>

                <div className="tooltip-container">
                <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                    <option value="ascending">Sort by Date (Ascending)</option>
                    <option value="descending">Sort by Date (Descending)</option>
                </select>
                <span className="tooltip">Sort Date Lost</span>
                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({ itemType, dateLost, generalLocation, status, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;