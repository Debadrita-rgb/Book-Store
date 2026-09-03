const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://book-store-frontend-2pz4.onrender.com/"
    : "http://localhost:5000";

export default BASE_URL;
