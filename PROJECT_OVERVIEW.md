# SHU ORIC AI – Simple Project Overview & Architecture Guide

### What Are We Actually Building? (In Plain English)

Right now, Salim Habib University (SHU) has university research and student final-year projects sitting in folders or on a basic website where nobody sees them. Meanwhile, factories and companies in Karachi (Korangi, SITE, Landhi) have real problems and need tech solutions.

**SHU ORIC AI** is a smart platform that does three things:
1. **Stores and understands all SHU research** (Pharma, Engineering, Computer Science, Business).
2. **Scans Karachi industries and real companies** to see what problems they need solved.
3. **Connects the two**: An AI chatbot and automated tools match a university project to a real company, assess if the project can become a real product or startup, and generates the reports and pitch decks.

---

### Why Are We Building From Scratch?

The old prototype tried to scrape an existing website (`oric-shu.vercel.app`) and used fake, hardcoded lists of projects and companies. 

**Why that failed:**
- Scrapers break every time a web page changes.
- Projects were hardcoded into flat JSON files—you couldn't upload a new PDF or edit anything.
- The chatbot prompts were hardcoded in code instead of being editable by teachers.

**The greenfield fix:** We wipe all of that out. We build a clean database, a simple file upload system (drop a PDF/Word doc and the system reads it), and a real, editable system.

---

### The 4 Things We Are Changing (Static ➔ Dynamic)

| What Was Fake / Hardcoded | How We Build It For Real |
| :--- | :--- |
| **Fixed Project Lists** (hardcoded JSON files) | **Real Database + File Upload**: Admins and teachers drop in a PDF or Word document. The system reads it, extracts the details, and saves it to the database automatically. |
| **Fake List of Companies** (hardcoded text) | **Live Search**: When you ask for pharmaceutical or textile companies in Korangi or SITE, the AI searches the web in real time and pulls real, active companies. |
| **Fixed Bot Prompts** (hardcoded in Python code) | **Admin Dashboard for Teachers**: University admins can create new "Virtual Teachers" (e.g. Pharmacy Mentor, AI Mentor) and change their prompts directly from the screen without touching code. |
| **Rigid Readiness Scores** (hardcoded formulas) | **Editable Scoring Rubric**: The university can change scoring questions, weightings, and milestones anytime from settings. |

---

### The Core Modules You Need to Build

1. **The Chatbot & Virtual Teachers**:
   - Talk to it via text or voice (mic button).
   - Supports English and Urdu.
   - Switch between different teacher personas (e.g., Pharmacy Teacher, Business Advisor).
2. **Project Database**:
   - Upload research papers (PDF/Word). The system reads them and remembers them.
3. **11 AI Agents (Specialized helpers)**:
   - Instead of one prompt trying to do everything, you have focused prompts: one checks the science, one searches the web, one checks company matches, one checks finances, one writes reports, etc.
4. **Knowledge Graph**:
   - A visual network map showing how projects connect. (e.g., "This Pharmacy drug formulation connects to this Computer Science image-recognition algorithm").
5. **Karachi Industry Radar**:
   - Finds matching companies in Korangi, Landhi, SITE, Port Qasim, and beyond.
6. **ERL (Readiness) Scorer**:
   - Grades a project from 1 to 9 on whether it’s just a lab idea or ready to be sold to an investor.
7. **Discussion Recorder**:
   - Hit "Record" during a research meeting. It types out what everyone said, writes a summary, and lists out action items.
8. **Executive Dashboard**:
   - A simple dashboard for the Vice Chancellor and Deans showing total projects, patents, and top commercial ideas.

---

### The Tech Stack (Simple & Clean)

- **Frontend**: **Next.js + Tailwind CSS** (clean, modern web app with chat, graphs, and audio buttons).
- **Backend**: **FastAPI (Python 3.12)** (fast, clean, handles the AI logic and WebSockets for live chat).
- **Database**: **PostgreSQL with pgvector** (one database handles everything: user logins, project info, and AI memory search).
- **AI Brains**: A simple gateway that talks to **Google Gemini** (for reading large papers fast) and **OpenAI / Claude** (for structured data and formal reports).

---

### The Simple 6-Step Roadmap

```
Step 1: Set up the Database & Logins (PostgreSQL, Users, Roles, Project tables)
   ↓
Step 2: Build File Upload & Reading (Drop a PDF/Word doc → AI extracts & saves project)
   ↓
Step 3: Build the Chatbot & Virtual Teachers (WebSocket chat, voice mic, dynamic teacher profiles)
   ↓
Step 4: Build the Company Radar & Scoring (Live search for Karachi companies + ERL readiness score)
   ↓
Step 5: Add Meeting Recorder & PDF Reports (Audio recording + one-click export to Word/PDF)
   ↓
Step 6: Polish, Test & Deploy
```

---

### The Only 6 Tables You Need in the Database

1. **`users`**: Email, password, role (`admin`, `faculty`, `student`).
2. **`faculties` & `departments`**: Pharmacy, CS, Engineering, Management Sciences.
3. **`projects`**: Title, abstract, problem solved, stage, readiness score, lead professor.
4. **`document_chunks`**: The text and AI memory vectors from uploaded PDFs so the chatbot can search them.
5. **`ai_personas`**: The Virtual Teachers (name, persona prompt, avatar, department).
6. **`discussions`**: Meeting recordings, transcripts, and action items.

---

### What We Should Do Right Now (Sprint 0)

To start building today, here are the first 3 practical tasks:

1. **Docker Setup**: Fire up a `docker-compose.yml` with PostgreSQL (with pgvector) and Redis.
2. **Backend Skeleton**: Set up the basic FastAPI app with user logins and database tables.
3. **Frontend Shell**: Create the Next.js app with the sidebar (Chat, Projects, Industry Radar, Dashboard).

