// Filter.js
import React, { useState, useEffect } from 'react';
import '../style/userCompFilt.css';

const Filter = ({ onApplyFilters }) => {
     const [itemType, setItemType] = useState('');
    const [dateLost, setDateLost] = useState(''); // Changed from dateLost to dateFound
    const [generalLocation, setGeneralLocation] = useState('');
    const [sortByDate, setSortByDate] = useState('ascending');
    const [status, setStatus] = useState('');

    // State to keep track of the initial filters for undo functionality
    const [initialFilters, setInitialFilters] = useState({
        dateLost: '',
        generalLocation: '',
        sortByDate: 'ascending',
        status:'',
        itemType:'',
    });

    // Effect to apply filters whenever any filter changes
    useEffect(() => {
        onApplyFilters({  dateLost, generalLocation, status, itemType , sortByDate });
    }, [ dateLost, generalLocation, status , sortByDate, onApplyFilters, itemType]);

    // Effect to set initial filters on mount
    useEffect(() => {
        setInitialFilters({itemType,  generalLocation,  status, dateLost, sortByDate });
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
        <div className="filter-container2">
            <div className="filter-inputs-container2">
                
            <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                    <option value="">Select Item Type</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Personal-Items">Personal Items</option>
                    <option value="Clothing_Accessories">Clothing & Accessories</option>
                    <option value="Bags_Stationery">Bags & Stationery</option>
                    <option value="Documents">Documents</option>
                    <option value="Sports_Miscellaneous">Sports & Miscellaneous</option>
                </select>
               
                <select value={generalLocation} onChange={(e) => setGeneralLocation(e.target.value)}>
                    <option value="">Select General Location</option>
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

                

                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Select Status</option>
                    <option value="found">Found</option>
                    <option value="not-found">Not Found</option>
                </select>

                <div className="tooltip-container2">
                    <div className="column">
                        <input
                        placeholder="Select Date"
                        type="date"
                        id="dateLost"
                        className={dateLost ? 'active-filter2' : ''}
                        value={dateLost}
                        onChange={(e) => setDateLost(e.target.value)}
                        />
                        <span className="tooltip2">Select Report Date</span>
                    </div>

                    <div className="column">
                        <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                        <option value="ascending">Sort by Date (Ascending)</option>
                        <option value="descending">Sort by Date (Descending)</option>
                        </select>
                        <span className="tooltip2">Sort Report Date</span>
                    </div>
                    </div>


                <div className="tooltip-container2">

                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({  itemType,  generalLocation, status, dateLost, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;