# AI Interview Bot – Virtual Interviewer with Multilingual Voice Interaction

> Inspired by enterprise recruitment platforms (such as HCL's AI interview bot) designed for campus placements, software engineering rounds, aptitude assessments, and HR interviews.

![Enterprise Interview Simulator](https://img.shields.io/badge/Architecture-FastAPI%20%2B%20React%20%2B%20Three.js-indigo)
![Multilingual](https://img.shields.io/badge/Languages-EN%20%7C%20TE%20%7C%20HI%20%7C%20TA%20%7C%20KN%20%7C%20ML-cyan)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Web-blue)
![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%20%2B%20Offline%20NLP-purple)

---

## 🌟 Key Capabilities

1. **Animated 3D Virtual Interviewer Avatar**:
   - Built with Three.js featuring 6 animated emotional states:
     - **Idle**: Natural breathing sway, realistic eye blinking, attentive posture.
     - **Speaking**: Mouth movement synchronized with speech audio (viseme tick loop) + glowing audio ring.
     - **Listening**: Inquisitive head tilt, responsive to candidate microphone volume.
     - **Thinking**: Neural particle halo rotation, contemplative gaze.
     - **Encouraging**: Warm smile, supportive nodding after good responses.
     - **Completed**: Congratulatory stance with celebratory particle confetti.
   - Persona switcher: **Elena Vance** (Tech Lead), **Priya Sharma** (HR & Campus Lead), and **Alex Rivera** (Systems Architect).

2. **Multilingual Voice Interaction (Indian Regional Languages)**:
   - Full support for:
     - **English** (`en-IN`)
     - **Telugu** (`te-IN` - తెలుగు)
     - **Hindi** (`hi-IN` - हिन्दी)
     - **Tamil** (`ta-IN` - தமிழ்)
     - **Kannada** (`kn-IN` - ಕನ್ನಡ)
     - **Malayalam** (`ml-IN` - മലയാളം)
   - Live Speech-to-Text (STT) transcription with inline editing before submission.
   - Natural speech synthesis (TTS) with audio repetition and speed adjustments (0.8x to 1.2x).
   - Dynamic language switching mid-session.
   - Seamless typing mode fallback if microphone is unavailable.

3. **Enterprise Interview Setup & Presets**:
   - Pre-configured company presets:
     - **HCL-Inspired Campus Trainee**: Graduate Engineer Trainee technical, aptitude, & HR mix.
     - **TCS Digital & Ninja**: Programming fundamentals, SQL, and quantitative aptitude.
     - **Infosys Specialist Engineer**: Data structures, algorithmic complexity, and live coding.
     - **General Enterprise Practice**: Standard multi-round technical and behavioral evaluation.
   - Configurable roles: Software Developer, Frontend, Backend, Full-Stack, Python, Java, AI/ML Engineer, Data Analyst, Graduate Engineer Trainee, or Custom Role.
   - Experience levels: Fresher, Internship, Entry Level, Experienced.
   - Resume parser: Paste resume text for automatic skill extraction and tailored questions.

4. **Interactive Coding Workspace**:
   - In-session code editor for coding interview questions.
   - Automated test case execution inspector (Input vs. Expected vs. Actual).
   - Copy code and reset starter code functionality.

5. **STAR-Method Behavioral Coaching**:
   - Built-in live coach tab for Situation, Task, Action, and Result framing.

6. **In-Depth Performance Scorecard & Analytics**:
   - Domain scoring (0-100): Technical Mastery, Communication, Problem Solving, Relevance, Confidence & Clarity.
   - Question-by-question breakdown with model reference answers, identified strengths, and improvement suggestions.
   - Actionable preparation roadmap and recommended learning topics.
   - Printable / Downloadable PDF scorecard.
   - Candidate Dashboard with performance trends, history, and quick-launch presets.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Three.js, Canvas Confetti.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (with PostgreSQL compatibility), Pydantic v2, Pytest.
- **Voice / Audio**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), Web Audio API (`AudioContext` & `AnalyserNode`).
- **AI Engine**: Google Gemini API integration with intelligent offline NLP question banks and scoring heuristics.

---

## 🚀 Quick Start Instructions (Windows)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Launch with One Click
In the project root folder (`C:\Users\kokki\.gemini\antigravity\scratch\ai-interview-bot`), double-click:
```bat
start.bat
```
or run in PowerShell:
```powershell
.\start.ps1
```
This automatically boots both the FastAPI backend on `http://localhost:8000` and the Vite frontend on `http://localhost:5173`.

---

### 2. Manual Start Instructions

#### Backend Setup:
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

#### Frontend Setup:
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Environment Variables & AI Configuration

The application is engineered to work **out-of-the-box in offline demo mode** with comprehensive multilingual question banks and heuristic evaluation rubrics if no API key is provided.

To enable live Google Gemini AI generation:
1. Create or edit `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   # Optional: PostgreSQL Database (defaults to SQLite if omitted)
   # DATABASE_URL=postgresql://user:password@localhost:5432/interview_bot
   ```
2. Restart the backend server.

---

## 🧪 Running Automated Tests

Run backend tests verifying health, multilingual interview creation, answer evaluation, and resume parsing:
```powershell
cd backend
python -m pytest tests/test_api.py -v
```

Test frontend build:
```powershell
cd frontend
npm run build
```

---

## 📁 Project Structure

```
ai-interview-bot/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py              # REST endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py              # App settings & language mappings
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── session.py             # SQLAlchemy engine & session factory
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── interview.py           # DB models (Interview, Question, Answer, Evaluation, Report)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── interview.py           # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_engine.py           # Gemini API + Offline AI engine
│   │   │   ├── question_bank.py       # Rich multilingual question bank
│   │   │   └── evaluation_service.py  # Scorecard aggregation
│   │   ├── __init__.py
│   │   └── main.py                    # FastAPI app initialization
│   ├── tests/
│   │   └── test_api.py                # Pytest test suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar/
│   │   │   │   ├── InterviewerAvatar.tsx  # Three.js 3D avatar with 6 states
│   │   │   │   └── VoiceWaveform.tsx      # Glowing audio visualizer
│   │   │   ├── Setup/
│   │   │   │   └── InterviewSetup.tsx     # Configuration & presets
│   │   │   ├── Interview/
│   │   │   │   ├── LiveInterviewRoom.tsx  # Video interview orchestrator
│   │   │   │   ├── QuestionCard.tsx       # Dynamic question & hints
│   │   │   │   ├── AnswerControls.tsx     # Mic toggle, waveform, inline edit
│   │   │   │   ├── CodingEditor.tsx       # Live code editor with test cases
│   │   │   │   └── SidePanel.tsx          # Progress, past QA, STAR coach
│   │   │   ├── Feedback/
│   │   │   │   └── ResultsReport.tsx      # Comprehensive scorecard & PDF
│   │   │   ├── Dashboard/
│   │   │   │   └── CandidateDashboard.tsx # History, stats, quick launch
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts    # STT & audio amplitude analyzer
│   │   │   └── useSpeechSynthesis.ts      # TTS & mouth sync viseme ticks
│   │   ├── pages/
│   │   │   └── LandingPage.tsx            # Hero page with features & 3D preview
│   │   ├── services/
│   │   │   └── api.ts                     # Fetch client to FastAPI backend
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                      # Tailwind v4 glassmorphism styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── start.bat                              # One-click Windows launcher
├── start.ps1                              # PowerShell launcher
└── README.md
```
