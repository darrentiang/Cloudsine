# CloudsineAI WebTest - Project Documentation

> A file scanning web application with AI-powered result explanation

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Data Flow](#data-flow)
6. [Implementation Phases](#implementation-phases)
7. [API Reference](#api-reference)

---

## Overview

**What we're building:**
A web application that allows users to upload files, scan them for malware using VirusTotal, and receive AI-generated explanations of the results in plain English.

**Core Features:**
- File upload with validation
- VirusTotal malware scanning
- Gemini AI result explanation
- Clean, user-friendly interface

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.x + Flask |
| **Frontend** | HTML, CSS, JavaScript |
| **File Scanning** | VirusTotal API |
| **AI Explanation** | Google Gemini API |
| **Hosting** | AWS EC2 (Ubuntu) |
| **Web Server** | Gunicorn + Nginx |
| **Containerization** | Docker (optional) |

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│                    (Web Browser)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS EC2 INSTANCE                          │
│  ┌─────────────┐    ┌─────────────────────────────────┐     │
│  │   Nginx     │───▶│      Flask Application          │     │
│  │  (Reverse   │    │  ┌───────────┐ ┌─────────────┐  │     │
│  │   Proxy)    │    │  │  Routes   │ │  Services   │  │     │
│  └─────────────┘    │  └───────────┘ └─────────────┘  │     │
│                     └─────────────────────────────────┘     │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
                      ▼                   ▼
              ┌──────────────┐    ┌──────────────┐
              │  VirusTotal  │    │   Gemini     │
              │     API      │    │    API       │
              └──────────────┘    └──────────────┘
```

### Flask vs Next.js (Reference)

| Next.js | Flask | Purpose |
|---------|-------|---------|
| `pages/` | `templates/` | HTML pages |
| `pages/api/` | `routes/` | API endpoints |
| `lib/` | `services/` | Business logic |
| `public/` | `static/` | Static assets |
| `package.json` | `requirements.txt` | Dependencies |

---

## Project Structure

```
Cloudsine/
│
├── app/
│   ├── __init__.py              # Flask app factory
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── main.py              # Page routes (GET /)
│   │   └── api.py               # API routes (POST /api/scan)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── virustotal.py        # VirusTotal API client
│   │   └── gemini.py            # Gemini API client
│   │
│   ├── templates/
│   │   ├── base.html            # Base layout
│   │   └── index.html           # Main upload page
│   │
│   └── static/
│       ├── css/
│       │   └── style.css        # Styles
│       └── js/
│           └── main.js          # Frontend logic
│
├── config.py                     # Configuration
├── run.py                        # Entry point
├── requirements.txt              # Python dependencies
├── .env                          # API keys (not committed)
├── .gitignore                    # Git ignore rules
├── Dockerfile                    # Docker config (Phase 4)
└── DOCUMENTATION.md              # This file
```

---

## Data Flow

### File Scan Process

```
Step 1: UPLOAD
──────────────
User selects file → Frontend validates (size/type) → Sends to /api/scan

Step 2: SCAN
────────────
Backend receives file → Uploads to VirusTotal → Gets scan ID → Polls for results

Step 3: ANALYZE
───────────────
Results received → Sends to Gemini API → AI generates plain-English explanation

Step 4: DISPLAY
───────────────
JSON response → Frontend renders results → Shows threat level + AI explanation
```

### API Request Flow

```
POST /api/scan
     │
     ▼
┌─────────────────┐
│ Validate File   │──── Invalid ────▶ Return 400 Error
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────┐
│ Upload to       │──── Failed ─────▶ Return 500 Error
│ VirusTotal      │
└────────┬────────┘
         │ Success
         ▼
┌─────────────────┐
│ Poll for        │──── Timeout ────▶ Return 408 Error
│ Results         │
└────────┬────────┘
         │ Complete
         ▼
┌─────────────────┐
│ Send to Gemini  │
│ for Explanation │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return JSON     │
│ Response        │
└─────────────────┘
```

---

## Implementation Phases

### Phase 1: Account Setup ✅
- [x] Create AWS account
- [x] Get VirusTotal API key
- [x] Get Gemini API key
- [ ] Install Docker (deferred)

### Phase 2: Local Development
Build the Flask application locally.

| Step | Task | Files Created |
|------|------|---------------|
| 2.1 | Initialize project | `requirements.txt`, `.gitignore`, `.env` |
| 2.2 | Create Flask app factory | `app/__init__.py`, `config.py`, `run.py` |
| 2.3 | Build VirusTotal service | `app/services/virustotal.py` |
| 2.4 | Build Gemini service | `app/services/gemini.py` |
| 2.5 | Create API routes | `app/routes/api.py` |
| 2.6 | Create page routes | `app/routes/main.py` |
| 2.7 | Build frontend | `templates/`, `static/` |

### Phase 3: Local Testing
- Test with sample files (malicious + clean)
- Verify VirusTotal integration
- Verify Gemini explanation
- Test error handling

### Phase 4: Dockerization
- Create `Dockerfile`
- Create `docker-compose.yml`
- Test containerized build

### Phase 5: AWS EC2 Setup
| Step | Task |
|------|------|
| 5.1 | Launch EC2 instance (Ubuntu, t2.micro) |
| 5.2 | Configure Security Group (ports 22, 80, 443) |
| 5.3 | SSH into instance |
| 5.4 | Install Python, pip, Nginx |
| 5.5 | Configure Nginx as reverse proxy |

### Phase 6: Deployment
| Step | Task |
|------|------|
| 6.1 | Clone repository to EC2 |
| 6.2 | Set up virtual environment |
| 6.3 | Install dependencies |
| 6.4 | Configure environment variables |
| 6.5 | Run with Gunicorn |
| 6.6 | Test public access |

### Phase 7: CI/CD Pipeline (Bonus)
- GitHub Actions workflow
- Automated testing
- Auto-deploy on push to main

---

## API Reference

### Internal API Endpoints

#### `POST /api/scan`
Upload and scan a file.

**Request:**
```
Content-Type: multipart/form-data
Body: file (binary)
```

**Response:**
```json
{
  "success": true,
  "filename": "example.js",
  "scan_id": "abc123...",
  "stats": {
    "malicious": 5,
    "suspicious": 2,
    "harmless": 60,
    "undetected": 3
  },
  "threat_level": "high",
  "ai_explanation": "This file has been flagged as potentially dangerous..."
}
```

#### `GET /api/status/<scan_id>`
Check scan status (if implementing async scanning).

---

### External APIs Used

#### VirusTotal API
- **Docs:** https://docs.virustotal.com/reference/overview
- **Rate Limit:** 4 requests/min (free tier)
- **Endpoints Used:**
  - `POST /files` - Upload file
  - `GET /analyses/{id}` - Get results

#### Gemini API
- **Docs:** https://ai.google.dev/gemini-api/docs
- **Model:** gemini-pro
- **Endpoint:** `generateContent`

---

## Quick Commands Reference

```bash
# Local Development
python -m venv venv              # Create virtual environment
venv\Scripts\activate            # Activate (Windows)
pip install -r requirements.txt  # Install dependencies
python run.py                    # Run development server

# Docker
docker build -t cloudsine .      # Build image
docker run -p 5000:5000 cloudsine # Run container

# EC2 Deployment
ssh -i key.pem ubuntu@<ip>       # Connect to EC2
sudo systemctl restart nginx     # Restart Nginx
```

---

*Last Updated: January 2025*
