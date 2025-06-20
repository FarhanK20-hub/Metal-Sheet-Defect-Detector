# 🧠 Steel Coil Defect Detection Web App

# Made by Farhan Khan 

This project is a full-stack AI-powered web application that allows users to upload an image of a steel coil and get visual feedback with defects highlighted. It uses a YOLOv8 model on the backend and a simple React frontend.

---

## ✨ Features

- Upload steel coil images
- Automatically detect defects using a trained YOLO model
- Display results with defect boxes drawn
- Simple and responsive UI
- Works fully offline (local deployment)

---

## 🛠 Tech Stack

| Part       | Technology                 |
|------------|----------------------------|
| Frontend   | React, Axios               |
| Backend    | Flask, Flask-CORS          |
| ML Model   | YOLOv8 (Ultralytics)       |
| Image Utils| Pillow (PIL), BytesIO      |

---

## 🚀 How It Works

### 1. React Frontend
- Lets the user upload an image
- Sends it to the Flask server
- Displays the result image returned from the server

### 2. Flask Backend
- Receives the image
- Uses YOLO to detect defects
- Draws boxes on the image
- Sends the updated image back to the frontend

## 📁 Project Structure
project/
│
├── backend/
│ ├── app.py # Flask API with YOLO
│ └── my_model.pt # Trained YOLOv8 model
│
├── frontend/
│ ├── src/
│ │ └── App.js # React UI
│ └── public/
│ └── index.html # Entry point
│
└── README.md

---

## ⚙️ Getting Started

### 🔧 Prerequisites

- Node.js & npm
- Python 3.8+
- `pip install -r requirements.txt` (Flask, ultralytics, pillow)

---

### 📦 Backend Setup

```bash
cd backend
pip install flask flask-cors ultralytics pillow
python app.py
```
### 📦 Frontend Setup
```bash
cd frontend
npm install
npm start
```

🧪 Example Usage
-Start both servers.
-Go to the browser and upload a coil image.
-Wait for a second while the model detects.
-See the result image with red boxes drawn on defects.



