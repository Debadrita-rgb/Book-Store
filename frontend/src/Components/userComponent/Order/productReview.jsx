import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";
import { FaStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductReview = () => {
  const { bookId } = useParams();
    const { state } = useLocation();
const orderId = state?.orderId || null;

  const [book, setBook] = useState(null);

  const [rating, setRating] = useState(0);

  const [title, setTitle] = useState("");

  const [review, setReview] = useState("");

  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookId) return;

    getBook();
  }, [bookId, orderId]);

  const getBook = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // if orderId exists
      
      if (orderId) {
        const res = await axios.get(
          `${BASE_URL}/user/get-single-order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const item = res.data.data.books.find(
          (item) => item.bookId === bookId,
        );

        setBook(item || null);
      }
      
      // if orderId does not exist
      
      else {
        const res = await axios.get(
          `${BASE_URL}/user/get-single-book/${bookId}`,
        );

        setBook(res.data.data || res.data.book || res.data);
      }
    } catch (error) {
      console.error("Get book error:", error);
      toast.error("Failed to load book");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!review.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("bookId", bookId);
      formData.append("rating", rating);
      formData.append("title", title);
      formData.append("review", review);

      if (orderId) {
        formData.append("orderId", orderId);
      }

      // Add multiple images
      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await axios.post(
        `${BASE_URL}/user/submit-review`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message || "Review submitted successfully!");

        setTimeout(() => {
          navigate(`/book/${bookId}`);
        }, 1000);
      }
    } catch (err) {
      console.error("Review error:", err);

      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-semibold mb-2">Product Review</h1>

        <form onSubmit={handleSubmit} className="rounded-xl shadow p-8 mt-6">
          <div className="flex gap-5 mb-6">
            <img
              src={book?.coverImageLink || book?.coverImage}
              alt={book?.title}
              className="w-24 h-32 object-cover rounded"
            />

            <div>
              <h2 className="text-3xl font-semibold">How was the items?</h2>
              <p className="text-xl">{book?.title}</p>

              <div className="flex gap-3 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={40}
                    onClick={() => setRating(star)}
                    className={`cursor-pointer transition-colors ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="font-semibold">Write a Review</label>

            <textarea
              rows="5"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full border rounded-lg mt-2 p-4"
            />
          </div>

          <div className="mt-5">
            <label className="font-semibold">Title</label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg mt-2 p-3"
            />
          </div>

          <div className="mt-5">
            <label className="font-semibold">Photos</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-2"
            />

            {/* Preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Review ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) =>
                          prev.filter((_, imageIndex) => imageIndex !== index),
                        );
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white
                       w-6 h-6 rounded-full text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="mt-8 bg-yellow-400 hover:bg-yellow-500 px-10 py-3 rounded-full">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};
export default ProductReview;
