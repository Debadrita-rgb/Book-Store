import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const TrackPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [order, setOrder] = useState(null);
  useEffect(() => {
    fetchTracking();
  }, []);

  const fetchTracking = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${BASE_URL}/user/track-package/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setTracking(res.data.data);
    setOrder(res.data.order);
  };
  
  return (
    <div className="track-page py-8">
      
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="track-title text-3xl font-bold mb-6">Track Package</h1>
        <div className="track-card rounded-xl p-8">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-5">
            
            <h5 className="text-2xl font-bold text-green-600">
              {tracking?.deliveredDate
                ? `Delivered ${dayjs(tracking.deliveredDate).format("DD MMM")}`
                : `Arriving ${dayjs(tracking?.estimatedDelivery).format("DD MMM")}`}
            </h5>
            <p className="track-text mt-3">Tracking Number</p>
            <p className="font-bold text-lg">{tracking?.trackingNumber}</p>
            <p className="mt-2">
              Current Status :
              <span className="track-status ml-2 px-3 py-1 rounded-full font-medium">
                
                {tracking?.currentStatus}
              </span>
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="track-link cursor-pointer"
            >
              See all orders
            </button>
          </div>
          <hr className="track-divider my-8" />
          <div className="track-history rounded-xl mt-10 p-6">
            <h2 className="track-title text-2xl font-bold mb-6">
              Tracking History
            </h2>
            {tracking?.timeline?.map((item, index) => (
              <div key={index} className="flex gap-5 relative pb-8">
                <div className="flex flex-col items-center">
                  <div className="track-dot w-4 h-4 rounded-full"></div>

                  {index !== tracking.timeline.length - 1 && (
                    <div className="track-line w-1 flex-1"></div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{item.status}</h3>

                  <p className="track-text">{item.description}</p>

                  <p className="track-muted text-sm mt-1">
                    
                    {dayjs(item.date).format("DD MMM YYYY • hh:mm A")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          
          <div className="track-card rounded-xl p-6">
            
            <h2 className="font-bold text-2xl">Delivery Info</h2>
            <p className="mt-4">
              {tracking?.deliveredDate ? "Delivered On" : "Expected Delivery"}
            </p>
            <p>
              {tracking?.deliveredDate
                ? dayjs(tracking.deliveredDate).format("DD MMM YYYY")
                : dayjs(tracking?.estimatedDelivery).format("DD MMM YYYY")}
            </p>
          </div>
          <div className="track-card rounded-xl p-6">
            
            <h2 className="font-bold text-2xl">Shipping Address</h2>
            <p className="font-semibold">{order?.address?.fullName}</p>
            <p>{order?.address?.addressLine1}</p>
            <p>
              {order?.address?.city},{order?.address?.state}
            </p>
            <p>{order?.address?.postalCode}</p>
            <p>{order?.address?.phone}</p>
          </div>
          <div className="track-card rounded-xl p-6">
            
            <h2 className="font-bold text-2xl">Order Info</h2>
            <button
              className="track-link cursor-pointer"
              onClick={() => navigate(`/order-details/${order._id}`)}
            >
              View Order Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPackage;
