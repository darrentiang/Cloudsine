const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const scanBtn = document.getElementById('scanBtn');
const results = document.getElementById('results');
const error = document.getElementById('error');

let selectedFile = null;
let scanResults = null;

// Click to browse
uploadZone.addEventListener('click', () => fileInput.click());

// File selected
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        selectFile(e.target.files[0]);
    }
});

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) {
        selectFile(e.dataTransfer.files[0]);
    }
});

function selectFile(file) {
    selectedFile = file;
    fileName.textContent = `Selected: ${file.name} (${formatSize(file.size)})`;
    fileName.classList.add('show');
    scanBtn.disabled = false;
    results.classList.remove('show');
    error.style.display = 'none';
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Scan file
scanBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    error.style.display = 'none';
    results.classList.remove('show');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Scan failed');
        }

        scanResults = data;
        displayResults(data);
    } catch (err) {
        error.textContent = err.message;
        error.style.display = 'block';
    } finally {
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan File';
    }
});

function displayResults(data) {
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const stats = document.getElementById('stats');

    // Determine threat level
    const malicious = data.stats?.malicious || 0;
    const suspicious = data.stats?.suspicious || 0;

    let icon, text, className;
    if (malicious > 0) {
        icon = '⚠️';
        text = `Threat Detected (${malicious} engines)`;
        className = 'danger';
    } else if (suspicious > 0) {
        icon = '⚡';
        text = 'Suspicious';
        className = 'warning';
    } else {
        icon = '✅';
        text = 'No Threats Found';
        className = 'safe';
    }

    statusIcon.textContent = icon;
    statusText.textContent = text;
    statusText.className = 'status-text ' + className;

    // Display stats
    if (data.stats) {
        stats.innerHTML = `
            <div class="stat">
                <div class="stat-value" style="color: #f87171;">${data.stats.malicious || 0}</div>
                <div class="stat-label">Malicious</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #fbbf24;">${data.stats.suspicious || 0}</div>
                <div class="stat-label">Suspicious</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #4ade80;">${data.stats.harmless || 0}</div>
                <div class="stat-label">Clean</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #a0a0a0;">${data.stats.undetected || 0}</div>
                <div class="stat-label">Undetected</div>
            </div>
        `;
    }

    // Reset AI section
    document.getElementById('aiExplanation').classList.remove('show');
    document.getElementById('aiBtn').textContent = 'Explain with AI';

    results.classList.add('show');
}

// AI Explanation
document.getElementById('aiBtn').addEventListener('click', async () => {
    const aiBtn = document.getElementById('aiBtn');
    const aiExplanation = document.getElementById('aiExplanation');

    if (!scanResults) return;

    aiBtn.disabled = true;
    aiBtn.textContent = 'Analyzing...';

    try {
        const response = await fetch('/api/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scan_results: scanResults })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get explanation');
        }

        aiExplanation.textContent = data.explanation;
        aiExplanation.classList.add('show');
    } catch (err) {
        aiExplanation.textContent = 'Error: ' + err.message;
        aiExplanation.classList.add('show');
    } finally {
        aiBtn.disabled = false;
        aiBtn.textContent = 'Explain with AI';
    }
});
