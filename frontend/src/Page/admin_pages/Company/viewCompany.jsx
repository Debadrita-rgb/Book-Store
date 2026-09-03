import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TableComponent from "../../../components/commonComponent/CrudComponent/TableComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";
import { FiFilter } from "react-icons/fi";

const ViewCompany = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/admin/get-company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);


  const filteredCompanies = (companies || [])
    .filter((company) => {
      const matchesSearch =
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .map((company, index) => ({
      Id: index + 1,
      Email: company.email,
      mobileNumber: company.mobileNumber,
      companyName: company.companyName,
      
      id: company._id,
      isActive: company.isActive,
      editPath: `/admin/edit-company/${company._id}`,
    }));

  const handleToggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/admin/toggle-company-status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const updated = await res.json();
      setCompanies((prev) =>
        prev.map((c) => (c._id === updated.updated._id ? updated.updated : c)),
      );
      toast.success(
        `Company ${isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error("Status toggle failed");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <TableComponent
        title="Company"
        columns={[
          "Id",
              "companyName",
          "Email",
          "mobileNumber",
          
        ]}
        data={filteredCompanies}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleToggleActive={handleToggleActive}
        handleDelete={false}
        showAddButton={true}
        addPath="/admin/add-company"
        showRecommendedeColumn={false}
        showAvailableColumn={false}
      />
    </div>
  );
};

export default ViewCompany;
