# File Scanner

---

## Live Demo

**URL:** http://3.27.189.247

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Setup Instructions](#setup-instructions)
5. [Project Structure](#project-structure)
6. [Design Choices](#design-choices)
7. [Challenges & Solutions](#challenges--solutions)
8. [Development Process](#development-process)

---

## Features

- **File Upload**: Drag-and-drop or click to browse file upload
- **VirusTotal Integration**: Scans files using 70+ antivirus engines
- **AI Analysis**: Gemini-powered plain English explanation of scan results
- **Real-time Progress**: Visual feedback during scanning process
- **Responsive UI**: Clean, minimal interface

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11, Flask |
| Frontend | HTML, CSS, JavaScript |
| File Scanning | VirusTotal API |
| AI Explanation | Google Gemini API |
| Server | Gunicorn (WSGI) |
| Containerization | Docker |
| Hosting | AWS EC2 (Ubuntu, t2.micro) |

---

## Architecture

### Data Flow

```
User uploads file
       │
       ▼
┌─────────────────┐
│   Flask App     │
│   /api/scan     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  VirusTotal     │
│  API Service    │
│  - Upload file  │
│  - Poll results │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini API     │
│  Service        │
│  - Explain      │
│    results      │
└────────┬────────┘
         │
         ▼
   JSON Response
   to Frontend
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main page |
| `/api/scan` | POST | Upload and scan file |
| `/api/explain` | POST | Get AI explanation |

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Docker (optional)
- VirusTotal API key
- Google Gemini API key

### Option 1: Run Locally (Without Docker)

```bash
# Clone the repository
git clone https://github.com/darrentiang/Cloudsine.git
cd Cloudsine

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Run the application
python run.py
```

Open http://localhost:5000

### Option 2: Run with Docker

```bash
# Clone the repository
git clone https://github.com/darrentiang/Cloudsine.git
cd Cloudsine

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Build Docker image
docker build -t file-scanner .

# Run container
docker run -p 5000:5000 --env-file .env file-scanner
```

Open http://localhost:5000

### Option 3: Deploy to AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Install Docker
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker

# Clone repository
git clone https://github.com/darrentiang/Cloudsine.git
cd Cloudsine

# Create .env file with your API keys
nano .env

# Build and run
docker build -t file-scanner .
docker run -d -p 80:5000 --env-file .env --restart always file-scanner
```

---

## Project Structure

```
Cloudsine/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── routes/
│   │   ├── main.py           # Page routes
│   │   └── api.py            # API endpoints
│   ├── services/
│   │   ├── virustotal.py     # VirusTotal API client
│   │   └── gemini.py         # Gemini API client
│   ├── templates/
│   │   └── index.html        # Main page
│   └── static/
│       ├── css/style.css     # Styles
│       └── js/main.js        # Frontend logic
├── files/                     # Sample test files
├── config.py                  # Configuration
├── run.py                     # Entry point
├── requirements.txt           # Dependencies
├── Dockerfile                 # Docker configuration
└── .env.example              # Environment template
```

## Challenges & Solutions

### 1. VirusTotal Async Processing

**Challenge:** VirusTotal doesn't return results immediately - scans take 1-3 minutes.

**Solution:** Implemented polling mechanism that checks status every 20 seconds until scan completes. Added progress indicators on frontend to keep users informed.

### 2. Rate Limiting

**Challenge:** VirusTotal free tier limits to 4 requests/minute.

**Solution:** Added 20-second delays between poll requests to stay within limits.

### 3. Conflict Errors

**Challenge:** Uploading recently scanned files caused 409 Conflict errors.

**Solution:** Could check file hash first to avoid re-uploading.

### 4. Flask to Next.js Mental Model

**Challenge:** Coming from Next.js background, Flask patterns were unfamiliar.

**Solution:** Mapped Flask concepts to Next.js equivalents:
- `routes/` → `pages/api/`
- `templates/` → `pages/`
- `Blueprint` → file-based routing
- `request` → `req` object

---

## Development Process

### Phase 0: Planning & Architecture
Scoped out the project phases and mapped out the architecture. Researched Flask patterns (coming from Next.js background), planned the project structure, and defined the data flow between frontend, backend, and external APIs.

### Phase 1: Account Setup
Set up accounts and obtained API keys for AWS, VirusTotal, and Google Gemini.

### Phase 2: Local Development
Built the Flask application with VirusTotal and Gemini API integration. Structured the project with separate services, routes, and templates.

### Phase 3: Local Testing
Tested the application locally with sample files (both clean and malicious) to verify VirusTotal scanning and Gemini explanations work correctly.

### Phase 4: Dockerization
Created Dockerfile to containerize the application. Used Gunicorn as the production WSGI server instead of Flask's development server.

### Phase 5: AWS EC2 Setup
Launched Ubuntu t2.micro instance, configured security groups for SSH (port 22) and HTTP (port 80), and installed Docker on the server.

### Phase 6: Deploy to EC2
Cloned repository to EC2, configured environment variables, built Docker image, and ran the container. Application now live at http://3.27.189.247

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VIRUSTOTAL_API_KEY` | VirusTotal API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FLASK_ENV` | `development` or `production` |
| `FLASK_DEBUG` | `True` or `False` |
| `SECRET_KEY` | Flask secret key |

---

## Sample Test Files

The `files/` directory contains test files:

| File | Type | Expected Result |
|------|------|-----------------|
| `jquery-3.5.1.min.js` | Clean | No threats |
| `moment.min.js` | Clean | No threats |
| `obfuscated_cryptomine.js` | Malicious | Threat detected |
| `forbes_magecart_skimmer.js` | Malicious | Threat detected |
| `newegg_magecart_skimmer.js` | Malicious | Threat detected |

---

## Future Improvements

- Add file hash checking to avoid re-uploading known files
- Support batch file uploads
- Add more detailed scan reports
- CI/CD pipeline for automated deployments

---

## Acknowledgments

- [VirusTotal](https://www.virustotal.com/) for the malware scanning API
- [Google Gemini](https://ai.google.dev/) for AI explanations
- [Flask](https://flask.palletsprojects.com/) for the web framework
