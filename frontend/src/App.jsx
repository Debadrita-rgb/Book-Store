import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthHandler from "./context/AuthHandler.jsx";
import "./App.css";
import "./theme.css";

//Backend configuration
import AdminLayout from "./Components/admin/adminLayout/adminLayout.jsx";
import AdminDashboard from "./Page/admin_pages/AdminDashboard/AdminDashboard";
import ShowBook from "./Components/admin/Book/showBook";
import Addbook from "./Components/admin/Book/AddBook";

//Category
import AdminCategory from "./Page/admin_pages/Category/viewCategory.jsx";
import AdminAddCategory from "./Page/admin_pages/Category/addCategory.jsx";
import AdmineditCategory from "./Page/admin_pages/Category/editCategory.jsx";

//Book
import AdminBook from "./Page/admin_pages/Book/viewBook.jsx";
import ViewSingleBook from "./Page/admin_pages/Book/viewSingleBook.jsx";
import AdminAddBook from "./Page/admin_pages/Book/addBook.jsx";
import AdminEditBook from "./Page/admin_pages/Book/editBook.jsx";
import BookQuantity from "./Page/admin_pages/Book/addBookQuantity.jsx";

//Book
import AdminOrder from "./Page/admin_pages/Order/viewOrder.jsx";
import AdminViewOrderDetails from "./Page/admin_pages/Order/viewOrderDetails.jsx";

//Language
import AdminLanguage from "./Page/admin_pages/common/Language/viewLanguage.jsx";
import AdminAddLanguage from "./Page/admin_pages/common/Language/addLanguage.jsx";
import AdmineditLanguage from "./Page/admin_pages/common/Language/editLanguage.jsx";

//Coupon
import AdminCoupon from "./Page/admin_pages/common/Coupon/viewCoupon.jsx";
import AdminAddCoupon from "./Page/admin_pages/common/Coupon/addCoupon.jsx";
import AdmineditCoupon from "./Page/admin_pages/common/Coupon/editCoupon.jsx";

//User
import AdminUser from "./Page/admin_pages/User/viewUser.jsx";
import AdminViewUser from "./Page/admin_pages/User/viewUserDetails.jsx";
import AdminViewOrderUserDetails from "./Page/admin_pages/User/viewOrderUserDetails.jsx";

//Transporter
import AdminTransporter from "./Page/admin_pages/Transporter/viewTransporter.jsx";
import AdminViewTransporter from "./Page/admin_pages/Transporter/viewTransporterDetails.jsx";
import AdminAddTransporter from "./Page/admin_pages/Transporter/addTransporter.jsx";
import AdminEditTransporter from "./Page/admin_pages/Transporter/editTransporter.jsx";

//Company
import AdminCompany from "./Page/admin_pages/Company/viewCompany.jsx";
import AdminViewCompany from "./Page/admin_pages/Company/viewCompanyDetails.jsx";
import AdminAddCompany from "./Page/admin_pages/Company/addCompany.jsx";
import AdminEditCompany from "./Page/admin_pages/Company/editCompany.jsx";

// Admin contact
import AdminContact from "./Page/admin_pages/common/Contact/contact.jsx";
import AdminViewContactDetails from "./Page/admin_pages/common/Contact/ViewContactDetails.jsx";


//frontend configuration
import UserLayout from "./Components/userComponent/userLayout/userLayout";
import Home from "./Page/user_pages/Home/Home";
import BookListPage from "./Page/user_pages/Book/Book.jsx";
import About from "./Page/user_pages/About/About";
import Contact from "./Page/user_pages/Contact/Contact";
import BookPreview from "./Components/userComponent/Book/BookPreview.jsx";
import SignUp from "./Page/user_pages/signUp/signUp.jsx";
import SignIn from "./Page/user_pages/signIn/signIn.jsx";
import Cart from "./Page/user_pages/Cart/Cart.jsx";
import Wishlist from "./Page/user_pages/Wishlist/Wishlist.jsx";
import Checkout from "./Page/user_pages/Checkout/Checkout.jsx";
import Address from "./Page/user_pages/Address/Address.jsx";
import AddAddress from "./Components/userComponent/Address/addAddress.jsx";
import EditAddress from "./Components/userComponent/Address/editAddress.jsx";
import Order from "./Page/user_pages/Order/Order.jsx"
import OrderDetails from "./Components/userComponent/Order/orderDetails.jsx";
import ProductReview from "./Components/userComponent/Order/productReview.jsx";
import TrackPackage from "./Components/userComponent/Order/trackPackage.jsx";
import CategorizedBooks from "./Page/user_pages/CategorizedBooks/categorizedBooks.jsx";
import Category from "./Page/user_pages/Category/Category.jsx";
import Profile from "./Page/user_pages/Profile/Profile.jsx";
import UserForgotPassword from "./Page/user_pages/userForgotPassword/userForgotPassword.jsx";

//Transporter configuration
import TransporterLayout from "./Components/transporterComponent/transporterLayout/transporterLayout";
import TransporterDashboard from "./Page/transporter_pages/TransporterDashboard/TransporterDashboard";

//Company Profile
import TransporterProfile from "./Page/transporter_pages/transporterProfile/transporterProfile.jsx"

//order
import TransporterOrder from "./Page/transporter_pages/transporterOrder/viewTransporterOrder.jsx";
import TransporterViewOrderDetails from "./Page/transporter_pages/transporterOrder/viewTransporterOrderDetails.jsx";

//Delivery
import TodaysDeliveries from "./Page/transporter_pages/Delivery/todaysDeliveries.jsx";
import CompletedDeliveries from "./Page/transporter_pages/Delivery/completedDeliveries.jsx";

//Company configuration
import CompanyLayout from "./Components/companyComponent/companyLayout/companyLayout";
import CompanyDashboard from "./Page/company_pages/companyDashboard/companyDashboard.jsx";

//Company Profile
import CompanyProfile from "./Page/company_pages/companyProfile/companyProfile.jsx"

//transporter from company
import CompanyTransporter from "./Page/company_pages/CompanyTransporter/viewCompanyTransporter.jsx";
import CompanyViewTransporter from "./Page/company_pages/CompanyTransporter/viewCompanyTransporterDetails.jsx";
import CompanyAddTransporter from "./Page/company_pages/CompanyTransporter/addCompanyTransporter.jsx";
import CompanyEditTransporter from "./Page/company_pages/CompanyTransporter/editCompanyTransporter.jsx";

//order from company
import CompanyOrder from "./Page/company_pages/CompanyOrder/viewCompanyOrder.jsx";
import CompanyViewOrderDetails from "./Page/company_pages/CompanyOrder/viewCompanyOrderDetails.jsx";


//login page
import LoginPage from "./Page/LoginPage/LoginPage";
import ForgotPassword from "./Page/forgotPassword/forgotPassword.jsx";

function App() {
  // const [count, setCount] = useState(0)
  const { loading, isAuthenticated, role } = useAuth();
  if (loading) return <div>Loading...</div>;

  return (
    <>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <AuthHandler>
          <Routes>
            <Route path="/backend" element={<LoginPage />} />
            <Route
              path="/backend/forgot-password"
              element={<ForgotPassword />}
            />
            {isAuthenticated && role === "admin" && (
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="show-book" element={<ShowBook />} />
                <Route path="add-book" element={<Addbook />} />
                {/* Category Routes */}
                <Route path="view-all-category" element={<AdminCategory />} />
                <Route path="add-category" element={<AdminAddCategory />} />
                <Route
                  path="edit-category/:id"
                  element={<AdmineditCategory />}
                />
                {/* Book Routes */}
                <Route path="view-all-book" element={<AdminBook />} />
                <Route path="view-single-book/:id" element={<ViewSingleBook />} />
                <Route path="addBook" element={<AdminAddBook />} />
                <Route path="editBook/:id" element={<AdminEditBook />} />
                <Route path="addBookQuantity" element={<BookQuantity />} />
                {/* Order Routes */}
                <Route path="view-all-orders" element={<AdminOrder />} />
                <Route
                  path="view-order-details/:id"
                  element={<AdminViewOrderDetails />}
                />
                {/* Language */}
                <Route path="view-all-language" element={<AdminLanguage />} />
                <Route path="add-language" element={<AdminAddLanguage />} />
                <Route
                  path="edit-language/:id"
                  element={<AdmineditLanguage />}
                />
                {/* User */}
                <Route path="view-all-user" element={<AdminUser />} />
                <Route
                  path="view-single-user/:id"
                  element={<AdminViewUser />}
                />
                <Route
                  path="view-ordered-single-user/:id"
                  element={<AdminViewOrderUserDetails />}
                />

                {/* Transporter */}
                <Route
                  path="view-all-transporter"
                  element={<AdminTransporter />}
                />
                <Route
                  path="view-single-transporter/:id"
                  element={<AdminViewTransporter />}
                />
                <Route
                  path="add-transporter"
                  element={<AdminAddTransporter />}
                />
                <Route
                  path="edit-transporter/:id"
                  element={<AdminEditTransporter />}
                />
                {/* Company */}
                <Route path="view-all-company" element={<AdminCompany />} />
                <Route
                  path="view-single-company/:id"
                  element={<AdminViewCompany />}
                />
                <Route path="add-company" element={<AdminAddCompany />} />
                <Route path="edit-company/:id" element={<AdminEditCompany />} />
                {/* Coupon */}
                <Route path="view-all-coupon" element={<AdminCoupon />} />
                <Route path="viewCoupon" element={<AdminCoupon />} />
                <Route path="add-coupon" element={<AdminAddCoupon />} />
                <Route path="edit-coupon/:id" element={<AdmineditCoupon />} />
                {/* AdminContact */}
                <Route path="view-contact" element={<AdminContact />} />
                <Route
                  path="view-contact-details/:id"
                  element={<AdminViewContactDetails />}
                />
              </Route>
            )}
            <Route path="/transporter" element={<LoginPage />} />

            {/* Transporter Routes inside TransporterLayout */}
            {isAuthenticated && role === "transporter" && (
              <Route path="/transporter" element={<TransporterLayout />}>
                <Route path="dashboard" element={<TransporterDashboard />} />
                <Route path="profile" element={<TransporterProfile />} />
                <Route
                  path="view-all-orders-by-transporter"
                  element={<TransporterOrder />}
                />
                <Route
                  path="view-transporter-order-details/:id"
                  element={<TransporterViewOrderDetails />}
                />
                <Route path="today-deliveries" element={<TodaysDeliveries />} />
                <Route
                  path="completed-deliveries"
                  element={<CompletedDeliveries />}
                />
              </Route>
            )}

            {/* Company Routes inside CompanyLayout */}
            {isAuthenticated && role === "company" && (
              <Route path="/company" element={<CompanyLayout />}>
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route
                  path="view-all-transporter-by-company"
                  element={<CompanyTransporter />}
                />
                <Route
                  path="view-company-transporter-details/:id"
                  element={<CompanyViewTransporter />}
                />
                <Route
                  path="add-company-transporter"
                  element={<CompanyAddTransporter />}
                />
                <Route
                  path="edit-company-transporter/:id"
                  element={<CompanyEditTransporter />}
                />
                {/* Order Routes */}
                <Route
                  path="view-all-orders-by-company"
                  element={<CompanyOrder />}
                />
                <Route
                  path="view-company-order-details/:id"
                  element={<CompanyViewOrderDetails />}
                />
              </Route>
            )}

            {/* User Routes inside UserLayout  */}

            {/* User Routes inside UserLayout */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/book" element={<BookListPage />} />
              <Route path="/book/:id" element={<BookPreview />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/address" element={<Address />} />
              <Route path="/add-address" element={<AddAddress />} />
              <Route path="/edit-address/:id" element={<EditAddress />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/forgot-password" element={<UserForgotPassword />} />
              <Route
                path="/categorized-books/:name"
                element={<CategorizedBooks />}
              />
              <Route path="/categories" element={<Category />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/order-details/:orderId"
                element={<OrderDetails />}
              />
              <Route
                path="/product-review/:bookId"
                element={<ProductReview />}
              />
              <Route path="/track-package/:id" element={<TrackPackage />} />
            </Route>
          </Routes>
        </AuthHandler>
      </BrowserRouter>
    </>
  );
}

export default App;
