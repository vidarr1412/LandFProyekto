import React from 'react';
import '../style/pagination.css';

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  const maxVisiblePages = 3; // Maximum number of page buttons to display
  const pages = [];

  // Helper function to add a page button
  const addPageButton = (page) => {
    if (page > 0 && page <= totalPages) {
      pages.push(page);
    }
  };

  // Always show the first page
  addPageButton(1);

  // Calculate the range of pages to show
  const halfVisible = Math.floor(maxVisiblePages / 2);

  // Determine the start and end of the range
  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust the start and end pages if there are not enough pages
  if (endPage - startPage < maxVisiblePages - 2) {
    if (startPage === 2) {
      endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2);
    } else if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 2);
    }
  }

  // Add the range of pages
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(i);
  }

  // Always show the last page
  if (totalPages > 1) {
    addPageButton(totalPages);
  }

  // Add ellipses if needed
  // Add ellipses if needed
  if (startPage > 2) {
      pages.splice(1, 0, '...'); // Add ellipsis after the first page
  }
  if (endPage < totalPages - 1) {
      pages.splice(pages.length - 1, 0, '...'); // Add ellipsis before the last page
  }
  
  // In the rendering part
  {pages.map((page, index) => (
      <button
          key={index}
          className={`page-nav1 ${currentPage === page ? 'active' : ''} ${typeof page === 'string' ? 'ellipsis' : ''}`}
          onClick={() => typeof page === 'number' && handlePageChange(page)}
          disabled={typeof page === 'string'} // Disable ellipsis
      >
          {page}
      </button>
  ))}

  return (
    <div className="ppagination1">
      {/* First Page Button */}
      <button
        className="page-nav1"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        First
      </button>

      {/* Numbered Page Buttons */}
      {pages.map((page, index) => (
        <button
          key={index}
          className={`page-nav1 ${currentPage === page ? 'active' : ''}`}
          onClick={() => typeof page === 'number' && handlePageChange(page)}
          disabled={typeof page === 'string'} // Disable ellipsis
        >
          {page}
        </button>
      ))}

      {/* Last Page Button */}
      <button
        className="page-nav1"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;