import React, { useState, useEffect } from "react";
import TableComponent from "../../../Components/commonComponent/CrudComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import BASE_URL from "../../../../config";

const ViewOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    getOrders();
    getCompanyList();
  }, []);

  const getOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/admin/get-order`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  //Get Company List
  const getCompanyList = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/admin/get-company`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompanyList(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  // console.log(companyList)

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
      CompanyList:
        item.orderStatus === "Packed" && !item.company?.companyId ? (
          <select
            defaultValue=""
            onChange={(e) => handleCompanySelect(item._id, e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Select Company</option>

            {companyList.map((company) => (
              <option key={company._id} value={company._id}>
                {company.companyName}
              </option>
            ))}
          </select>
        ) : item.company?.companyName ? (
          <span className="font-medium">
            {item.company.companyName}
            {item.transporter?.transporterName && (
              <span className="text-gray-500">
                {" "}
                ({item.transporter.transporterName})
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
      PayableAmount: Number((item.payableAmount || 0).toFixed(2)),
      PaymentStatus: item.paymentStatus,
      orderStatus: item.orderStatus,
      OrderDate: new Date(item.createdAt).toLocaleDateString(),
      _id: item._id,
      viewPath: `/admin/view-order-details/${item._id}`,
    }));

 const handleCompanySelect = async (orderId, companyId) => {
   try {
     const token = localStorage.getItem("token");

     await axios.put(
       `${BASE_URL}/admin/assign-company/${orderId}`,
       {
         companyId,
       },
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       },
     );

     toast.success("Company assigned successfully");

     getOrders();
   } catch (err) {
     console.error(err);
     toast.error("Failed to assign company");
   }
 };
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
              <option value="Ordered">Ordered</option>
              <option value="Confirmed">Confirmed</option>
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
              "CompanyList",
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
};

export default ViewOrder;
