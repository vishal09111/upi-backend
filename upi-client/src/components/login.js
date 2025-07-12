import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setHintVisible(false), 5000);
  }, []);

  const backendErrorMap = {
    "Incorrect username or password": "Please check your login details.",
    "User not found": "This account doesn’t exist.",
  };

  const storeLoginMetadata = () => {
    const metadata = {
      username,
      time: new Date().toLocaleString(),
    };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        metadata.location = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        localStorage.setItem("last_login", JSON.stringify(metadata));
      },
      () => localStorage.setItem("last_login", JSON.stringify(metadata))
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://upitransaction.onrender.com/login",
        new URLSearchParams({ username, password }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      storeLoginMetadata();
      setMessage("✅ Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const detail = err.response?.data?.detail || "Unknown error";
      const friendlyMsg = backendErrorMap[detail] || detail;
      setMessage(`❌ ${friendlyMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "400px",
      margin: "80px auto",
      padding: "30px",
      background: "#1f1f1f",
      borderRadius: "15px",
      boxShadow: "0 0 20px rgba(125, 60, 255, 0.2)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#fff",
      boxSizing: "border-box",
    },
    heading: {
      textAlign: "center",
      marginBottom: "20px",
      fontSize: "26px",
    },
    label: {
      fontWeight: 600,
      marginBottom: "6px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "16px",
      borderRadius: "8px",
      border: "1px solid #444",
      backgroundColor: "#2b2b2b",
      color: "#f1f1f1",
      fontSize: "15px",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#7d3cff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: loading ? "not-allowed" : "pointer",
      boxShadow: "0 0 15px rgba(125, 60, 255, 0.6)",
    },
    message: {
      textAlign: "center",
      marginTop: "15px",
      color: message.includes("✅") ? "#4caf50" : "#e74c3c",
    },
    link: {
      marginTop: "20px",
      textAlign: "center",
      color: "#aaa",
    },
    spinner: {
      display: "inline-block",
      width: "18px",
      height: "18px",
      border: "3px solid #fff",
      borderTop: "3px solid #7d3cff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
  };

  return (
    <div style={styles.container}>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ textAlign: "center", marginBottom: "10px" }}
      >
        
      </motion.div>

      <h2 style={styles.heading}>🔐 Login to UPI Tracker</h2>

      {hintVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            marginBottom: "20px",
            fontSize: "14px",
            background: "#2b2b2b",
            padding: "10px",
            borderRadius: "8px",
            color: "#ccc",
            textAlign: "center",
          }}
        >
          💡 Hint: Your data is secure with us.
        </motion.div>
      )}

      <form onSubmit={handleLogin}>
        <label style={styles.label}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          required
          style={styles.input}
        />
        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? <div style={styles.spinner}></div> : "Login"}
        </button>
      </form>

      <p style={styles.message}>{message}</p>
      <div style={styles.link}>
        New here?{" "}
        <Link to="/register" style={{ color: "#7d3cff", fontWeight: "bold" }}>
          Create an account
        </Link>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          input:focus {
            border-color: #7d3cff;
            box-shadow: 0 0 5px #7d3cff;
          }
        `}
      </style>
    </div>
  );
}

export default Login;
