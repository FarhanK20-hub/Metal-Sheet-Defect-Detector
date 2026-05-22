# Tata Steel — Surface Defect Inspection System

> Production-grade computer vision system for automated steel surface defect inspection, developed during internship at Tata Steel. Powered by YOLOv8 deep learning and a React control-room UI.

Made by **Farhan Khan**

---

## Overview

An AI-powered defect detection system designed for Tata Steel's Quality Assurance division. The system analyses steel coil surface images using a custom-trained YOLOv8 model, identifies defect types and locations, computes severity verdicts, and generates inspection reports — all through an enterprise-grade control room interface.

The system runs entirely locally with no cloud dependencies, no database, and fully stateless processing.

---

## Features

| Feature | Description |
|---------|-------------|
| **Defect Detection** | YOLOv8 inference with class-specific colored bounding boxes and confidence labels |
| **Severity Scoring** | Automated PASS / MARGINAL / REJECT verdict with quality index (0–100) |
| **Inspection Reports** | In-memory PDF generation with annotated images, detection tables, and verdict |
| **Batch Processing** | Analyse up to 20 images at once with aggregate summary statistics |
| **Defect Heatmap** | Canvas-based density heatmap overlay showing defect concentration zones |
| **Grad-CAM Explainability** | Model attention visualization showing which regions drive predictions |
| **Model Metrics** | Live performance dashboard with mAP, precision, recall, and per-class AP |
| **Docker Deployment** | One-command deployment via Docker Compose (Flask + Nginx) |
| **Industrial UI** | Tata Steel branded control room interface with IBM Plex typography |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TailwindCSS 4, Recharts, React Router |
| Backend | Flask, Python 3.11, Ultralytics YOLOv8 |
| ML Model | YOLOv8n (custom-trained on NEU Steel Surface Defect Dataset) |
| PDF Generation | ReportLab (in-memory, no disk writes) |
| Explainability | pytorch-grad-cam (GradCAM++) |
| Image Processing | OpenCV, Pillow |
| Deployment | Docker, Docker Compose, Nginx |

---

## Model Architecture

| Metric | Value |
|--------|-------|
| Architecture | YOLOv8n (nano) |
| Training Dataset | NEU Steel Surface Defect Dataset |
| Classes | Crazing, Inclusion, Patches, Pitted, Rolled, Scratches |
| mAP@50 | 87.3% |
| mAP@50-95 | 64.1% |
| Precision | 89.1% |
| Recall | 84.7% |
| Image Size | 640×640 |
| Model Size | 6.2 MB |
| Avg Inference (CPU) | ~120 ms |

---

## Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+
- **Docker** & **Docker Compose** (optional, for containerized deployment)

---

### Local Development Setup

#### 1. Backend

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
cd backend
python app.py
```

The backend runs at `http://localhost:5000`.

#### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173`.

#### 3. Usage

1. Open `http://localhost:5173` in your browser
2. Upload a steel coil surface image (or drag-and-drop)
3. Click **ANALYSE** to run defect detection
4. View annotated results, severity verdict, and detection summary
5. Toggle between Annotated / Heatmap / Grad-CAM views
6. Generate a PDF inspection report with Coil ID and operator details
7. Visit `/metrics` to view model performance statistics

---

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

To stop:

```bash
docker-compose down
```

---

## Project Structure

```
project/
├── backend/
│   ├── app.py              # Flask API (predict, batch, report, metrics)
│   ├── my_model.pt          # YOLOv8 trained weights
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api.js           # Centralized API service
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Root component with routing
│   │   ├── App.css          # Component layout styles
│   │   ├── index.css        # Design system (Tata Steel tokens)
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   ├── VerdictBanner.jsx
│   │   │   ├── DetectionSummary.jsx
│   │   │   ├── ImageViewer.jsx
│   │   │   ├── HeatmapCanvas.jsx
│   │   │   ├── GradCamViewer.jsx
│   │   │   ├── ReportForm.jsx
│   │   │   └── BatchResults.jsx
│   │   └── pages/
│   │       ├── InspectionView.jsx
│   │       └── MetricsPage.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Single image inference (optional `?explainability=true`) |
| POST | `/batch` | Batch inference (up to 20 images) |
| POST | `/report` | Generate PDF inspection report |
| GET | `/metrics` | Model performance metrics |

---

## License

This project is licensed under the MIT License.
