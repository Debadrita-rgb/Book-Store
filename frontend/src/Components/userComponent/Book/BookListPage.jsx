import React, { useEffect, useState } from "react";
import BookSidebar from "./BookSidebar";
import BookCard from "./BookCard";
import axios from "axios";
import BASE_URL from "../../../../config";
// import "./BookCard.css";
import { FaThLarge, FaList } from "react-icons/fa";

const BookListPage = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filters, setFilters] = useState({ category: "", price: 25300 });
  const [viewMode, setViewMode] = useState("grid");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const limit = 12;

  const fetchBooks = async () => {
    try {
      const { category, price } = filters;

      const response = await axios.get(`${BASE_URL}/user/get_books`, {
        params: {
          category: category || undefined,
          maxPrice: price,
          page: currentPage,
          limit,
        },
      });

      setAllBooks(response.data.books);
    setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filters, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="book-page">
      {" "}
      <div className="book-page__hero">
        <h1>Discover your next favorite book</h1>
        <p>
          Browse beautifully curated titles, filter by genre and price, and
          explore the details that matter before you pick your next read.
        </p>
      </div>
      <div className="book-shell">
        <BookSidebar onFilterChange={setFilters} />

        <div className="flex-1">
          {/* Top Bar */}
          <div className="flex justify-end mb-6">
            <div
              className="flex items-center gap-1 rounded-lg p-1"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 rounded transition"
                style={{
                  background:
                    viewMode === "grid" ? "var(--accent)" : "transparent",
                  color: viewMode === "grid" ? "#fff" : "var(--text-secondary)",
                }}
                title="Grid View"
              >
                <FaThLarge size={18} />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded transition"
                style={{
                  background:
                    viewMode === "list" ? "var(--accent)" : "transparent",
                  color: viewMode === "list" ? "#fff" : "var(--text-secondary)",
                }}
                title="List View"
              >
                <FaList size={18} />
              </button>
            </div>
          </div>

          {/* Books */}
          <main
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {allBooks.length > 0 ? (
              allBooks.map((book) => (
                <BookCard key={book._id} book={book} viewMode={viewMode} />
              ))
            ) : (
              <div className="book-state">
                No books found for the selected filters.
              </div>
            )}
          </main>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
          {/* Previous */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            «
          </button>

          {(() => {
            const pages = [];
            const siblings = 1; // pages around current page

            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - siblings && i <= currentPage + siblings)
              ) {
                pages.push(i);
              } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
              }
            }

            return pages.map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page
                      ? "bg-orange-500 text-white"
                      : "border hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ),
            );
          })()}

          {/* Next */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`w-10 h-10 rounded-lg border ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
};

export default BookListPage;
