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

                

                <div className="tooltip-container3">
                    <input
                        type="date"
                        id="dateFound"
                        className={dateFound ? 'active-filter3' : ''}
                        value={dateFound}
                        onChange={(e) => setDateFound(e.target.value)}
                    />
                    <span className="tooltip3">Select Date Found</span>
                </div>

                <div className="tooltip-container3">
                <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                    <option value="ascending">Sort by Date (Ascending)</option>
                    <option value="descending">Sort by Date (Descending)</option>
                </select>
                <span className="tooltip3">Sort date Found</span>
                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({ generalLocation, dateFound, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;