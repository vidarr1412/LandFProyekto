// Filter.js
import React, { useState, useEffect } from 'react';
import '../style/retrievalReqFilt.css';

const Filter = ({ onApplyFilters }) => {
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
    });

    // Effect to apply filters whenever any filter changes
    useEffect(() => {
        onApplyFilters({  dateLost, generalLocation, status, sortByDate });
    }, [ dateLost, generalLocation, status , sortByDate, onApplyFilters]);

    // Effect to set initial filters on mount
    useEffect(() => {
        setInitialFilters({  generalLocation,  status, dateLost, sortByDate });
    }, []);

    

    const handleUndoAllChanges = () => {
        setDateLost(initialFilters.dateLost);
        setGeneralLocation(initialFilters.generalLocation);
        setStatus(initialFilters.status);
        setSortByDate(initialFilters.sortByDate);
        onApplyFilters(initialFilters);
    };

    return (
        <div className="filter-container4">
            <div className="filter-inputs-container4">
                
            
               
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="decline">Decline</option>
                </select>


                <div className="tooltip-container4">
                    <input
                        type="date"
                        id="dateLost"
                        className={dateLost ? 'active-filter4' : ''}
                        value={dateLost}
                        onChange={(e) => setDateLost(e.target.value)}
                    />
                    <span className="tooltip4">Select Date Lost</span>
                </div>

                <div className="tooltip-container4">
                <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                    <option value="ascending">Sort by Date (Ascending)</option>
                    <option value="descending">Sort by Date (Descending)</option>
                </select>
                <span className="tooltip4">Sort Date Lost</span>
                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({    generalLocation, status, dateLost, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;