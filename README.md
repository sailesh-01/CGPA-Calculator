# 🎓 Student CGPA Calculator

A modern, full-stack web application to calculate, track, and generate PDF reports for semester-wise SGPA and overall CGPA.

## ✨ Features

*   **Real-time Calculation:** Instantly calculates SGPA and CGPA as you type.
*   **Dynamic Subject Management:** Easily add or remove subjects per semester. Supports 0-credit papers that don't affect your CGPA!
*   **Multiple Grade Scales:** Switch seamlessly between standard 10-point (O, A+, A...) and 4-point (A, B, C...) scales.
*   **Performance Tracking:** Visualizes your academic journey with beautiful, interactive trend charts powered by Chart.js.
*   **PDF Report Generation:** Click a single button to export a beautifully formatted PDF summary of your entire academic performance.
*   **Modern UI/UX:** Features a sleek, responsive, glassmorphic design that looks great on both desktop and mobile.

## 🛠️ Technology Stack

*   **Backend:** Python (Flask)
*   **Frontend:** Vanilla HTML, CSS, JavaScript
*   **Libraries:** `fpdf2` (PDF Generation), `Chart.js` (Data Visualization)

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sailesh-01/CGPA-Calculator.git
   cd CGPA-Calculator
   ```

2. **Create a virtual environment (Recommended):**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server:**
   ```bash
   # Windows users can simply double click:
   start.bat
   
   # Or run via Python:
   python app.py
   ```

5. **Open the app:**
   Navigate to `http://127.0.0.1:5000` in your web browser.

## 🌍 Deployment

To deploy this application to a service like Render or Heroku, ensure your `Start Command` is configured for a standard web application, for example:

```bash
gunicorn app:app
```
*(Note: You will need to add `gunicorn` to your `requirements.txt` for production deployment).*
