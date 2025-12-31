let db;
let currentUser = null;

// Initialize Database (Mocking the sql.js load for this example)
async function initDB() {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
    // In a real app, you'd fetch your .sqlite file here
    db = new SQL.Database();
    // RUN THE SCHEMA SCRIPT HERE (Omitted for brevity, use your SQLite script)
}

// LOGIN LOGIC (Flowchart: Validate Credentials -> Check Role)
function handleLogin() {
    const userInput = document.getElementById('username').value;
    
    // Query your Users table
    const result = db.exec(`SELECT UserID, RoleID, Username FROM Users WHERE Username = '${userInput}'`);
    
    if (result.length > 0) {
        currentUser = {
            id: result[0].values[0][0],
            role: result[0].values[0][1],
            name: result[0].values[0][2]
        };
        showDashboard();
    } else {
        alert("Invalid User!");
    }
}

function showDashboard() {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('app-section').classList.remove('d-none');
    
    const menu = document.getElementById('dynamic-menu');
    const title = document.getElementById('role-title');
    menu.innerHTML = "";

    // Role-Based UI Rendering (Flowchart: Check Role)
    if (currentUser.role === 1) {
        title.innerText = "Admin: System Overview";
        renderAdminMenu(menu);
        renderAdminAnalytics();
    } else if (currentUser.role === 2) {
        title.innerText = "Recruiter: Hiring Pipeline";
        renderRecruiterMenu(menu);
        renderCandidateMatching(); // Flowchart: Review Candidates
    } else {
        title.innerText = "Candidate: My Career";
        renderCandidateMenu(menu);
        renderJobPostings(); // Flowchart: Browse Jobs
    }
}

// FEATURE: Candidate Matching (vw_CandidateMatchScore)
function renderCandidateMatching() {
    const container = document.getElementById('view-content');
    const matchingData = db.exec("SELECT * FROM vw_CandidateMatchScore ORDER BY TotalMatchScore DESC");

    let html = `<h3>Top Weighted Matches</h3>
                <table class="table table-hover bg-white shadow-sm rounded">
                    <thead class="table-light">
                        <tr><th>Candidate</th><th>Job Title</th><th>Experience Score</th><th>Match Score</th><th>Action</th></tr>
                    </thead><tbody>`;

    if (matchingData.length > 0) {
        matchingData[0].values.forEach(row => {
            html += `<tr>
                <td>${row[1]}</td>
                <td>${row[3]}</td>
                <td>${row[5]}</td>
                <td class="match-score-badge">${row[7]}%</td>
                <td><button onclick="updateStatus(${row[0]}, 2)" class="btn btn-sm btn-primary">Screen</button></td>
            </tr>`;
        });
    }
    html += "</tbody></table>";
    container.innerHTML = html;
}

// Initialize on load
initDB();
