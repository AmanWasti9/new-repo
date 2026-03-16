"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  SearchIcon,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  rowKey?: string;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
  currentPage?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  searchPlaceholder?: string;
  filtersConfig?: {
    key: string;
    label: string;
  }[];
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "No data available",
  rowKey = "id",
  onDelete,
  onCancel,
  showActions = false,
  currentPage = 1,
  total = 0,
  limit = 5,
  onPageChange,
  onLimitChange,
  searchPlaceholder = "Search...",
  filtersConfig,
}) => {
  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  const [globalFilters, setGlobalFilters] = useState<Record<string, string>>(
    {},
  );
  const [openGlobalFilter, setOpenGlobalFilter] = useState(false);

  const processedData = useMemo(() => {
    let result = [...data];

    // Searching
    if (search) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.render
            ? col.render(row[col.key], row)
            : row[col.key];

          return (
            value &&
            value.toString().toLowerCase().includes(search.toLowerCase()) 
          );
        }),
      );
    }

    //filtering
    Object.entries(globalFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => row[key] === value);
      }
    });

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return sortConfig.direction === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    return result;
  }, [data, search, globalFilters, sortConfig, columns]);

  const totalPages = Math.ceil(total / limit);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getUniqueValues = (key: string) => {
    return [...new Set(data.map((row) => row[key]))].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-end p-4">
        <div className="relative flex-1 mr-8">
          <SearchIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
            size={20}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-blue-300 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setOpenGlobalFilter((prev) => !prev)}
            className="px-4 py-2 bg-gray-100 rounded-md flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          {openGlobalFilter && filtersConfig && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50 space-y-4">
              {filtersConfig.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium mb-1">
                    {filter.label}
                  </label>

                  <select
                    value={globalFilters[filter.key] || ""}
                    onChange={(e) =>
                      setGlobalFilters((prev) => ({
                        ...prev,
                        [filter.key]: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">All</option>

                    {getUniqueValues(filter.key).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                onClick={() => setGlobalFilters({})}
                className="w-full text-sm text-red-500 mt-2"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase border-b cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    {column.label}

                    {sortConfig.key === column.key ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
              ))}

              {showActions && (
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase border-b">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {processedData.length > 0 ? (
              processedData.map((row, index) => (
                <tr
                  key={row[rowKey] || index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td
                      key={`${row[rowKey] || index}-${column.key}`}
                      className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}

                  {showActions && (onDelete || onCancel) && (
                    <td className="px-6 py-4 flex gap-2">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row[rowKey])}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {onCancel && (
                        <button
                          onClick={() => onCancel(row[rowKey])}
                          disabled={row.status === "CANCELLED"}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-5 border-t border-gray-200 flex justify-between">
          {/* <p>
            Showing {startItem} to {endItem} of {total} results
          </p> */}
          <div className="flex items-center justify-between p-4">
            <div>
              <label htmlFor="limit" className="mr-2 font-medium">
                Rows per page:
              </label>
              <input
                id="limit"
                type="number"
                min={1}
                value={limit}
                onChange={(e) => onLimitChange?.(parseInt(e.target.value) || 1)}
                className="border rounded px-2 py-1 w-20"
              />
            </div>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
