import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import BASE_URL from "../../../../config";

const ViewCompanyOrderDetails = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
const [company, setCompany] = useState(null);
const [transporter, setTransporter] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
    }
  }, [order]);

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${BASE_URL}/company/get-single-order-details/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setOrder(res.data.order);
    setCompany(res.data.company);
    setTransporter(res.data.transporter);
  };

  const updateStatus = async () => {
    const token = localStorage.getItem("token");

    await axios.put(
      `${BASE_URL}/company/update-order-status/${order._id}`,
      {
        orderStatus: status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    toast.success("Order status updated");

    fetchOrder();
  };

  const trackingSteps = [
    "Ordered",
    "Confirmed",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
  ];

  const currentStep = trackingSteps.indexOf(order?.orderStatus);

  const statusColors = {
    Ordered: "bg-blue-100 text-blue-700",
    Confirmed: "bg-indigo-100 text-indigo-700",
    Packed: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-purple-100 text-purple-700",
    "Out For Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-8">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className=" shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Order Information
          </h2>

          <div className="space-y-2 text-gray-700">
            <p>
              <b>Order Number:</b> {order?.orderNumber}
            </p>

            <p>
              <b>Order Date:</b>{" "}
              {new Date(order?.createdAt).toLocaleDateString()}
            </p>

            <p className="flex items-center gap-2">
              <b>Payment Status:</b>
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded">
                {order?.paymentStatus}
              </span>
              <b className="ms-3">Payment Method:</b> {order?.paymentMethod}
            </p>

            <p>
              <b>Estimated Delivery:</b>{" "}
              {new Date(order?.estimatedDelivery).toLocaleDateString()}
            </p>

            {order?.packageingDate && (
              <p>
                <b>Packageing Date:</b>{" "}
                {order?.packageingDate
                  ? new Date(order.packageingDate).toLocaleDateString()
                  : "--"}
              </p>
            )}
            {order?.confirmationDate && (
              <p>
                <b>Confirmation Date:</b>{" "}
                {order?.confirmationDate
                  ? new Date(order.confirmationDate).toLocaleDateString()
                  : "--"}
              </p>
            )}
            {order?.shippingDate && (
              <p>
                <b>Shipping Date:</b>{" "}
                {order?.shippingDate
                  ? new Date(order.shippingDate).toLocaleDateString()
                  : "--"}
              </p>
            )}
            {order?.outforDeliveryDate && (
              <p>
                <b>Out for Delivery Date:</b>{" "}
                {order?.outforDeliveryDate
                  ? new Date(order.outforDeliveryDate).toLocaleDateString()
                  : "--"}
              </p>
            )}
            {order?.deliveredDate && (
              <p>
                <b>Delivered Date:</b>{" "}
                {order?.deliveredDate
                  ? new Date(order.deliveredDate).toLocaleDateString()
                  : "--"}
              </p>
            )}
            <p>
              <b>Order Status:</b>{" "}
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[order?.orderStatus] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {order?.orderStatus}
              </span>
            </p>
            {order?.orderStatus !== "Delivered" && (
              <div className="mt-6 flex items-center gap-4">
                <label className="font-semibold">Change Status</label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option>Ordered</option>
                  <option>Confirmed</option>
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Out For Delivery</option>
                  <option>Delivered</option>
                </select>

                <button
                  onClick={updateStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                >
                  Update Status
                </button>
              </div>
            )}
          </div>
        </div>

        <div className=" shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Customer Information
          </h2>

          <div className="space-y-2">
            <p>
              <b>Name:</b> {order?.userId?.name}
            </p>
            <p>
              <b>Email:</b> {order?.userId?.email}
            </p>
            <p>
              <b>Mobile:</b> {order?.userId?.mobileNumber}
            </p>
          </div>
        </div>
      </div>
      <hr />
      <div className=" shadow rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

        <div className="space-y-2">
          <p>
            <b>Name:</b> {order?.address?.fullName}
          </p>
          <p>
            <b>Mobile:</b> {order?.address?.mobileNumber}
          </p>
          <p>
            <b>Alternate:</b> {order?.address?.alternateMobileNumber || "--"}
          </p>
          <p>
            <b>Email:</b> {order?.user?.email || "--"}
          </p>
          <p>
            <b>Landmark:</b> {order?.address?.landmark || "--"}
          </p>
          <p>
            <b>Address:</b> {order?.address?.city || "--"} ,
            {order?.address?.state || "--"} ,{order?.address?.country || "--"} ,
            {order?.address?.postalCode || "--"}
          </p>
          <p>
            <b>Address Type:</b> {order?.address?.addressType || "--"}
          </p>
        </div>
      </div>
      <hr />
      <h1 className="text-2xl font-bold mb-4 mt-4">Products</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full  border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 border-b">S.No</th>
              <th className="py-2 px-4 border-b">Product Image</th>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {order?.books?.map((product, index) => (
              <tr key={product._id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-16 h-16 object-cover"
                  />
                </td>
                <td className="py-2 px-4 border-b">{product.title}</td>
                <td className="py-2 px-4 border-b">{product.quantity}</td>
                <td className="py-2 px-4 border-b">
                  ₹{product.price.toFixed(2)}
                </td>
                <td className="py-2 px-4 border-b">
                  ₹{product.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <div className=" rounded-xl shadow p-6 mt-3">
        <h2 className="font-semibold text-xl mb-4">Payment Summary</h2>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{order?.subtotal}</span>
        </div>

        <div className="flex justify-between">
          <span>CGST</span>
          <span>₹{order?.cgst}</span>
        </div>

        <div className="flex justify-between">
          <span>SGST</span>
          <span>₹{order?.sgst}</span>
        </div>
        {order?.coupon?.couponCode && (
          <>
            <div className="flex justify-between text-green-600">
              <span>Coupon ({order.coupon.couponCode})</span>

              <span>- ₹{order.coupon.discount}</span>
            </div>
          </>
        )}
      </div>
      <hr />
      <div className="flex justify-between font-bold text-lg me-3 ms-3">
        <span>Total</span>

        <span>₹{order?.payableAmount}</span>
      </div>

      {/* Delivery Partner Details */}
      {(company || transporter) && (
        <div className=" rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Partner</h2>

          <div className="grid grid-cols-2 gap-6">
            {company && (
              <div className="space-y-2">
                {" "}
                <p className="text-sm text-gray-900">
                  <b>Courier Company: </b>
                  {company.companyName}
                </p>
                <p className="text-sm text-gray-900 mt-3">
                  <b>Company Email: </b>
                  {company.email}
                </p>
                <p className="text-sm text-gray-900 mt-3">
                  <b>Company Phone: </b>
                  {company.phone}
                </p>
              </div>
            )}

            {transporter && (
              <div>
                <p className="text-sm text-gray-900">
                  <b>Transporter: </b>
                  {transporter.transportername}
                </p>

                <p className="text-sm text-gray-900 mt-3">
                  <b>Phone: </b>
                {transporter.phone}</p>

                <p className="text-sm text-gray-900 mt-3">
                  <b>Vehicle Number: </b>
                {transporter.vehicleNumber}</p>

                <p className="text-sm text-gray-900 mt-3">
                  <b>Vehicle Type: </b>
                {transporter.vehicleType}</p>

                <p className="text-sm text-gray-900 mt-3">
                  <b>License Number: </b>
                {transporter.licenseNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className=" rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-6">Tracking Information</h2>

        <div className="flex items-center justify-between overflow-x-auto">
          {trackingSteps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-[120px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${
                index <= currentStep
                  ? "bg-green-900 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
                >
                  ✓
                </div>

                <p
                  className={`mt-2 text-sm text-center ${
                    index <= currentStep
                      ? "text-green-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {step}
                </p>
              </div>

              {index < trackingSteps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? "bg-green-900" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewCompanyOrderDetails;
