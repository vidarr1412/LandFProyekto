import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";

const FoundCharts = ({ foundItemsData, timelineInterval, handleIntervalChange, timeInterval }) => {

  // State for charts container visibility
  const [isChartsContainerVisible, setChartsContainerVisible] = useState(false);


  // Prepare data for charts
  const foundItemsByLocation = {};
  const foundItemsByItemType = {};
  const foundItemsByFinderType = {};
  const statusDistribution = { claimed: 0, unclaimed: 0, donated: 0 };
  const timelineData = {};

  foundItemsData.forEach(item => {
    // Check if the necessary properties exist
    if (item.GENERAL_LOCATION) {
      foundItemsByLocation[item.GENERAL_LOCATION] = (foundItemsByLocation[item.GENERAL_LOCATION] || 0) + 1;
    }

    if (item.FINDER_TYPE) {
      foundItemsByFinderType[item.FINDER_TYPE] = (foundItemsByFinderType[item.FINDER_TYPE] || 0) + 1;
    }

    if (item.ITEM_TYPE) {
      foundItemsByItemType[item.ITEM_TYPE] = (foundItemsByItemType[item.ITEM_TYPE] || 0) + 1;
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


  // --------------------------------------------------------------------------------------------------
  // Prepare chart data for Found Items by General Location
  const locationChartData = {
    labels: Object.keys(foundItemsByLocation),
    datasets: [{
      label: 'Found Items by General Location',
      data: Object.values(foundItemsByLocation),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
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
  const itemBarData = {
    labels: Object.keys(foundItemsByItemType),
    datasets: [{
      label: 'Found Items by Item Type',
      data: Object.values(foundItemsByItemType),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
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

  const barGenLocOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'General Locations',
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
          text: 'Number of Found items',
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
            <h3>Found Items by General Location</h3>
            <Bar data={locationChartData} options={barGenLocOptions} />
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
            <h3>Found Items by Item Type</h3>
            <Bar data={itemBarData} options={barItemTypeOptions} />
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
        </>
      )}
    </div>
  );
};

export default FoundCharts;