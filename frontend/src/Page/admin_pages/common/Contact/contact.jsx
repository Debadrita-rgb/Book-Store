import React, { useState, useEffect } from "react";
import TableComponent from "../../../../Components/commonComponent/CrudComponent/TableComponent";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../../config";

const contact = () => {
  const [contactItems, setContactItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/admin/get-fullcontact-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setContactItems(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredItems = (contactItems || []).map((item, index) => ({
    Id: index + 1,
    Name: item.name,
    Email: item.email,
    Status: item.status,
    id: item._id,
    viewPath: `/admin/view-contact-details/${item._id}`,
  }));

  
  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <TableComponent
        title="Contact"
        columns={["Id", "Name", "Email", "Status"]}
        data={filteredItems}
        showAddButton={false}
        showActionColumn={true}
        showRecommendedeColumn={false}
        showActiveColumn={false}
        showAvailableColumn={false}
      />
    </div>
  );
};

export default contact;
