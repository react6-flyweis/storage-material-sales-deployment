import React from "react";

type PaginationProps = {
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  rowsPerPage,
  rowsPerPageOptions = [10, 20, 50],
  onPageChange,
  onRowsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const getPages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 text-sm text-gray-500">
      {/* Rows per page */}
      {onRowsPerPageChange ? (
        <div className="flex items-center gap-2">
          <span>Row Per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>Entries</span>
        </div>
      ) : <div />}

      {/* Pagination buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 disabled:opacity-40"
        >
          ‹
        </button>

        {getPages().map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-full font-medium
                ${
                  page === currentPage
                    ? "bg-[#FF885B] text-white shadow-sm border border-[#FF885B]"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
