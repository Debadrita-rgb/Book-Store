import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import BASE_URL from "../../config";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const getCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);

    const res = await axios.get(`${BASE_URL}/user/cart-count/${decoded.id}`);

    setCartCount(res.data.count);
  };

  const getWishlistCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);

    const res = await axios.get(`${BASE_URL}/user/wishlist-count/${decoded.id}`);

    setWishlistCount(res.data.count);
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        getCartCount,
        wishlistCount,
        setWishlistCount,
        getWishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
