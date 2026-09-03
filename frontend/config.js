const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://show-hub-backend.onrender.com"
    : "http://localhost:5000";

export default BASE_URL;
