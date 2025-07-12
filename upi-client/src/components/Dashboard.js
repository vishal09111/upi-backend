import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt, FaUniversity, FaExchangeAlt, FaRupeeSign, FaInfoCircle,
  FaTransgender, FaMobileAlt, FaNetworkWired, FaLaptop, FaUser, FaCheckCircle
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Dashboard.css";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newTxn, setNewTxn] = useState({
    Date: new Date(), Sender_Bank: "", Reciever_bank: "", Amount_transferd: "",
    Purpose: "", Gender: "", Payment_app: "", Payment_Gateway: "",
    Device_type: "", Age: "", Status: "", Receiver_Name: ""
  });

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
      const response = await axios.get("https://upitransaction.onrender.com/", {
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

  const handleNewTxnChange = (e) => {
    setNewTxn({ ...newTxn, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setNewTxn({ ...newTxn, Date: date });
  };

  const handleNewTxnSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://upitransaction.onrender.com/upi/add", newTxn, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTxn({ Date: new Date(), Sender_Bank: "", Reciever_bank: "", Amount_transferd: "",
        Purpose: "", Gender: "", Payment_app: "", Payment_Gateway: "",
        Device_type: "", Age: "", Status: "", Receiver_Name: "" });
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction", error);
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
            <button className="primary-btn" onClick={() => setShowForm(true)}>➕ Add New Transaction</button>
          ) : (
            <div className="form-overlay">
              <div className="form-expanded">
                <div className="form-expanded-header">
                  <h2>📝 Add UPI Transaction</h2>
                  <button className="form-close-btn" onClick={() => setShowForm(false)}>✖</button>
                </div>
                <form className="expanded-form" onSubmit={handleNewTxnSubmit}>
                  <div className="form-row">
                    <label><FaCalendarAlt /> <DatePicker selected={newTxn.Date} onChange={handleDateChange} dateFormat="yyyy-MM-dd" /></label>
                    <label><FaUniversity /> <input name="Sender_Bank" placeholder="Sender Bank" value={newTxn.Sender_Bank} onChange={handleNewTxnChange} required /></label>
                    <label><FaExchangeAlt /> <input name="Reciever_bank" placeholder="Receiver Bank" value={newTxn.Reciever_bank} onChange={handleNewTxnChange} required /></label>
                  </div>
                  <div className="form-row">
                    <label><FaRupeeSign /> <input name="Amount_transferd" placeholder="Amount" value={newTxn.Amount_transferd} onChange={handleNewTxnChange} required /></label>
                    <label><FaInfoCircle /> <input name="Purpose" placeholder="Purpose" value={newTxn.Purpose} onChange={handleNewTxnChange} required /></label>
                    <label><FaCheckCircle />
                      <select name="Status" value={newTxn.Status} onChange={handleNewTxnChange}>
                        <option value="">Status</option>
                        <option value="Success">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <label><FaTransgender />
                      <select name="Gender" value={newTxn.Gender} onChange={handleNewTxnChange}>
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label><FaUser /> <input name="Age" placeholder="Age" value={newTxn.Age} onChange={handleNewTxnChange} /></label>
                    <label><FaUser /> <input name="Receiver_Name" placeholder="Receiver Name" value={newTxn.Receiver_Name} onChange={handleNewTxnChange} required /></label>
                  </div>
                  <div className="form-row">
                    <label><FaMobileAlt /> <input name="Payment_app" placeholder="Payment App" value={newTxn.Payment_app} onChange={handleNewTxnChange} /></label>
                    <label><FaNetworkWired /> <input name="Payment_Gateway" placeholder="Payment Gateway" value={newTxn.Payment_Gateway} onChange={handleNewTxnChange} /></label>
                    <label><FaLaptop /> <input name="Device_type" placeholder="Device Type" value={newTxn.Device_type} onChange={handleNewTxnChange} /></label>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">✅ Submit Transaction</button>
                  </div>
                </form>
              </div>
            </div>
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
          <button className="export-btn" onClick={handleExportExcel}>📤 Export Excel</button>
        </div>
      )}
      {!isAdmin && (
        <div className="user-tools">
          <button className="export-btn" onClick={handleDownloadPDF}>📄 Download PDF</button>
        </div>
      )}

      <table className="dashboard-table" id="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Status</th>
            {isAdmin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {transactions
            .filter((txn) =>
              isAdmin ?
                Object.values(txn).some((val) =>
                  String(val).toLowerCase().includes(searchTerm.toLowerCase())
                ) : true
            )
            .map((txn) =>
              editingId === txn.Upi_Transaction_Id ? (
                <tr key={txn.Upi_Transaction_Id}>
                  <td>{txn.Upi_Transaction_Id}</td>
                  <td><input name="Date" value={editForm.Date} onChange={handleEditChange} /></td>
                  <td><input name="Sender_Bank" value={editForm.Sender_Bank} onChange={handleEditChange} /></td>
                  <td><input name="Reciever_bank" value={editForm.Reciever_bank} onChange={handleEditChange} /></td>
                  <td><input name="Amount_transferd" value={editForm.Amount_transferd} onChange={handleEditChange} /></td>
                  <td><input name="Purpose" value={editForm.Purpose} onChange={handleEditChange} /></td>
                  <td><input name="Status" value={editForm.Status} onChange={handleEditChange} /></td>
                  <td>
                    <button className="save-btn" onClick={handleEditSubmit}>💾 Save</button>
                    <button className="cancel-btn" onClick={() => setEditingId(null)}>❌ Cancel</button>
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
                  <td>{txn.Status}</td>
                  {isAdmin && (
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(txn)}>✏️ Edit</button>
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
