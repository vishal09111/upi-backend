import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddTransaction({ onSuccess, onClose }) {
  const token = localStorage.getItem("token");
  let username = "";

  try {
    const decoded = jwtDecode(token);
    username = decoded.sub;
  } catch (e) {
    console.error("Invalid token");
  }

  const [formData, setFormData] = useState({
    Upi_Transaction_Id: "",
    Date: new Date().toISOString().split("T")[0],
    Sender_Bank: "",
    Reciever_bank: "",
    Amount_transferd: "",
    Purpose: "",
    Gender: "",
    Payment_app: "",
    Payment_Gateway: "",
    Device_type: "",
    Age: "",
    Status: "",
    Sender_Name: username,
    Receiver_Name: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Sender_Name: username,
    }));
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (date) => {
    const formatted = formatDateToYYYYMMDD(date);
    setFormData((prev) => ({ ...prev, Date: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("https://upitransaction.onrender.com/upi/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Transaction added successfully!");

      setFormData({
        Upi_Transaction_Id: "",
        Date: new Date().toISOString().split("T")[0],
        Sender_Bank: "",
        Reciever_bank: "",
        Amount_transferd: "",
        Purpose: "",
        Gender: "",
        Payment_app: "",
        Payment_Gateway: "",
        Device_type: "",
        Age: "",
        Status: "",
        Sender_Name: username,
        Receiver_Name: "",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.detail || "❌ Network or server error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const dropdownOptions = {
    Gender: ["Male", "Female", "Other"],
    Payment_app: ["GPay", "PhonePe", "Paytm", "Amazon Pay"],
    Payment_Gateway: ["Razorpay", "PayU", "BillDesk"],
    Device_type: ["Mobile", "Desktop", "Tablet"],
    Status: ["Success", "Failed", "Pending"],
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "auto",
        padding: "20px",
        background: "#1f1f1f",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(125,60,255,0.2)",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            color: "#aaa",
            cursor: "pointer",
          }}
          title="Close"
        >
          ❌
        </button>
      )}

      <h2 style={{ textAlign: "center" }}>➕ Add UPI Transaction</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => {
          const isDropdown = Object.keys(dropdownOptions).includes(key);

          return (
            <div key={key}>
              <label style={{ display: "block", marginBottom: "5px" }}>{key}</label>

              {key === "Date" ? (
                <DatePicker
                  selected={new Date(formData.Date)}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    backgroundColor: "#2b2b2b",
                    color: "#fff",
                  }}
                />
              ) : isDropdown ? (
                <select
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    backgroundColor: "#2b2b2b",
                    color: "#fff",
                  }}
                >
                  <option value="">Select {key}</option>
                  {dropdownOptions[key].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  readOnly={key === "Sender_Name"}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    backgroundColor: "#2b2b2b",
                    color: "#fff",
                  }}
                />
              )}
            </div>
          );
        })}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: loading ? "#aaa" : "#7d3cff",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.3s",
          }}
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default AddTransaction;
