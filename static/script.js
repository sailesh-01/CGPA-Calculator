const GRADE_SCALES = {
    "10": { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "Pass": 4, "F": 0 },
    "4": { "A": 4, "B": 3, "C": 2, "D": 1, "F": 0 }
};

let currentNumSemesters = 0;
let currentTab = 1;
let semesterData = {}; // Format: { 1: [{id: 1, name: '', credits: 3, grade: 'A'}...] }
let chartInstance = null;

// DOM Elements
const numSemestersInput = document.getElementById('numSemesters');
const gradeScaleSelect = document.getElementById('gradeScale');
const semesterTabs = document.getElementById('semesterTabs');
const tabContentArea = document.getElementById('tabContentArea');
const summaryTabContent = document.getElementById('summaryTabContent');
const overallCgpaDisplay = document.getElementById('overallCgpaDisplay');
const totalCreditsDisplay = document.getElementById('totalCreditsDisplay');
const summaryTableBody = document.getElementById('summaryTableBody');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Initialize
function init() {
    setupEventListeners();
    updateSemesters(parseInt(numSemestersInput.value));
}

function setupEventListeners() {
    numSemestersInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (val < 1) val = 1;
        if (val > 10) val = 10;
        e.target.value = val;
        updateSemesters(val);
    });

    gradeScaleSelect.addEventListener('change', () => {
        // Re-render current semester to update dropdowns
        renderSemesterContent(currentTab);
        calculateOverall();
    });

    downloadPdfBtn.addEventListener('click', generatePDF);
}

function updateSemesters(count) {
    // Add new semesters if needed
    for (let i = 1; i <= count; i++) {
        if (!semesterData[i]) {
            semesterData[i] = [
                { id: Date.now() + i, name: `Subject ${i}.1`, credits: 3, grade: getFirstGrade() },
                { id: Date.now() + i + 1, name: `Subject ${i}.2`, credits: 3, grade: getFirstGrade() }
            ];
        }
    }
    
    currentNumSemesters = count;
    if (currentTab > count && currentTab !== 'summary') {
        currentTab = count;
    }
    
    renderTabs();
    
    if (currentTab === 'summary') {
        showSummary();
    } else {
        renderSemesterContent(currentTab);
    }
    calculateOverall();
}

function getFirstGrade() {
    const scaleType = gradeScaleSelect.value;
    return Object.keys(GRADE_SCALES[scaleType])[0];
}

function renderTabs() {
    semesterTabs.innerHTML = '';
    
    for (let i = 1; i <= currentNumSemesters; i++) {
        const tab = document.createElement('div');
        tab.className = `tab ${currentTab === i ? 'active' : ''}`;
        tab.textContent = `Semester ${i}`;
        tab.onclick = () => switchTab(i);
        semesterTabs.appendChild(tab);
    }
    
    // Summary tab
    const summaryTab = document.createElement('div');
    summaryTab.className = `tab ${currentTab === 'summary' ? 'active' : ''}`;
    summaryTab.textContent = `📊 Summary`;
    summaryTab.onclick = () => switchTab('summary');
    semesterTabs.appendChild(summaryTab);
}

function switchTab(tabId) {
    currentTab = tabId;
    renderTabs();
    
    if (tabId === 'summary') {
        tabContentArea.classList.add('hidden');
        summaryTabContent.classList.remove('hidden');
        showSummary();
    } else {
        summaryTabContent.classList.add('hidden');
        tabContentArea.classList.remove('hidden');
        renderSemesterContent(tabId);
    }
}

function renderSemesterContent(semId) {
    if (semId === 'summary') return;
    
    const data = semesterData[semId];
    const scaleType = gradeScaleSelect.value;
    const grades = Object.keys(GRADE_SCALES[scaleType]);
    
    let html = `
        <div class="card">
            <h2>Semester ${semId} Grades</h2>
            <div class="subject-header">
                <div>Subject Name</div>
                <div>Credits</div>
                <div>Grade</div>
                <div></div>
            </div>
            <div id="subjectsList-${semId}">
    `;
    
    data.forEach((sub, index) => {
        let gradeOptions = grades.map(g => `<option value="${g}" ${sub.grade === g ? 'selected' : ''}>${g}</option>`).join('');
        // Fallback if grade not in new scale
        if (!grades.includes(sub.grade)) {
            sub.grade = grades[0];
            gradeOptions = grades.map(g => `<option value="${g}" ${sub.grade === g ? 'selected' : ''}>${g}</option>`).join('');
        }

        html += `
            <div class="subject-row">
                <input type="text" value="${sub.name}" onchange="updateSubject(${semId}, ${index}, 'name', this.value)" placeholder="Subject Name">
                <input type="number" min="0" max="10" value="${sub.credits}" onchange="updateSubject(${semId}, ${index}, 'credits', this.value)">
                <select onchange="updateSubject(${semId}, ${index}, 'grade', this.value)">
                    ${gradeOptions}
                </select>
                <button class="btn btn-danger" onclick="removeSubject(${semId}, ${index})" ${data.length === 1 ? 'disabled' : ''}>❌</button>
            </div>
        `;
    });
    
    html += `
            </div>
            <button class="btn btn-outline" onclick="addSubject(${semId})">➕ Add Subject</button>
        </div>
    `;
    
    tabContentArea.innerHTML = html;
}

window.updateSubject = (semId, index, field, value) => {
    if (field === 'credits') value = parseInt(value) || 0;
    semesterData[semId][index][field] = value;
    calculateOverall();
}

window.addSubject = (semId) => {
    semesterData[semId].push({
        id: Date.now(),
        name: 'New Subject',
        credits: 3,
        grade: getFirstGrade()
    });
    renderSemesterContent(semId);
    calculateOverall();
}

window.removeSubject = (semId, index) => {
    if (semesterData[semId].length > 1) {
        semesterData[semId].splice(index, 1);
        renderSemesterContent(semId);
        calculateOverall();
    }
}

function calculateOverall() {
    const scaleType = gradeScaleSelect.value;
    const scale = GRADE_SCALES[scaleType];
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    for (let i = 1; i <= currentNumSemesters; i++) {
        let semCredits = 0;
        let semPoints = 0;
        
        semesterData[i].forEach(sub => {
            const pts = scale[sub.grade] * sub.credits;
            semCredits += sub.credits;
            semPoints += pts;
        });
        
        totalCredits += semCredits;
        totalPoints += semPoints;
    }
    
    let cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    
    overallCgpaDisplay.textContent = cgpa.toFixed(2);
    totalCreditsDisplay.textContent = totalCredits;
    
    // Color coding
    let isHigh = scaleType === "10" ? cgpa >= 8.0 : cgpa >= 3.2;
    let isMid = scaleType === "10" ? cgpa >= 6.0 : cgpa >= 2.0;
    
    overallCgpaDisplay.className = 'cgpa-display'; // reset
    if (isHigh) overallCgpaDisplay.classList.add('color-green');
    else if (isMid) overallCgpaDisplay.classList.add('color-yellow');
    else overallCgpaDisplay.classList.add('color-red');
}

function showSummary() {
    const scaleType = gradeScaleSelect.value;
    const scale = GRADE_SCALES[scaleType];
    
    let summaryData = [];
    let cumPoints = 0;
    let cumCredits = 0;
    let labels = [];
    let sgpaData = [];
    let cgpaData = [];
    
    summaryTableBody.innerHTML = '';
    
    for (let i = 1; i <= currentNumSemesters; i++) {
        let semCredits = 0;
        let semPoints = 0;
        
        semesterData[i].forEach(sub => {
            semCredits += sub.credits;
            semPoints += scale[sub.grade] * sub.credits;
        });
        
        cumCredits += semCredits;
        cumPoints += semPoints;
        
        let sgpa = semCredits > 0 ? (semPoints / semCredits) : 0;
        let runningCgpa = cumCredits > 0 ? (cumPoints / cumCredits) : 0;
        
        summaryData.push({ semester: i, credits: semCredits, sgpa, cgpa: runningCgpa });
        
        labels.push(`Sem ${i}`);
        sgpaData.push(sgpa.toFixed(2));
        cgpaData.push(runningCgpa.toFixed(2));
        
        summaryTableBody.innerHTML += `
            <tr>
                <td>${i}</td>
                <td>${semCredits}</td>
                <td><strong>${sgpa.toFixed(2)}</strong></td>
                <td><strong>${runningCgpa.toFixed(2)}</strong></td>
            </tr>
        `;
    }
    
    renderChart(labels, sgpaData, cgpaData, scaleType);
}

function renderChart(labels, sgpaData, cgpaData, scaleType) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const maxVal = scaleType === "10" ? 10 : 4;
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'SGPA',
                    data: sgpaData,
                    borderColor: '#94a3b8',
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'CGPA (Running)',
                    data: cgpaData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: maxVal
                }
            }
        }
    });
}

function generatePDF() {
    const scaleType = gradeScaleSelect.value;
    const scale = GRADE_SCALES[scaleType];
    const scaleName = scaleType === "10" ? "10-point Scale" : "4-point Scale";
    
    let summaryData = [];
    let cumPoints = 0;
    let cumCredits = 0;
    
    let semestersList = [];
    
    for (let i = 1; i <= currentNumSemesters; i++) {
        let semCredits = 0;
        let semPoints = 0;
        
        semesterData[i].forEach(sub => {
            semCredits += sub.credits;
            semPoints += scale[sub.grade] * sub.credits;
        });
        
        cumCredits += semCredits;
        cumPoints += semPoints;
        
        let sgpa = semCredits > 0 ? (semPoints / semCredits) : 0;
        let runningCgpa = cumCredits > 0 ? (cumPoints / cumCredits) : 0;
        
        summaryData.push({ semester: i, credits: semCredits, sgpa, cgpa: runningCgpa });
        semestersList.push({ semesterIndex: i, subjects: semesterData[i] });
    }
    
    const payload = {
        student_name: document.getElementById('studentName').value,
        roll_number: document.getElementById('rollNumber').value,
        department: document.getElementById('department').value,
        scale: scaleName,
        cgpa: parseFloat(overallCgpaDisplay.textContent),
        total_credits: parseInt(totalCreditsDisplay.textContent),
        summary: summaryData,
        semesters: semestersList
    };
    
    const btn = document.getElementById('downloadPdfBtn');
    btn.textContent = 'Generating...';
    btn.disabled = true;
    
    fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error("Network error");
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${payload.roll_number}_CGPA_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(err => {
        alert("Failed to generate PDF. Make sure Flask backend is running.");
        console.error(err);
    })
    .finally(() => {
        btn.textContent = '📄 Download PDF Report';
        btn.disabled = false;
    });
}

// Start
init();
