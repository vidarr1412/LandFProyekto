// Filter.js
import React, { useState, useEffect } from 'react';
import '../style/bulletinBoardFilt.css';

const Filter = ({ onApplyFilters }) => {
    const [dateFound, setDateFound] = useState(''); // Changed from dateLost to dateFound
    const [generalLocation, setGeneralLocation] = useState('');
    const [sortByDate, setSortByDate] = useState('ascending');

    // State to keep track of the initial filters for undo functionality
    const [initialFilters, setInitialFilters] = useState({
        dateFound: '',
        generalLocation: '',
        sortByDate: 'ascending',
    });

    // Effect to apply filters whenever any filter changes
    useEffect(() => {
        onApplyFilters({  generalLocation, dateFound, sortByDate });
    }, [ dateFound, generalLocation, sortByDate, onApplyFilters ]);

    // Effect to set initial filters on mount
    useEffect(() => {
        setInitialFilters({  generalLocation,   dateFound, sortByDate });
    }, []);

    

    const handleUndoAllChanges = () => {
        setDateFound(initialFilters.dateFound);
        setGeneralLocation(initialFilters.generalLocation);
        setSortByDate(initialFilters.sortByDate);
        onApplyFilters(initialFilters);
    };

    return (
        <div className="filter-container3">
            <div className="filter-inputs-container3">
                
               
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

                

                <div className="tooltip-container3">
                    <input
                        type="date"
                        id="dateFound"
                        className={dateFound ? 'active-filter3' : ''}
                        value={dateFound}
                        onChange={(e) => setDateFound(e.target.value)}
                    />
                    <span className="tooltip3">Select Unclaimed Date</span>
                </div>

                <div className="tooltip-container3">
                <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                    <option value="ascending">Sort by Date (Ascending)</option>
                    <option value="descending">Sort by Date (Descending)</option>
                </select>
                <span className="tooltip3">Sort Unclaimed Date</span>
                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({ generalLocation, dateFound, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;