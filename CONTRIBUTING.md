# 🤝 Contributing to Metal-Sheet-Defect-Detector

Thank you for your interest in contributing to **Metal-Sheet-Defect-Detector**! Your help — whether it's fixing bugs, improving the UI, optimizing the model, or improving docs — is greatly appreciated.

---

## Code of Conduct

Please follow the project's [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, inclusive, and professional in all interactions.

---

## 📌 How to Contribute

Follow these steps to contribute code, documentation, tests, or improvements.

1. **Fork** the repository using the GitHub UI.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/<your-username>/Metal-Sheet-Defect-Detector.git
   cd Metal-Sheet-Defect-Detector
   ```

3. **Add upstream** (one-time):

   ```bash
   git remote add upstream https://github.com/<original-owner>/Metal-Sheet-Defect-Detector.git
   ```

4. **Create a branch** for your work (use descriptive names):

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/short-description
   ```

5. **Make changes** in your branch. Keep changes focused and small — small PRs are easier to review.

6. **Test locally** (see the _Running the project_ section below).

7. **Commit** with a clear, descriptive message:

   ```bash
   git add .
   git commit -m "feat: add confidence score to detection output"
   ```

   Recommended commit style: Conventional Commits (e.g., `feat:`, `fix:`, `docs:`).

8. **Sync** with upstream to avoid merge conflicts:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

9. **Push** your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

10. **Open a Pull Request** against the repository `main` branch. In the PR description include:
    - A short summary of changes
    - Why the change is needed
    - Any setup or testing notes
    - Links to related issues (e.g., `Closes #12`)

---

## Pull Request Checklist

Before requesting a review, ensure:

- [ ] The code builds and runs locally
- [ ] No obvious console errors or warnings
- [ ] Relevant tests (if any) pass
- [ ] Documentation (README, CONTRIBUTING) updated if needed
- [ ] Changes are split into logical commits
- [ ] Screenshots/GIFs added for UI changes

---

## Running the Project Locally

### Backend (Flask)

#### Please execute the following commands at root directory:

1. Create & activate a virtual environment (recommended):

   #### On macOS / Linux
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
   
   #### On Windows
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   # requirements file exists in repo root
   pip install -r requirements.txt

   # OR install core packages manually
   pip install flask flask-cors ultralytics pillow
   ```

4. Run the backend server:

   ```bash
   cd backend
   python app.py
   ```

The backend will expose an API endpoint (e.g., `POST /detect`) that accepts an image and returns a result image.

### **_Add venv/ to .gitignore before comming changes on the branches._**


### Frontend (React)

#### Please execute the following commands at root directory:

1. Install dependencies and start dev server:

   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Open the app in the browser (usually at `http://localhost:3000`) and test uploading images from `Images_to_test/`.

---

## Testing Changes

- Manually test end-to-end: upload an image via the frontend and verify detection boxes appear and are accurate.
- Add unit tests where appropriate (frontend: Jest, backend: pytest or unittest).
- If you update the model or inference code, include sample inputs and expected outputs to help reviewers.

---

## 📂 Project Structure

```
Metal-Sheet-Defect-Detector/
├── backend/           # Flask API and model files
│   ├── app.py         # Flask application (routes + inference)
│   └── my_model.pt    # Trained YOLO model weights
├── frontend/          # React application
│   ├── public/        # Static assets
│   └── src/           # React source code (App.js, components)
├── Images_to_test/    # Sample images for quick local testing
└── venv/              # Virtual Environment on Windows Operating System
    ├── Include
    ├── Lib
    ├── Scripts
    ├── share
    ├── .gitignore
    └── pyvenv.cfg
└── README.md
└── requirements.txt   #For creating venv
```

---

## Ideas for Contributions

- Improve UI/UX (drag & drop, progress indicators)
- Add support for batch image uploads
- Add model performance improvements and quantization
- Add unit/integration tests and CI workflow
- Implement an image results history and download feature
- Add support for multiple model checkpoints and model selection
- Improve error handling, logging, and deployment docs

---

## Security & Privacy

- Do **not** commit model weights or private datasets to the public repo (use LFS or external storage if necessary).
- Avoid leaking sensitive data in logs or error messages.
- If adding third-party services, document required credentials and usage.

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [**MIT License**](LICENSE).

---

## Need Help?

If you're unsure where to start, open an issue describing what you'd like to work on or ask for help — maintainers and contributors will guide you.

Thank you for helping improve Metal-Sheet-Defect-Detector! 🙌

