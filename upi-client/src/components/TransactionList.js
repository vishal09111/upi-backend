import React, { useEffect, useState } from "react";
import axios from "axios";

function TransactionList({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");   

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await axios.get("https://upitransaction.onrender.com/upi", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load transactions");
      }
    };
    fetchTxns();
  }, [token]);

  return (
    <div>
      <h2>Your UPI Transactions</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {transactions.map((txn) => (
          <li key={txn.Upi_Transaction_Id}>
            <strong>{txn.Upi_Transaction_Id}</strong> - ₹{txn.Amount_transferd} - {txn.Purpose}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
