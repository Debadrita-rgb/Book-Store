import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";

const TodaysDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysDeliveries();
  }, []);

  const fetchTodaysDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/transporter/todays-deliveries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeliveries(res.data.data || []);
    } catch (error) {
      console.error("Error fetching today's deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      {deliveries.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No deliveries are out for delivery today.
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow p-5 border"
            >
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold text-lg">{order.orderNumber}</h2>
                  <p className="text-gray-600">{order.address?.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {order.address?.city}, {order.address?.state}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  Out For Delivery
                </span>
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-sm text-gray-500 mb-2">
                  Books ({order.books?.length || 0})
                </p>

                {order.books?.map((book, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>
                      {book.title} × {book.quantity}
                    </span>
                    <span>₹{book.totalPrice}</span>
                  </div>
                ))}

                <div className="mt-3 flex justify-between items-center">
                  <p className="font-semibold text-green-600">
                    ₹{order.payableAmount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaysDeliveries;
