import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "password") {
      setPasswordStrength(getStrength(value));
    }
  };

  const getStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "Strong";
    return "Moderate";
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak":
        return "red";
      case "Moderate":
        return "orange";
      case "Strong":
        return "limegreen";
      default:
        return "#aaa";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await axios.post("https://upitransaction.onrender.com/register", { ...formData });
      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      if (err.response) {
        setMessage(`❌ ${err.response.data.detail}`);
      } else {
        setMessage("❌ Network Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "500px",
      margin: "60px auto",
      padding: "30px",
      borderRadius: "15px",
      background: "#1f1f1f",
      boxShadow: "0 0 20px rgba(125, 60, 255, 0.2)",
      color: "#fff",
      fontFamily: "'Segoe UI', sans-serif",
    },
    heading: {
      textAlign: "center",
      color: "#ffffff",
      marginBottom: "25px",
      fontSize: "30px",
    },
    label: {
      fontWeight: 600,
      display: "block",
      marginBottom: "6px",
      color: "#ccc",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "16px",
      border: "1px solid #444",
      borderRadius: "8px",
      fontSize: "15px",
      backgroundColor: "#2b2b2b",
      color: "#f1f1f1",
      outline: "none",
    },
    passwordWrapper: {
      position: "relative",
    },
    eyeIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#aaa",
      cursor: "pointer",
    },
    strengthText: {
      marginBottom: "16px",
      fontSize: "14px",
      fontWeight: "bold",
    },
    button: {
      width: "100%",
      backgroundColor: "#7d3cff",
      color: "#fff",
      padding: "12px",
      fontWeight: "bold",
      fontSize: "16px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      boxShadow: "0 0 15px rgba(125, 60, 255, 0.6)",
      transition: "all 0.3s ease",
    },
    message: {
      textAlign: "center",
      marginTop: "15px",
      color: message.includes("✅") ? "#4caf50" : "#e74c3c",
      fontWeight: "bold",
    },
    loginLink: {
      textAlign: "center",
      marginTop: "20px",
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
      <h2 style={styles.heading}>📝 Register Account</h2>
      <form onSubmit={handleRegister}>
        <label style={styles.label}>Username</label>
        <input
          type="text"
          name="username"
          style={styles.input}
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label style={styles.label}>Phone Number</label>
        <input
          type="text"
          name="phone_number"
          style={styles.input}
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="1234567890"
          required
        />

        <label style={styles.label}>Password</label>
        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            style={styles.input}
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />
          <span style={styles.eyeIcon} onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {formData.password && (
          <div style={{ ...styles.strengthText, color: getStrengthColor() }}>
            Strength: {passwordStrength}
          </div>
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? <div style={styles.spinner}></div> : <>
            <FaUserPlus /> Register
          </>}
        </button>
      </form>

      <p style={styles.message}>{message}</p>

      <div style={styles.loginLink}>
        Already have an account?{" "}
        <Link to="/" style={{ color: "#7d3cff", fontWeight: "bold" }}>
          Login here
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
          button:hover {
            background-color: #5e2bcf;
            transform: scale(1.03);
            box-shadow: 0 0 20px rgba(125, 60, 255, 0.8);
          }
          button:disabled {
            background-color: #555;
            cursor: not-allowed;
            box-shadow: none;
          }
        `}
      </style>
    </div>
  );
}

export default Register;
