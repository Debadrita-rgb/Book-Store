import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";

const CompletedDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedDeliveries();
  }, []);

  const fetchCompletedDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/transporter/completed-deliveries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setDeliveries(res.data.data || []);
    } catch (error) {
      console.error("Error fetching completed deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {deliveries.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No completed deliveries found.
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow p-5 border"
            >
              <div className="flex justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold text-lg">{order.orderNumber}</h2>
                  <p className="text-gray-600">{order.address?.fullName}</p>
                  <p className="text-gray-500 text-sm">
                    {order.address?.city}, {order.address?.state}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    Delivered
                  </span>
                  <p className="mt-2 font-semibold">₹{order.payableAmount}</p>
                </div>
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-sm text-gray-500 mb-2">
                  Books ({order.books?.length || 0})
                </p>

                <div className="space-y-2">
                  {order.books?.map((book, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {book.title} × {book.quantity}
                      </span>
                      <span>₹{book.totalPrice}</span>
                    </div>
                  ))}
                </div>

                {order.deliveredDate && (
                  <p className="text-xs text-gray-500 mt-3">
                    Delivered on{" "}
                    {new Date(order.deliveredDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedDeliveries;
