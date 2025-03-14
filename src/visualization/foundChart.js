import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";

const FoundCharts = ({ foundItemsData, timelineInterval, handleIntervalChange, timeInterval, complaintsData, claimingTimelineInterval }) => {

  // State for charts container visibility
  const [isChartsContainerVisible, setChartsContainerVisible] = useState(false);


  // Prepare data for charts
  const foundItemsByFinderType = {};
  const statusDistribution = { claimed: 0, unclaimed: 0, donated: 0 };
  const timelineData = {};
  const itemTypeMatchData = {};

  foundItemsData.forEach(item => {
    // Check if the necessary properties exist


    if (item.FINDER_TYPE) {
      foundItemsByFinderType[item.FINDER_TYPE] = (foundItemsByFinderType[item.FINDER_TYPE] || 0) + 1;
    }



    // Count status distribution
    if (item.STATUS === 'claimed') {
      statusDistribution.claimed += 1;
    } else if (item.STATUS === 'unclaimed') {
      statusDistribution.unclaimed += 1;
    } else if (item.STATUS === 'donated') {
      statusDistribution.donated += 1;
    }

    // Prepare timeline data
    const dateFound = item.DATE_FOUND ? item.DATE_FOUND.split('T')[0] : null; // Check if DATE_FOUND exists
    const dateClaimed = item.DATE_CLAIMED ? item.DATE_CLAIMED.split('T')[0] : null; // Check if DATE_CLAIMED exists

    // Count items found
    timelineData[dateFound] = (timelineData[dateFound] || { found: 0, claimed: 0 });
    timelineData[dateFound].found += 1;

    // Count items claimed
    if (dateClaimed) {
      timelineData[dateClaimed] = (timelineData[dateClaimed] || { found: 0, claimed: 0 });
      timelineData[dateClaimed].claimed += 1;
    }
  });

  // ***************************************************************************************************************
  const locationMatchData = {};

  complaintsData.forEach(complaint => {
    const location = complaint.general_location; // Lost item location
    if (!locationMatchData[location]) {
      locationMatchData[location] = { lost: 0, found: 0 };
    }
    locationMatchData[location].lost += 1;
  });

  foundItemsData.forEach(item => {
    const location = item.GENERAL_LOCATION; // Found item location
    if (!locationMatchData[location]) {
      locationMatchData[location] = { lost: 0, found: 0 };
    }
    locationMatchData[location].found += 1;
  });

  // Compute match percentage per location
  const locationMatchRates = Object.keys(locationMatchData).map(location => {
    const { lost, found } = locationMatchData[location];
    return {
      location,
      lost,
      found,
      matchRate: lost > 0 ? ((found / lost) * 100).toFixed(1) : "N/A", // Match percentage
    };
  });

  // *************************************************************************************************




  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // Extract unique years from data
  const availableYears = [...new Set([...complaintsData, ...foundItemsData].map(item => new Date(item.date || item.DATE_FOUND).getFullYear()))];

  // Handle year & month selection
  const handleYearChange = (e) => setSelectedYear(Number(e.target.value) || null);
  const handleMonthChange = (e) => setSelectedMonth(Number(e.target.value) || null);

  // Function to process data by time
  const processDataByTime = (complaints, foundItems, year, month) => {
    const result = [];

    const filterByDate = (item) => {
      const date = new Date(item.date || item.DATE_FOUND);
      const matchesYear = year ? date.getFullYear() === year : true;
      const matchesMonth = month ? date.getMonth() + 1 === month : true;
      return matchesYear && matchesMonth;
    };

    const lostItems = complaints.filter(filterByDate);
    const foundItemsFiltered = foundItems.filter(filterByDate);

    const itemTypes = [...new Set([...lostItems.map(item => item.ITEM_TYPE), ...foundItemsFiltered.map(item => item.ITEM_TYPE)])];

    itemTypes.forEach(type => {
      const lostCount = lostItems.filter(item => item.type === type).length;
      const foundCount = foundItemsFiltered.filter(item => item.ITEM_TYPE === type).length;
      result.push({ type, lost: lostCount, found: foundCount });
    });

    return result;
  };


  // Automatically filter data when year or month changes
  useEffect(() => {
    setFilteredData(processDataByTime(complaintsData, foundItemsData, selectedYear, selectedMonth));
  }, [selectedYear, selectedMonth, complaintsData, foundItemsData]);

  // Compute recovery rates
  const itemTypeMatchRates = filteredData.map(({ type, lost, found }) => ({
    type,
    lost,
    found,
    recoveryRate: lost > 0 ? ((found / lost) * 100).toFixed(1) : "N/A",
  }));

  // *****************************************************************************************************


  const claimingTimes = {};
  const itemTypeClaimingTimes = {};

  foundItemsData.forEach((item) => {
    // Check if both DATE_FOUND and DATE_CLAIMED are present
    if (item.DATE_FOUND && item.DATE_CLAIMED) {
      const dateFound = new Date(item.DATE_FOUND);
      const dateClaimed = new Date(item.DATE_CLAIMED);

      // Ensure that the claimed date is after the found date
      if (dateClaimed >= dateFound) {
        const daysToClaim = (dateClaimed - dateFound) / (1000 * 60 * 60 * 24); // Convert ms to days

        // Store claiming time by date
        const dateKey = item.DATE_FOUND.split("T")[0]; // Keep only YYYY-MM-DD
        claimingTimes[dateKey] = claimingTimes[dateKey] || [];
        claimingTimes[dateKey].push(daysToClaim);

        // Group by item type
        const itemType = item.ITEM_TYPE;
        itemTypeClaimingTimes[itemType] = itemTypeClaimingTimes[itemType] || [];
        itemTypeClaimingTimes[itemType].push(daysToClaim);
      }
    } else {
      // Optionally handle cases where dates are missing
      console.warn(`Missing dates for item: ${JSON.stringify(item)}`);
    }
  });

  // Compute average claiming time per item type
  const avgClaimingTimes = Object.keys(itemTypeClaimingTimes).map((type) => {
    const total = itemTypeClaimingTimes[type].reduce((a, b) => a + b, 0);
    return {
      type,
      avgDays: (total / itemTypeClaimingTimes[type].length).toFixed(1),
    };
  });



  // --------------------------------------------------------------------------------------------------

  const locationMatchChartData = {
    labels: locationMatchRates.map(data => data.location),
    datasets: [
      {
        label: 'Lost Items',
        data: locationMatchRates.map(data => data.lost),
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red for lost items
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,

      },
      {
        label: 'Found Items',
        data: locationMatchRates.map(data => data.found),
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Blue for found items
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // --------------------------------------------------------------------------------------------------  
  // Prepare chart data for Found Items by Finder Type
  const finderTypeChartData = {
    labels: Object.keys(foundItemsByFinderType),
    datasets: [{
      label: 'Found Items by Finder Type',
      data: Object.values(foundItemsByFinderType),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }],
  };


  // --------------------------------------------------------------------------------------------------
  // Prepare chart data for Status Distribution
  const statusChartData = {
    labels: Object.keys(statusDistribution),
    datasets: [{
      data: Object.values(statusDistribution),
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
    }],
  };


  // --------------------------------------------------------------------------------------------------
  // Prepare timeline data for the chart based on selected interval
  const filteredTimelineData = {};
  Object.keys(timelineData).forEach(date => {
    const dateObj = new Date(date);
    let formattedDate;

    switch (timelineInterval) {
      case 'daily':
        formattedDate = dateObj.toLocaleDateString(); // Format: "MM/DD/YYYY"
        break;
      case 'monthly':
        formattedDate = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' }); // Format: "Month Year"
        break;
      case 'quarterly':
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        formattedDate = `Q${quarter} ${dateObj.getFullYear()}`; // Format: "Q1 2023"
        break;
      case 'yearly':
        formattedDate = dateObj.getFullYear(); // Format: "2023"
        break;
      default:
        formattedDate = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    if (!filteredTimelineData[formattedDate]) {
      filteredTimelineData[formattedDate] = { found: 0, claimed: 0 };
    }

    filteredTimelineData[formattedDate].found += timelineData[date].found;
    filteredTimelineData[formattedDate].claimed += timelineData[date].claimed;
  });

  // Prepare timeline chart data
  const timelineChartData = {
    labels: Object.keys(filteredTimelineData),
    datasets: [
      {
        label: 'Items Found',
        data: Object.values(filteredTimelineData).map(data => data.found),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Items Claimed',
        data: Object.values(filteredTimelineData).map(data => data.claimed),
        fill: false,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  // --------------------------------------------------------------------------------------------------
  // Prepare chart data for Found Items by Item Type



  // Prepare chart data for Lost vs. Found Items by Item Type
  const itemTypeChartData = {
    labels: filteredData.map(data => data.type),
    datasets: [
      {
        label: "Lost Items",
        data: filteredData.map(data => data.lost),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Red for lost items
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Found Items",
        data: filteredData.map(data => data.found),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Blue for found items
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // --------------------------------------------------------------------------------------------------
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = 0.6; // Set alpha value for transparency
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };


  // Prepare stacked bar chart data
  const complaintsByTimeIntervalAndCollege = {};
  foundItemsData.forEach(item => {
    const dateFound = item.DATE_FOUND ? item.DATE_FOUND.split('T')[0] : null;
    const college = item.ITEM_TYPE; // Assuming you have a COLLEGE field in your data
    const dateObj = new Date(dateFound);
    let formattedDate;

    switch (timelineInterval) {
      case 'daily':
        formattedDate = dateObj.toLocaleDateString(); // Format: "MM/DD/YYYY"
        break;
      case 'monthly':
        formattedDate = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' }); // Format: "Month Year"
        break;
      case 'quarterly':
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        formattedDate = `Q${quarter} ${dateObj.getFullYear()}`; // Format: "Q1 2023"
        break;
      case 'yearly':
        formattedDate = dateObj.getFullYear(); // Format: "2023"
        break;
      default:
        formattedDate = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    if (!complaintsByTimeIntervalAndCollege[formattedDate]) {
      complaintsByTimeIntervalAndCollege[formattedDate] = {};
    }

    complaintsByTimeIntervalAndCollege[formattedDate][college] = (complaintsByTimeIntervalAndCollege[formattedDate][college] || 0) + 1;
  });

  // Prepare chart data for stacked bar chart
  const labels = Object.keys(complaintsByTimeIntervalAndCollege);
  const colleges = [...new Set(foundItemsData.map(item => item.ITEM_TYPE))]; // Unique colleges

  const datasets = colleges.map(college => {
    return {
      label: college,
      data: labels.map(label => complaintsByTimeIntervalAndCollege[label][college] || 0), // Count for each time interval
      backgroundColor: getRandomColor(), // You can customize this color
    };
  });


  const stackedBarChartData = {
    labels: labels,
    datasets: datasets,
  };





  // Prepare filtered claiming times based on selected interval
  const filteredClaimingTimes = {};
  Object.keys(claimingTimes).forEach(date => {
    const dateObj = new Date(date);
    let formattedDate;

    switch (claimingTimelineInterval) {
      case 'daily':
        formattedDate = dateObj.toLocaleDateString(); // Format: "MM/DD/YYYY"
        break;
      case 'monthly':
        formattedDate = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' }); // Format: "Month Year"
        break;
      case 'quarterly':
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        formattedDate = `Q${quarter} ${dateObj.getFullYear()}`; // Format: "Q1 2023"
        break;
      case 'yearly':
        formattedDate = dateObj.getFullYear(); // Format: "2023"
        break;
      default:
        formattedDate = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    if (!filteredClaimingTimes[formattedDate]) {
      filteredClaimingTimes[formattedDate] = [];
    }

    filteredClaimingTimes[formattedDate].push(...claimingTimes[date]);
  });

  // Compute average claiming time per selected interval
  const avgClaimingTimelineData = Object.keys(filteredClaimingTimes).map(date => {
    const total = filteredClaimingTimes[date].reduce((a, b) => a + b, 0);
    return {
      date,
      avgDays: (total / filteredClaimingTimes[date].length).toFixed(1),
    };
  });

  /// Prepare chart data for average claiming timeline
  const avgClaimingTimelineChartData = {
    labels: avgClaimingTimelineData.map(data => data.date),
    datasets: [{
      label: 'Average Claiming Time (Days)',
      data: avgClaimingTimelineData.map(data => data.avgDays),
      fill: false,
      borderColor: `hsl(${Math.random() * 360}, 100%, 50%)`, // Random color
      tension: 0.3,
    }],
  };

  // --------------------------------------------------------------------------------------------------
  // Chart options
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };




  const barFinderTypeOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Finder Type',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Found items',
        },
      },
    },
  };


  const barLostFoundItemTypeOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Item Type',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Items',
        },
      },
    },
  };

  const barItemTypeOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Item Type',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Items"',
        },
      },
    },
  };


  const stackedBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Time Intervals',
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Found Item Reports',
        },
      },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Intervals',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Found Items',
        },
      },
    },
  };

  return (
    <div className="charts-container">

      <h2 onClick={() => setChartsContainerVisible(!isChartsContainerVisible)} style={{ cursor: 'pointer' }}>
        FOUND ITEM CHART {isChartsContainerVisible ? '▲' : '▼'}
      </h2>
      {isChartsContainerVisible && (
        <>


          <div className="chart-card">
            <h3>Lost vs. Found Items by General Location</h3>
            <Bar data={locationMatchChartData} options={{
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'General Location' } },
                y: { title: { display: true, text: 'Number of Items' } },
              },
            }} />
          </div>

          <div className="chart-card">
            <h3>Match Rate of Lost and Found Items by Location</h3>
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Lost Items</th>
                  <th>Found Items</th>
                  <th>Match Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {locationMatchRates.map((data, index) => (
                  <tr key={index}>
                    <td>{data.location}</td>
                    <td>{data.lost}</td>
                    <td>{data.found}</td>
                    <td>{data.matchRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-card">
            <h3>Found Items by Finder Type</h3>
            <Bar data={finderTypeChartData} options={barFinderTypeOptions} />
          </div>

          <div className="chart-card">
            <h3>Found Item Status Distribution</h3>
            <Pie data={statusChartData} options={commonOptions} />
          </div>




          <div className="chart-card">
            <h3>Lost vs. Found Items by Item Type</h3>

            {/* Year & Month Selection */}
            <div className="time-interval-container">
              <label htmlFor="timelineInterval">Year:</label>
              <select id="timelineInterval" onChange={handleYearChange} >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <label htmlFor="timelineInterval" >Month:</label>
              <select id="timelineInterval" onChange={handleMonthChange}>
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>


            {/* Bar Chart */}
            <Bar data={itemTypeChartData} options={barItemTypeOptions} />
          </div>

          <div className="chart-card">
            <div className="table-container1">

              <h3>Recovery Rate by Item Type</h3>
              <table className="ffound-items-table1">
                <thead>
                  <tr>
                    <th>Item Type</th>
                    <th>Lost Items</th>
                    <th>Found Items</th>
                    <th>Recovery Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {itemTypeMatchRates.map((data, index) => (
                    <tr key={index}>
                      <td>{data.type}</td>
                      <td>{data.lost}</td>
                      <td>{data.found}</td>
                      <td>{data.recoveryRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="chart-card">
            <h3>Stacked Bar Chart: Found Items by Time Interval and Item Type</h3>
            <div className="time-interval-container">
              <label htmlFor="timelineInterval">Select Time Interval: </label>
              <select id="timelineInterval" value={timeInterval} onChange={handleIntervalChange}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <Bar data={stackedBarChartData} options={stackedBarOptions} />
          </div>

          <div className="chart-card">
            <h3>Timeline: Date Found vs. Date Claimed</h3>
            <div className="time-interval-container">
              <label htmlFor="timelineInterval">Select Time Interval: </label>
              <select id="timelineInterval" value={timelineInterval} onChange={handleIntervalChange}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <Line data={timelineChartData} options={lineOptions} />
          </div>



          <div className="chart-card">
            
              <h3>Found Items Average Claiming Timeline: Date Found vs. Date Claimed</h3>
              <div className="time-interval-container">
                <label htmlFor="claimingTimelineInterval">Select Time Interval: </label>
                <select id="claimingTimelineInterval" value={claimingTimelineInterval} onChange={handleIntervalChange}>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <Line data={avgClaimingTimelineChartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
              <div className="table-container1">
                <h4>Average Claiming Time by Item Type</h4>
                <table className="ffound-items-table1">
                  <thead>
                    <tr>
                      <th>Item Type</th>
                      <th>Average Claiming Time (Days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avgClaimingTimes.map((data, index) => (
                      <tr key={index}>
                        <td>{data.type}</td>
                        <td>{data.avgDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </>
      )}
        </div>
      );
};

      export default FoundCharts;