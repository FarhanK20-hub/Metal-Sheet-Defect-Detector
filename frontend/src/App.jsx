import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

function App() {
  const [resultImg, setResultImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { image: null },
  });

  const file = watch("image")?.[0] || null;

  const onSubmit = async (data) => {
    if (!data.image || data.image.length === 0) return;

    const formData = new FormData();
    formData.append("image", data.image[0]);

    try {
      setLoading(true);
      setResultImg(null);

      const response = await axios.post("http://localhost:5000/predict", formData, {
        responseType: "blob",
      });

      const imageUrl = URL.createObjectURL(response.data);
      setResultImg(imageUrl);
      reset();
    } catch (error) {
      alert("Error detecting defect. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Steel Coil Defect Detector</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <input
            type="file"
            accept="image/*"
            {...register("image", { required: true })}
            className="file-input"
          />

          <button
            type="submit"
            disabled={!file || loading}
            className={`btn-primary ${(!file || loading) && "btn-disabled"}`}
          >
            <p className="text-indigo-500" >{loading ? "Detecting..." : "Upload & Detect"}</p>
          </button>
        </form>

        {loading && <div className="loading-text">🔍 Running detection model...</div>}

        {resultImg && !loading && (
          <div className="result-container">
            <h3 className="result-title">Detection Result</h3>
            <img src={resultImg} alt="Detection Result" className="result-image" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
