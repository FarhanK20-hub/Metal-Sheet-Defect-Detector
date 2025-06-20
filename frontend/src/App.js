import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      setResultImg(null); 
      const response = await axios.post("http://localhost:5000/predict", formData, {
        responseType: "blob",
      });

      const imageUrl = URL.createObjectURL(response.data);
      setResultImg(imageUrl);
    } catch (error) {
      alert("Error detecting defect. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "40px"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "600px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "28px", marginBottom: "20px", color: "#333" }}>
          Steel Coil Defect Detector
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "15px" }}
        />
        <br />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            padding: "10px 20px",
            backgroundColor: file && !loading ? "#2563eb" : "#9ca3af",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: file && !loading ? "pointer" : "not-allowed",
            transition: "background-color 0.3s"
          }}
        >
          {loading ? "Detecting..." : "Upload & Detect"}
        </button>

        {loading && (
          <div style={{ marginTop: "20px", color: "#555" }}>
            🔍 Running detection model...
          </div>
        )}

        {resultImg && !loading && (
          <div style={{ marginTop: "30px" }}>
            <h3 style={{ marginBottom: "10px", color: "#111" }}>Detection Result</h3>
            <img
              src={resultImg}
              alt="Detection Result"
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
