// Filter.js
import React, { useState, useEffect } from 'react';
import '../style/donationFilt.css';

const Filter = ({ onApplyFilters }) => {
   
    const [dateFound, setDateFound] = useState(''); // Changed from dateLost to dateFound
    const [sortByDate, setSortByDate] = useState('ascending');

    // State to keep track of the initial filters for undo functionality
    const [initialFilters, setInitialFilters] = useState({
        dateFound: '',
        sortByDate: 'ascending',
    });

    // Effect to apply filters whenever any filter changes
    useEffect(() => {
        onApplyFilters({  dateFound, sortByDate });
    }, [ dateFound, sortByDate, onApplyFilters]);

    // Effect to set initial filters on mount
    useEffect(() => {
        setInitialFilters({ dateFound, sortByDate });
    }, []);

    

    const handleUndoAllChanges = () => {
        setDateFound(initialFilters.dateFound);
        setSortByDate(initialFilters.sortByDate);
        onApplyFilters(initialFilters);
    };

    return (
        <div className="filter-container7">
            <div className="filter-inputs-container7">
               


                <div className="tooltip-container7">
                    <input
                        type="date"
                        id="dateFound"
                        className={dateFound ? 'active-filter7' : ''}
                        value={dateFound}
                        onChange={(e) => setDateFound(e.target.value)}
                    />
                    <span className="tooltip7">Select Donation Date</span>
                </div>

                <div className="tooltip-container7">
                <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                    <option value="ascending">Sort by Date (Ascending)</option>
                    <option value="descending">Sort by Date (Descending)</option>
                </select>
                <span className="tooltip7">Sort Donation Date</span>
                </div>

                <button onClick={handleUndoAllChanges} disabled={JSON.stringify(initialFilters) === JSON.stringify({  dateFound, sortByDate })}>
                    Undo All Changes
                </button>
            </div>
        </div>
    );
};

export default Filter;