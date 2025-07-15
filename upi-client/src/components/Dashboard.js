import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  FaSearch,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import AddTransaction from "./AddTransaction"; // import your component

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded?.sub === "vishal");
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, [token]);

  useEffect(() => {
    if (token !== null) {
      fetchTransactions();
    }
  }, [isAdmin]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("https://upitransaction.onrender.com/upi", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = response.data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      setTransactions(isAdmin ? sorted : sorted.slice(0, 5));
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const handleEdit = (txn) => {
    setEditingId(txn.Upi_Transaction_Id);
    setEditForm({ ...txn });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`https://upitransaction.onrender.com/upi/${editingId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction", error);
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "upi_transactions.xlsx");
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("transaction-table");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "pt", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 20, 20, pdfWidth - 40, pdfHeight);
      pdf.save("upi_transactions.pdf");
    });
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">📊 UPI Transaction Dashboard</h2>

      {!isAdmin && (
        <div className="form-toggle">
          {!showForm ? (
            <button className="primary-btn" onClick={() => setShowForm(true)}>
              ➕ Add New Transaction
            </button>
          ) : (
            <AddTransaction
              onSuccess={() => {
                fetchTransactions();
                setShowForm(false);
              }}
              onClose={() => setShowForm(false)}
            />
          )}
        </div>
      )}

      {isAdmin && (
        <div className="admin-tools">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="export-btn" onClick={handleExportExcel}>
            📤 Export Excel
          </button>
        </div>
      )}
      {!isAdmin && (
        <div className="user-tools">
          <button className="export-btn" onClick={handleDownloadPDF}>
            📄 Download PDF
          </button>
        </div>
      )}

      <table className="dashboard-table" id="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Sender Bank</th>
            <th>Receiver Bank</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Gender</th>
            <th>Payment App</th>
            <th>Payment Gateway</th>
            <th>Device Type</th>
            <th>Age</th>
            <th>Status</th>
            <th>Sender Name</th>
            <th>Receiver Name</th>
            {isAdmin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {transactions
            .filter((txn) =>
              isAdmin
                ? Object.values(txn).some((val) =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                  )
                : true
            )
            .map((txn) =>
              editingId === txn.Upi_Transaction_Id ? (
                <tr key={txn.Upi_Transaction_Id}>
                  <td>{txn.Upi_Transaction_Id}</td>
                  <td>
                    <input
                      name="Date"
                      value={editForm.Date}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Sender_Bank"
                      value={editForm.Sender_Bank}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Reciever_bank"
                      value={editForm.Reciever_bank}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Amount_transferd"
                      value={editForm.Amount_transferd}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Purpose"
                      value={editForm.Purpose}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Gender"
                      value={editForm.Gender}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Payment_app"
                      value={editForm.Payment_app}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Payment_Gateway"
                      value={editForm.Payment_Gateway}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Device_type"
                      value={editForm.Device_type}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Age"
                      value={editForm.Age}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="Status"
                      value={editForm.Status}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>{txn.Sender_Name}</td>
                  <td>
                    <input
                      name="Receiver_Name"
                      value={editForm.Receiver_Name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <button className="save-btn" onClick={handleEditSubmit}>
                      💾 Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditingId(null)}
                    >
                      ❌ Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={txn.Upi_Transaction_Id}>
                  <td>{txn.Upi_Transaction_Id}</td>
                  <td>{txn.Date}</td>
                  <td>{txn.Sender_Bank}</td>
                  <td>{txn.Reciever_bank}</td>
                  <td>{txn.Amount_transferd}</td>
                  <td>{txn.Purpose}</td>
                  <td>{txn.Gender}</td>
                  <td>{txn.Payment_app}</td>
                  <td>{txn.Payment_Gateway}</td>
                  <td>{txn.Device_type}</td>
                  <td>{txn.Age}</td>
                  <td>{txn.Status}</td>
                  <td>{txn.Sender_Name}</td>
                  <td>{txn.Receiver_Name}</td>
                  {isAdmin && (
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(txn)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  )}
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
