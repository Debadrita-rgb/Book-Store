import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AuthHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const privateRoutes = ["/profile", "/my-bookings"];

    const isPrivateRoute = privateRoutes.some((route) =>
      location.pathname.startsWith(route),
    );

    if (!token && isPrivateRoute) {
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return children;
}
