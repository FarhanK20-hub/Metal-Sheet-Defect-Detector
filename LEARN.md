# 📚 LEARN.md — Metal-Sheet-Defect-Detector

Welcome to the **Metal-Sheet-Defect-Detector** learning guide! This document explains the project structure, technologies used, and how to contribute effectively.

---

## 🎯 Project Overview

The **Metal-Sheet-Defect-Detector** is a full-stack AI-powered web application that detects defects in steel coil images. Users can upload an image, and the app uses a trained YOLOv8 model to highlight defects directly on the image.

### Key Features
- 📤 Upload steel coil images
- 🤖 Automated defect detection using YOLOv8
- 🖼️ Visual feedback with bounding boxes
- ⚡ Simple, responsive React UI
- 📦 Works offline for local deployment

---

## 🛠 Technology Stack

| Component  | Technology                |
|------------|---------------------------|
| Frontend   | React, Axios               |
| Backend    | Flask, Flask-CORS          |
| ML Model   | YOLOv8 (Ultralytics)       |
| Image Utils| Pillow (PIL), BytesIO      |

---


## 📂 Project Structure 
```
Metal-Sheet-Defect-Detector/
│
├── backend/
│   ├── app.py                  # Flask API with YOLO model
│   └── my_model.pt             # Trained YOLOv8 model file
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   │
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
│
├── Images_to_test/
│   ├── Image...
│
└── README.md
```


---

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Development Workflow

Pick an open issue from the GitHub tracker.

Create a feature branch:
```
git checkout -b feature/your-feature
```

* Make your changes following the project’s code style.

* Test thoroughly.

* Submit a Pull Request with:

    * Clear description of changes

    * Screenshots if UI-related

    * Reference to related issues
---

## 🎯 Areas for Contribution
### 🟢 Beginner-Friendly

* UI styling improvements

* Bug fixes

* Documentation updates

### 🟡 Intermediate

* Optimizing image upload & processing

* Improving detection speed

* Adding frontend error handling

### 🔴 Advanced

* Training YOLOv8 with additional datasets

* Enhancing backend image pre-processing

* Deploying to cloud with CI/CD

---

## 🧪 Testing

* Backend: Use test images to verify YOLO detection output

* Frontend: Ensure UI updates correctly after receiving results

* Use sample images in test_images/ for consistency

## 📚 Learning Resources

[YOLOv8 Documentation](https://docs.ultralytics.com/)

[React Documentation](https://reactjs.org/)

[Flask Documentation](https://flask.palletsprojects.com/)

[Pillow (PIL)](https://pillow.readthedocs.io/)

---

## 🤝 Contributing

Before contributing, please read our [Code of Conduct]("CODE_OF_CONDUCT.md").

Issue Labels:

```good first issue``` — Easy starter tasks

```enhancement``` — New features or improvements

```bug``` — Bug fixes

```documentation``` — Docs-related updates

```gssoc``` - Contribution related to GSSoC

---

## Pull Request Guidelines:

* Keep commits atomic

* Follow code style conventions

* Add necessary documentation updates

* Ensure no breaking changes