import React, { useState, useEffect } from "react";
import TableComponent from "../../../Components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import BASE_URL from "../../../../config";

const ViewCompanyOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [transporterList, setTransporterList] = useState([]);

  useEffect(() => {
    getOrders();
    getTransporterList();
  }, []);

  const getOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/company/get-all-orders-by-company`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setOrders(res.data.orders);
    } catch (err) {
      console.log(err);
    }
  };

  //Get Company List
  const getTransporterList = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/company/get-available-transporter-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTransporterList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredItems = (orders || [])
    .filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.orderNumber?.toLowerCase().includes(search) ||
        item.address?.fullName?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || item.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .map((item, index) => ({
      Id: index + 1,
      OrderNumber: item.orderNumber,
      Transporter: item.transporter?.transporterName ? (
        <span>{item.transporter.transporterName}</span>
      ) : (
        <select
          defaultValue=""
          onChange={(e) => handleAssignTransporter(item._id, e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select Transporter</option>

          {transporterList.map((t) => (
            <option key={t._id} value={t._id}>
              {t.transportername} ({t.vehicleNumber})
            </option>
          ))}
        </select>
      ),
      PayableAmount: item.payableAmount,
      PaymentStatus: item.paymentStatus,
      orderStatus: item.orderStatus,
      OrderDate: new Date(item.createdAt).toLocaleDateString(),
      _id: item._id,
      viewPath: `/company/view-company-order-details/${item._id}`,
    }));

  const handleChangeStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/admin/update-order-status/${id}`,
        { orderStatus: status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        getOrders();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAssignTransporter = async (orderId, transporterId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/company/assign-transporter/${orderId}`,
        { transporterId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);
      getOrders();
    } catch (err) {
      toast.error("Failed to assign transporter");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span className="ml-4 text-blue-600 font-medium">
            Loading services...
          </span>
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="All">All</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <TableComponent
            title="OrderId"
            columns={[
              "Id",
              "OrderNumber",
              "Transporter",
              "PayableAmount",
              "PaymentStatus",
              "orderStatus",
              "OrderDate",
            ]}
            data={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showAddButton={false}
            showActiveColumn={false}
            showRecommendedeColumn={false}
            handleChangeStatus={handleChangeStatus}
            showAvailableColumn={false}
            showOrderStatusDropdown={true}
          />
        </div>
      )}
    </div>
  );
};;

export default ViewCompanyOrder;
