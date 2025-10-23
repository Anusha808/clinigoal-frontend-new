import React, { useState } from "react";
import { healthCheck } from "./api"; // ✅ uses your existing axios setup

const TestAPIButton = () => {
  const [status, setStatus] = useState(null);

  const handleCheckAPI = async () => {
    setStatus("loading");
    try {
      const res = await healthCheck();
      console.log("✅ Backend Response:", res.data);
      setStatus("success");
    } catch (err) {
      console.error("❌ Backend unreachable:", err.message);
      setStatus("error");
    }
  };

  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <button
        onClick={handleCheckAPI}
        style={{
          backgroundColor: "#0d6efd",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        🔍 Test Backend Connection
      </button>

      {status === "loading" && <p>⏳ Checking backend connection...</p>}
      {status === "success" && (
        <p style={{ color: "green" }}>✅ Backend Connected Successfully!</p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>❌ Backend Not Reachable!</p>
      )}
    </div>
  );
};

export default TestAPIButton;
