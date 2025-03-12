// Charts.js
import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from 'react-chartjs-2';

const Charts = ({
  complaintsData,
  timeInterval,
  timelineInterval,
  handleIntervalChange,
}) => {
  // State for charts container visibility
  const [isChartsContainerVisible, setChartsContainerVisible] = useState(false);



  // Prepare data for charts
  const complaintsByCollege = {};
  const complaintsByGeneralLocation = {};
  const complaintsByYearLevel = {};
  const statusDistribution = { found: 0, notFound: 0 };
  const complaintsTimeline = {};

  complaintsData.forEach(complaint => {
    // Complaints by College
    complaintsByCollege[complaint.college] = (complaintsByCollege[complaint.college] || 0) + 1;

    // Complaints by College
    complaintsByGeneralLocation[complaint.general_location] = (complaintsByGeneralLocation[complaint.general_location] || 0) + 1;

    // Complaints by Year Level
    complaintsByYearLevel[complaint.year_lvl] = (complaintsByYearLevel[complaint.year_lvl] || 0) + 1;

    // Status Distribution
    if (complaint.status === 'found') {
      statusDistribution.found += 1;
    } else {
      statusDistribution.notFound += 1;
    }

    // Complaints Timeline
    const dateLost = complaint.date.split('T')[0]; // Assuming date is in ISO format
    const dateComplained = complaint.date_complained.split('T')[0]; // Assuming date_complained is in ISO format

    // Count complaints by date lost
    complaintsTimeline[dateLost] = (complaintsTimeline[dateLost] || { lost: 0, complained: 0 });
    complaintsTimeline[dateLost].lost += 1;

    // Count complaints by date complained
    complaintsTimeline[dateComplained] = (complaintsTimeline[dateComplained] || { lost: 0, complained: 0 });
    complaintsTimeline[dateComplained].complained += 1;
  });

  const statusDistributionData = [
    { name: 'Found', value: statusDistribution.found },
    { name: 'Not Found', value: statusDistribution.notFound },
  ];
  const complaintsByGeneralData = Object.entries(complaintsByGeneralLocation).map(([general_location, count]) => ({ general_location, count }));

  // ********************************************************************************************************

  const complaintsByYearLevelData = Object.entries(complaintsByYearLevel).map(([year, count]) => ({ year, count }));
  const trendLineData = calculateTrendLine(complaintsByYearLevelData);
  // Function to calculate linear regression
  function calculateTrendLine(data) {
    const n = data.length;
    const sumX = data.reduce((sum, _, index) => sum + index, 0); // Sum of indices (0, 1, 2, ...)
    const sumY = data.reduce((sum, item) => sum + item.count, 0); // Sum of counts
    const sumXY = data.reduce((sum, item, index) => sum + index * item.count, 0); // Sum of index * count
    const sumX2 = data.reduce((sum, _, index) => sum + index * index, 0); // Sum of index^2

    // Calculate slope (m) and intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Generate trend line data
    const trendLineData = data.map((_, index) => m * index + b); // Calculate y values for trend line
    return trendLineData; // Return the trend line data
  }




  // *****************************************************************************************************************************
  // Assuming complaintsByCollege is an object where keys are college names and values are complaint counts
  const complaintsByCollegeData = Object.entries(complaintsByCollege).map(([college, count]) => ({ college, count }));

  // Calculate total complaints
  const totalComplaints = complaintsByCollegeData.reduce((total, data) => total + data.count, 0);

  // Create percentage data
  const percentageData = complaintsByCollegeData.map(data => {
    return {
      college: data.college,
      percentage: ((data.count / totalComplaints) * 100).toFixed(2) // Calculate percentage and format to 2 decimal places
    };
  });

  // *************************************************************************************************************************************

  const resolutionTimeRanges = {
    "Same Day (0-6 hours)": 0,
    "1-3 Days": 0,
    "4-7 Days": 0,
    "More than a Week": 0,
  };
  
  complaintsData.forEach(complaint => {
    if (complaint.date && complaint.date_complained) {
      // Combine date and time into a full timestamp
      const lostDateTime = new Date(`${complaint.date}T${complaint.time}`);
      const complainedDateTime = new Date(`${complaint.date_complained}T${complaint.time_complained}`);
  
      // Compute time difference in hours
      const diffHours = Math.abs((complainedDateTime - lostDateTime) / (1000 * 60 * 60)); // Convert ms to hours
  
      if (diffHours <= 6) {
        resolutionTimeRanges["Same Day (0-6 hours)"] += 1;
      } else if (diffHours <= 72) { // 72 hours = 3 days
        resolutionTimeRanges["1-3 Days"] += 1;
      } else if (diffHours <= 168) { // 168 hours = 7 days
        resolutionTimeRanges["4-7 Days"] += 1;
      } else {
        resolutionTimeRanges["More than a Week"] += 1;
      }
    }
  });


  const totalHours = Object.entries(resolutionTimeRanges).reduce((acc, [key, value]) => {
    if (key === "Same Day (0-6 hours)") return acc + value * 3; // Avg ~3 hours
    if (key === "1-3 Days") return acc + value * 24; // Avg ~1 day
    if (key === "4-7 Days") return acc + value * 72; // Avg ~3 days
    if (key === "More than a Week") return acc + value * 168; // Avg ~7 days
    return acc;
  }, 0);

  const totalResolved = Object.values(resolutionTimeRanges).reduce((acc, val) => acc + val, 0);

const avgReportTime = totalResolved ? (totalHours / totalResolved).toFixed(1) : "N/A";

  // ---------------------------------------------------------------  
  // Chart Data for Complaints by College
  const collegeChartData = {
    labels: complaintsByCollegeData.map(data => data.college),
    datasets: [{
      label: 'Complaints by College',
      data: complaintsByCollegeData.map(data => data.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
    {
      label: 'Percentage Distribution',
      data: percentageData.map(data => data.percentage),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }
    ],
  };


  //---------------------------------------------------------------
  // Chart Data for Complaints by Year Level

  const yearLevelChartData = {
    labels: complaintsByYearLevelData.map(data => data.year),
    datasets: [
      {
        label: 'Complaints by Year Level',
        data: complaintsByYearLevelData.map(data => data.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        type: 'bar', // Ensure this dataset is a bar
      },
      {
        label: 'Trend Line',
        data: trendLineData.map((value) => parseFloat(value)), // Ensure trend line data is numerical
        type: 'line', // Specify that this dataset is a line
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false, // Do not fill under the trend line
        tension: 0.1, // Optional: smooth the line
      }
    ],
  };


  //---------------------------------------------------------------
  // Chart Data for Complaint Status Distribution
  const statusChartData = {
    labels: statusDistributionData.map(data => data.name),
    datasets: [{
      data: statusDistributionData.map(data => data.value),
      backgroundColor: ['#36A2EB', '#FF6384'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384'],
    }],
  };

  const resolutionTimeChartData = {
    labels: Object.keys(resolutionTimeRanges),
    datasets: [{
      data: Object.values(resolutionTimeRanges),
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
    }],
  };

  //---------------------------------------------------------------


  const filteredComplaintsTimeline = {};
  Object.keys(complaintsTimeline).forEach(date => {
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

    if (!filteredComplaintsTimeline[formattedDate]) {
      filteredComplaintsTimeline[formattedDate] = { lost: 0, complained: 0 };
    }

    filteredComplaintsTimeline[formattedDate].lost += complaintsTimeline[date].lost;
    filteredComplaintsTimeline[formattedDate].complained += complaintsTimeline[date].complained;
  });

  // Prepare timeline data for the chart
  const timelineChartData = {
    labels: Object.keys(filteredComplaintsTimeline),
    datasets: [
      {
        label: 'Complaints Lost',
        data: Object.values(filteredComplaintsTimeline).map(data => data.lost),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Complaints Filed',
        data: Object.values(filteredComplaintsTimeline).map(data => data.complained),
        fill: false,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };


  //---------------------------------------------------------------
  // Prepare data for the stacked bar chart
  const collegeColors = {
    coe: '#E74C3C', // COE
    ccs: '#87CEEB', // CCS
    cass: '#2ECC71', // CASS
    csm: '#9B59B6', // CSM
    ceba: '#F1C40F', // CEBA
    chs: '#c7f3f6', // CHS
    ced: '#3498DB', // CED
  };

  const complaintsByTimeIntervalAndCollege = {};

  complaintsData.forEach(complaint => {
    const dateComp = new Date(complaint.date_complained);
    let formattedDate;

    switch (timeInterval) {
      case 'daily':
        formattedDate = dateComp.toLocaleDateString(); // Format: "MM/DD/YYYY"
        break;
      case 'monthly':
        formattedDate = dateComp.toLocaleString('default', { month: 'long', year: 'numeric' }); // Format: "Month Year"
        break;
      case 'quarterly':
        const quarter = Math.floor(dateComp.getMonth() / 3) + 1;
        formattedDate = `Q${quarter} ${dateComp.getFullYear()}`; // Format: "Q1 2023"
        break;
      case 'yearly':
        formattedDate = dateComp.getFullYear(); // Format: "2023"
        break;
      default:
        formattedDate = dateComp.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    const college = complaint.college;

    if (!complaintsByTimeIntervalAndCollege[formattedDate]) {
      complaintsByTimeIntervalAndCollege[formattedDate] = {};
    }

    complaintsByTimeIntervalAndCollege[formattedDate][college] = (complaintsByTimeIntervalAndCollege[formattedDate][college] || 0) + 1;
  });

  // Prepare chart data for stacked bar chart
  const labels = Object.keys(complaintsByTimeIntervalAndCollege);
  const colleges = [...new Set(complaintsData.map(complaint => complaint.college))]; // Unique colleges

  const datasets = colleges.map(college => {
    return {
      label: college,
      data: labels.map(label => complaintsByTimeIntervalAndCollege[label][college] || 0), // Count for each time interval
      backgroundColor: collegeColors[college] || 'rgba(200, 200, 200, 0.6)',
    };
  });

  const stackedBarChartData = {
    labels: labels,
    datasets: datasets,
  };


  // -------------------------------------------------------------------
  // Chart Data for Complaints by College
  const generalChartData = {
    labels: complaintsByGeneralData.map(data => data.general_location),
    datasets: [{
      label: 'Complaints by General location',
      data: complaintsByGeneralData.map(data => data.count),
      backgroundColor: 'rgba(192, 132, 75, 0.6)',
      borderColor: 'rgb(192, 173, 75)',
      borderWidth: 1,
    }],
  };


  //--------------LABEL-LABEL------------------------------------------------

  // Chart options with labels
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const barCollegeOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Colleges',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number / Percentage of Complaints',
        },
      },
    },
  };

  const barYearOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year Levels',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Complaints',
        },
      },
    },
    // Allow mixed chart types
    elements: {
      line: {
        tension: 0.1, // Smooth line
      },
    },
  };

  const barStackedOptions = {
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
          text: 'Lost Item Reports',
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
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Complaints',
        },
      },
    },
  };

  const pieOptions = {
    ...commonOptions,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const barGeneralOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'General Location',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Lost Complaints',
        },
      },
    },
  };


  return (
    <div className="charts-container">
      <h2 onClick={() => setChartsContainerVisible(!isChartsContainerVisible)} style={{ cursor: 'pointer' }}>
        LOST COMPLAINT CHART {isChartsContainerVisible ? '▲' : '▼'}
      </h2>
      {isChartsContainerVisible && (
        <>
          <div className="chart-card">
            <h3 >
              Lost Complaints by College
            </h3>
            <Bar data={collegeChartData} options={barCollegeOptions} />
          </div>

          <div className="chart-card">
            <h3>
              Lost Complaints by College Over Time
            </h3>

            <div className="time-interval-container">
              <label htmlFor="timeInterval">Select Time Interval: </label>
              <select id="timeInterval" value={timeInterval} onChange={handleIntervalChange}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <Bar data={stackedBarChartData} options={barStackedOptions} />
          </div>

          <div className="chart-card">
            <h3 >
              Lost Complaints by Year Level
            </h3>
            <Bar data={yearLevelChartData} options={barYearOptions} />
          </div>

          <div className="chart-card">
            <h3 >
              Lost Complaints by General Location
            </h3>
            <Bar data={generalChartData} options={barGeneralOptions} />
          </div>

          <div className="chart-card">
            <h3 >
              Lost Complaint Status Distribution
            </h3>
            <Pie data={statusChartData} options={pieOptions} />
          </div>

          <div className="chart-card">
            <h3>Lost Complaint Resolution Time Distribution</h3>
            <p>⏳ Average Time Before Complaints Are Filed: <strong> {avgReportTime} hours</strong></p>
            <Pie data={resolutionTimeChartData} options={{ responsive: true }} />
          </div>

          <div className="chart-card">
            <h3 >
              Lost Complaints Timeline: Lost Complaint vs. Filed Complained
            </h3>
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

export default Charts;