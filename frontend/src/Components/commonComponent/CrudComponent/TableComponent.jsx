import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaTicketAlt } from "react-icons/fa";

const TableComponent = ({
  title,
  columns,
  data,
  searchTerm,
  setSearchTerm,
  addPath,
  handleToggleActive,
  handleToggleRecommended,
  handleDelete,
  handleChangeStatus,
  handleToggleAvailable,
  showAddButton = true,
  showActiveColumn = true,
  showActionColumn = true,
  showRecommendedeColumn = true,
  showAvailableColumn = true,
  showDeleteButton = true,
  responsiveColumns = [],
  showOrderStatusDropdown = false,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const isColumnVisibleOnSmallScreen = (col) =>
    responsiveColumns.length === 0 || responsiveColumns.includes(col);

  const getColumnClassName = (col, baseClass = "") => {
    const hiddenClass = isColumnVisibleOnSmallScreen(col)
      ? ""
      : "hidden lg:table-cell";
    return `${baseClass} ${hiddenClass}`.trim();
  };

  return (
    <div className="table-card bg-white p-5 rounded shadow-md w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 gap-3">
        {searchTerm !== undefined && setSearchTerm !== undefined && (
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search-input border px-3 py-2 rounded-xl w-48 max-w-full border-black text-black"
          />
        )}
        {showAddButton && (
          <button
            onClick={() => navigate(addPath)}
            className="hover:bg-blue-700 text-white px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: "#1b4c6d" }}
          >
            + Add {title}
          </button>
        )}
      </div>

      <div className="overflow-x-hidden sm:overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="text-white" style={{ backgroundColor: "#1b4c6d" }}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={getColumnClassName(
                    col,
                    "px-4 py-2 border border-gray-200",
                  )}
                >
                  {col}
                </th>
              ))}
              {showAvailableColumn && (
                <th className="px-4 py-2 border border-gray-200">Available</th>
              )}
              {showActiveColumn && (
                <th className="px-4 py-2 border border-gray-200">Active</th>
              )}
              {showRecommendedeColumn && (
                <th className="px-4 py-2 border border-gray-200">
                  Recommended
                </th>
              )}
              {showActionColumn && (
                <th className="px-4 py-2 border border-gray-200">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              currentItems.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-100">
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-4 py-2 border text-gray-500 border-gray-200"
                    >
                      {col === "orderStatus" ? (
                        showOrderStatusDropdown ? (
                          row.orderStatus === "Delivered" ? (
                            <span className="text-green-600 font-semibold">
                              Delivered
                            </span>
                          ) : (
                            <select
                              value={row.orderStatus}
                              onChange={(e) =>
                                handleChangeStatus(row._id, e.target.value)
                              }
                              className="border rounded px-2 py-1"
                            >
                              {row.orderStatus === "Ordered" && (
                                <>
                                  <option value="Ordered">Ordered</option>
                                  <option value="Confirmed">Confirmed</option>
                                </>
                              )}

                              {row.orderStatus === "Confirmed" && (
                                <>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Packed">Packed</option>
                                </>
                              )}

                              {row.orderStatus === "Packed" && (
                                <>
                                  <option value="Packed">Packed</option>
                                  <option value="Shipped">Shipped</option>
                                </>
                              )}

                              {row.orderStatus === "Shipped" && (
                                <>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out For Delivery">
                                    Out For Delivery
                                  </option>
                                </>
                              )}

                              {row.orderStatus === "Out For Delivery" && (
                                <>
                                  <option value="Out For Delivery">
                                    Out For Delivery
                                  </option>
                                  <option value="Delivered">Delivered</option>
                                </>
                              )}
                            </select>
                          )
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold
            ${
              row.orderStatus === "Ordered"
                ? "bg-gray-100 text-gray-700"
                : row.orderStatus === "Confirmed"
                  ? "bg-blue-100 text-blue-700"
                  : row.orderStatus === "Packed"
                    ? "bg-yellow-100 text-yellow-700"
                    : row.orderStatus === "Shipped"
                      ? "bg-purple-100 text-purple-700"
                      : row.orderStatus === "Out For Delivery"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
            }`}
                          >
                            {row.orderStatus}
                          </span>
                        )
                      ) : (
                        (row[col] ?? "--")
                      )}
                    </td>
                  ))}
                  {showAvailableColumn && (
                    <td className="px-4 py-2 text-center border border-gray-200">
                      <input
                        type="checkbox"
                        checked={row.isAvailable}
                        onChange={() =>
                          handleToggleAvailable(row.id, !row.isAvailable)
                        }
                        className="form-radio text-blue-600"
                      />
                    </td>
                  )}
                  {showActiveColumn && (
                    <td className="px-4 py-2 text-center border border-gray-200">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={() =>
                          handleToggleActive(row.id, !row.isActive)
                        }
                        className="form-radio text-blue-600"
                      />
                    </td>
                  )}

                  {showRecommendedeColumn && (
                    <td className="px-4 py-2 text-center border border-gray-200">
                      <input
                        type="checkbox"
                        checked={row.isRecommended}
                        onChange={() =>
                          handleToggleRecommended(row.id, !row.isRecommended)
                        }
                        className="form-radio text-blue-600"
                      />
                    </td>
                  )}

                  {showActionColumn && (
                    <td className="px-4 py-2 border text-center border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        {row.viewPath && (
                          <Link
                            to={row.viewPath}
                            className="text-green-600 hover:text-green-800"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                        )}

                        {row.orderPath && (
                          <Link
                            to={row.orderPath}
                            className="text-purple-600 hover:text-purple-800"
                            title="View Bookings"
                          >
                            <FaTicketAlt />
                          </Link>
                        )}

                        {row.editPath && (
                          <Link
                            to={row.editPath}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                        )}

                        {showDeleteButton && handleDelete && (
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showActiveColumn ? 1 : 0) +
                    (showActionColumn ? 1 : 0)
                  }
                  className="text-center py-4 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex flex-col gap-3 mt-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="hidden lg:flex items-center">
            <span className="ml-2 text-black">Items per page</span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border px-2 py-1 text-black ms-2"
            >
              <option className="text-black" value={5}>
                5
              </option>
              <option className="text-black" value={10}>
                10
              </option>
              <option className="text-black" value={25}>
                25
              </option>
              <option className="text-black" value={50}>
                50
              </option>
              <option className="text-black" value={100}>
                100
              </option>
            </select>
          </div>

          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border text-black"
            >
              {"<"}
            </button>

            <span className="px-2 text-black text-sm">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 border text-black"
            >
              {">"}
            </button>
          </div>

          <div className="text-center text-sm text-black lg:text-left">
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} of{" "}
            {data.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
