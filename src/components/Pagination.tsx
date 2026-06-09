import React from "react";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize);
  
  // Ensure current page is within bounds
  if (currentPage > totalPages && totalPages > 0) {
    onPageChange(totalPages);
  }

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-t-4 border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-black text-black dark:text-white uppercase">
          Baris per Halaman:
        </label>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1); // Reset to page 1 on size change
          }}
          className="border-2 border-black bg-nb-yellow text-black font-bold px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={0}>Semua</option>
        </select>
      </div>

      {/* Pagination Info & Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-black/70 dark:text-white/70">
          Menampilkan {pageSize === 0 ? totalItems : Math.min(totalItems, (currentPage - 1) * pageSize + 1)} - {pageSize === 0 ? totalItems : Math.min(totalItems, currentPage * pageSize)} dari {totalItems} data
        </span>
        
        {pageSize !== 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="btn-nb bg-white px-3 py-1 text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⬅️ Prev
            </button>
            <span className="text-sm font-black px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="btn-nb bg-white px-3 py-1 text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
