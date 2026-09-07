// const BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "https://book-store-frontend-2pz4.onrender.com"
//     : "http://localhost:5000";

// export default BASE_URL;
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://show-hub-backend.onrender.com"
    : "http://localhost:5000");

export default BASE_URL;
