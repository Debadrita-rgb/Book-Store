import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";

const ViewOrderUserDetails = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { id: userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [transporter, setTransporter] = useState(null);
const [expandedOrder, setExpandedOrder] = useState(null);

 useEffect(() => {
   fetchOrders();
 }, [userId]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/admin/get-all-orders-by-single-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setOrders(res.data.orders || []);
        setUser(res.data.user || null);
        setProfile(res.data.profile || null);
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);

      toast.error(err.response?.data?.message || "Failed to load user orders");
    }
  };

  const trackingSteps = [
    "Ordered",
    "Confirmed",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
  ];

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
      <div className="shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Order Information
        </h2>

        <div className="space-y-4">
          {orders.map((order, index) => {
            const isExpanded = expandedOrder === order._id;

            return (
              <div
                key={order._id}
                className="border rounded-xl overflow-hidden"
              >
                {/* ORDER HEADER */}
                <div
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order._id)
                  }
                  className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      Order #{index + 1}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        statusColors[order.orderStatus] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Arrow */}
                  <span className="text-xl">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* FULL ORDER DETAILS */}
                {isExpanded && (
                  <div className="border-t p-6">
                    {/* ORDER INFORMATION */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
                      <p>
                        <b className="block">Order Number</b>
                        {order.orderNumber}
                      </p>

                      <p>
                        <b className="block">Order Date</b>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      <p>
                        <b className="block">Payment Status</b>
                        {order.paymentStatus}
                      </p>

                      <p>
                        <b className="block">Payment Method</b>
                        {order.paymentMethod}
                      </p>

                      <p>
                        <b className="block">Estimated Delivery</b>
                        {order.estimatedDelivery
                          ? new Date(
                              order.estimatedDelivery,
                            ).toLocaleDateString()
                          : "--"}
                      </p>

                      <p>
                        <b className="block">Payable Amount</b>₹
                        {order.payableAmount}
                      </p>
                    </div>

                    {/* DELIVERY ADDRESS */}
                    <div className="border rounded-xl p-5 mb-5">
                      <h3 className="font-semibold text-lg mb-3">
                        Delivery Address
                      </h3>

                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <p>
                          <b className="block">Name</b>
                          {order.address?.fullName || "--"}
                        </p>

                        <p>
                          <b className="block">Mobile</b>
                          {order.address?.mobileNumber || "--"}
                        </p>

                        <p>
                          <b className="block">Alternate Mobile</b>
                          {order.address?.alternateMobileNumber || "--"}
                        </p>

                        <p>
                          <b className="block">Address Type</b>
                          {order.address?.addressType || "--"}
                        </p>

                        <p>
                          <b className="block">Landmark</b>
                          {order.address?.landmark || "--"}
                        </p>

                        <p className="xl:col-span-2">
                          <b className="block">Address</b>
                          {order.address?.addressLine1 || "--"},{" "}
                          {order.address?.addressLine2 || ""},{" "}
                          {order.address?.city || ""},{" "}
                          {order.address?.state || ""},{" "}
                          {order.address?.country || ""} -{" "}
                          {order.address?.postalCode || ""}
                        </p>
                      </div>
                    </div>

                    {/* BOOKS */}
                    <div className="overflow-x-auto mb-5">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 border">S.No</th>

                            <th className="py-2 px-4 border">Image</th>

                            <th className="py-2 px-4 border">Product</th>

                            <th className="py-2 px-4 border">Quantity</th>

                            <th className="py-2 px-4 border">Price</th>

                            <th className="py-2 px-4 border">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {order.books?.map((product, bookIndex) => (
                            <tr key={product._id || bookIndex}>
                              <td className="py-2 px-4 border">
                                {bookIndex + 1}
                              </td>

                              <td className="py-2 px-4 border">
                                <img
                                  src={product.coverImage}
                                  alt={product.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              </td>

                              <td className="py-2 px-4 border">
                                {product.title}
                              </td>

                              <td className="py-2 px-4 border text-center">
                                {product.quantity}
                              </td>

                              <td className="py-2 px-4 border">
                                ₹{Number(product.price).toFixed(2)}
                              </td>

                              <td className="py-2 px-4 border">
                                ₹{Number(product.totalPrice).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* PAYMENT + DELIVERY PARTNER */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* PAYMENT */}
                      <div className="border rounded-xl p-5">
                        <h3 className="text-lg font-semibold mb-4">
                          Payment Summary
                        </h3>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>CGST</span>
                            <span>₹{order.cgst}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>SGST</span>
                            <span>₹{order.sgst}</span>
                          </div>

                          {order.coupon?.couponCode && (
                            <div className="flex justify-between text-green-600">
                              <span>Coupon ({order.coupon.couponCode})</span>

                              <span>- ₹{order.coupon.discount}</span>
                            </div>
                          )}

                          <div className="border-t pt-3 flex justify-between font-bold text-lg">
                            <span>Payable Amount</span>

                            <span>₹{order.payableAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* DELIVERY PARTNER */}
                      {order.company || order.transporter ? (
                        <div className="border rounded-xl p-5">
                          <h3 className="text-lg font-semibold mb-4">
                            Delivery Partner
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {order.company && (
                              <div>
                                <h4 className="font-semibold mb-3">
                                  Courier Company
                                </h4>

                                <p>
                                  <b>Name:</b>{" "}
                                  {order.company.companyName || "--"}
                                </p>

                                <p>
                                  <b>Email:</b> {order.company.email || "--"}
                                </p>

                                <p>
                                  <b>Phone:</b> {order.company.phone || "--"}
                                </p>
                              </div>
                            )}

                            {order.transporter && (
                              <div>
                                <h4 className="font-semibold mb-3">
                                  Transporter
                                </h4>

                                <p>
                                  <b>Name:</b>{" "}
                                  {order.transporter.transportername || "--"}
                                </p>

                                <p>
                                  <b>Phone:</b>{" "}
                                  {order.transporter.phone || "--"}
                                </p>

                                <p>
                                  <b>Vehicle:</b>{" "}
                                  {order.transporter.vehicleNumber || "--"}
                                </p>

                                <p>
                                  <b>Vehicle Type:</b>{" "}
                                  {order.transporter.vehicleType || "--"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewOrderUserDetails;
