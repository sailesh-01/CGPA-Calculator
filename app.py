from flask import Flask, render_template, request, send_file
from fpdf import FPDF
import io
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.json
    
    student_name = data.get('student_name', 'Student')
    roll_number = data.get('roll_number', 'N/A')
    department = data.get('department', 'N/A')
    cgpa = data.get('cgpa', 0)
    total_credits = data.get('total_credits', 0)
    semesters = data.get('semesters', [])
    summary = data.get('summary', [])
    scale = data.get('scale', '10-point Scale')

    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Student Academic Performance Report", align="C", ln=True)
    pdf.ln(5)
    
    # Student Info
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 8, f"Name: {student_name}", ln=True)
    pdf.cell(0, 8, f"Roll Number: {roll_number}", ln=True)
    pdf.cell(0, 8, f"Department: {department}", ln=True)
    pdf.cell(0, 8, f"Grade Scale: {scale}", ln=True)
    pdf.ln(10)
    
    # Summary metrics
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "Overall Summary", ln=True)
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 8, f"Total Credits: {total_credits}", ln=True)
    pdf.cell(0, 8, f"Final CGPA: {cgpa:.2f}", ln=True)
    pdf.ln(5)
    
    # Semester breakdown
    if summary:
        pdf.set_font("helvetica", "B", 14)
        pdf.cell(0, 10, "Semester-wise Breakdown", ln=True)
        pdf.set_font("helvetica", "B", 12)
        
        # Table Header
        col_widths = [30, 40, 40, 40]
        headers = ["Semester", "Credits", "SGPA", "Running CGPA"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, border=1, align="C")
        pdf.ln()
        
        # Table Data
        pdf.set_font("helvetica", "", 12)
        for row in summary:
            pdf.cell(col_widths[0], 10, str(row["semester"]), border=1, align="C")
            pdf.cell(col_widths[1], 10, str(row["credits"]), border=1, align="C")
            pdf.cell(col_widths[2], 10, f"{row['sgpa']:.2f}", border=1, align="C")
            pdf.cell(col_widths[3], 10, f"{row['cgpa']:.2f}", border=1, align="C")
            pdf.ln()
            
        pdf.ln(10)
    
    # Detailed Subjects
    if semesters:
        pdf.set_font("helvetica", "B", 14)
        pdf.cell(0, 10, "Detailed Subject Grades", ln=True)
        
        for sem in semesters:
            pdf.set_font("helvetica", "B", 12)
            pdf.cell(0, 8, f"Semester {sem['semesterIndex']}", ln=True)
            pdf.set_font("helvetica", "", 11)
            for sub in sem['subjects']:
                pdf.cell(0, 6, f"- {sub['name']} ({sub['credits']} credits): {sub['grade']}", ln=True)
            pdf.ln(3)
            
    # Output PDF
    pdf_bytes = pdf.output(dest="S").encode("latin-1")
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"{roll_number}_CGPA_Report.pdf"
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)
