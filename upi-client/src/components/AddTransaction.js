import React, { useState } from "react";
import axios from "axios";

function AddTransaction({ onSuccess }) {
  const [formData, setFormData] = useState({
    Upi_Transaction_Id: "",
    Date: "",
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
    Sender_Name: "",
    Receiver_Name: "",
  });

  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post("https://upitransaction.onrender.com/upi/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Transaction added successfully!");

      setFormData({
        Upi_Transaction_Id: "",
        Date: "",
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
        Sender_Name: "",
        Receiver_Name: "",
      });

      if (onSuccess) onSuccess(); // Trigger dashboard refresh
    } catch (err) {
      const msg =
        err.response?.data?.detail || "❌ Network or server error";
      setMessage(msg);
    }
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
      }}
    >
      <h2 style={{ textAlign: "center" }}>➕ Add UPI Transaction</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label style={{ display: "block", marginBottom: "5px" }}>{key}</label>
            <input
              type={key === "Date" ? "date" : "text"}
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
            />
          </div>
        ))}
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            background: "#7d3cff",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.3s",
          }}
        >
          Add Transaction
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", color: "#4caf50", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AddTransaction;
