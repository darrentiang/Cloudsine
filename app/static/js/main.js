const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const scanBtn = document.getElementById('scanBtn');
const results = document.getElementById('results');
const error = document.getElementById('error');

let selectedFile = null;

uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) selectFile(e.target.files[0]);
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
});

function selectFile(file) {
    selectedFile = file;
    fileName.textContent = `${file.name} (${formatSize(file.size)})`;
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

scanBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    scanBtn.disabled = true;
    error.style.display = 'none';
    results.classList.remove('show');

    // Progress step 1: Uploading
    updateButtonStatus('Uploading file');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // Progress step 2: After short delay, show scanning
        const scanPromise = fetch('/api/scan', {
            method: 'POST',
            body: formData
        });

        // Show scanning message after 2 seconds (upload is usually quick)
        setTimeout(() => {
            if (scanBtn.disabled) {
                updateButtonStatus('Scanning with 70+ engines');
            }
        }, 2000);

        // Show processing message after 30 seconds
        setTimeout(() => {
            if (scanBtn.disabled) {
                updateButtonStatus('Still scanning');
            }
        }, 30000);

        const response = await scanPromise;

        // Progress step 3: Processing
        updateButtonStatus('Processing results');

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Scan failed');

        displayResults(data);
        loadExplanation(data);

    } catch (err) {
        error.textContent = err.message;
        error.style.display = 'block';
    } finally {
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan File';
        scanBtn.classList.remove('loading-dots');
    }
});

function updateButtonStatus(text) {
    scanBtn.innerHTML = `<span class="loading-dots">${text}</span>`;
}

function displayResults(data) {
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const stats = document.getElementById('stats');

    const malicious = data.stats?.malicious || 0;

    if (malicious > 0) {
        statusIcon.textContent = '';
        statusText.textContent = 'Threat Detected';
        statusText.className = 'status-text danger';
    } else {
        statusIcon.textContent = '';
        statusText.textContent = 'No Threats Found';
        statusText.className = 'status-text safe';
    }

    stats.innerHTML = `
        <div class="stat">
            <div class="stat-value">${data.stats?.malicious || 0}</div>
            <div class="stat-label">Malicious</div>
        </div>
        <div class="stat">
            <div class="stat-value">${data.stats?.suspicious || 0}</div>
            <div class="stat-label">Suspicious</div>
        </div>
        <div class="stat">
            <div class="stat-value">${data.stats?.harmless || 0}</div>
            <div class="stat-label">Clean</div>
        </div>
        <div class="stat">
            <div class="stat-value">${data.stats?.undetected || 0}</div>
            <div class="stat-label">Undetected</div>
        </div>
    `;

    results.classList.add('show');
}

async function loadExplanation(scanData) {
    const aiExplanation = document.getElementById('aiExplanation');

    aiExplanation.innerHTML = '<span class="loading-dots">Generating analysis</span>';
    aiExplanation.classList.add('show', 'loading');

    try {
        const response = await fetch('/api/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scan_results: scanData })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        aiExplanation.textContent = data.explanation;
        aiExplanation.classList.remove('loading');

    } catch {
        aiExplanation.textContent = 'Could not generate analysis.';
        aiExplanation.classList.remove('loading');
    }
}
