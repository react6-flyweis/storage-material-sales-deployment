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
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (safeCurrentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("ellipsis-end");
      pages.push(totalPages);
    } else if (safeCurrentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("ellipsis-start");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("ellipsis-start");
      for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis-end");
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
          type="button"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        {getPages().map((item) =>
          typeof item === "string" ? (
            <span key={item} className="px-2 text-gray-400 select-none">
              ...
            </span>
          ) : (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => onPageChange(item)}
              className={`w-8 h-8 flex items-center justify-center rounded-full font-medium
                ${
                  item === safeCurrentPage
                    ? "bg-[#FF885B] text-white shadow-sm border border-[#FF885B]"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              {item}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          disabled={safeCurrentPage >= totalPages || totalItems === 0}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
