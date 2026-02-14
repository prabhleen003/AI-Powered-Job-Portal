# Job Portal with AI

A full-stack job portal built with React, Node.js/Express, MongoDB, and Socket.IO.

It supports:
- role-based access for job seekers and employers
- job posting and job search with filters
- application tracking
- real-time messaging
- AI features: resume analysis, cover letter generation, interview practice test
- anonymous interview experiences sharing

## Table of Contents

- [Project Overview](#project-overview)
- [Feature Set](#feature-set)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Data Models](#data-models)
- [File Upload Limits](#file-upload-limits)
- [Troubleshooting](#troubleshooting)
- [Known Notes](#known-notes)
- [Future Work and Collaboration](#future-work-and-collaboration)

## Project Overview

This repository contains two apps:
- `frontend`: React client (CRA)
- `backend`: Express API with MongoDB and Socket.IO

Default local URLs:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Backend socket server: `http://localhost:5000`

## Feature Set

### Job seekers
- register/login (email/password + Google OAuth)
- browse jobs with search and filters
- apply to jobs with cover letter + resume upload
- track applications
- chat with employers in real-time
- build profile (skills, education, experience, certifications)
- AI resume analysis
- AI cover letter generation (PDF download)
- AI interview practice and answer evaluation
- read/share interview experiences

### Employers
- register/login
- post jobs
- view own jobs and applicant counts
- review applicants
- update application status
- send messages to candidates

### AI capabilities (with fallback chain)
- Resume analysis: `Gemini -> Groq -> Template`
- Cover letter generation: `Groq -> Gemini -> Template`
- Practice test (questions + evaluation): `Groq -> Gemini -> Template`

If AI providers fail or keys are missing, template-based fallback still returns results.

## Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- Framer Motion
- React Hot Toast
- Socket.IO Client
- pdfmake (cover letter export)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Passport Google OAuth2
- Socket.IO
- Multer (file uploads)
- `@google/generative-ai`
- `groq-sdk`
- `pdfreader`

## Architecture

- Auth is JWT-based (token stored in `localStorage` by frontend and sent as Bearer token).
- API is mounted under `/api/*`.
- Socket.IO server runs on the same backend server.
- Uploaded files (profile avatar/resume and job application resume) are currently stored as base64 in MongoDB documents.

## Project Structure

```text
job-portal-full/
  backend/
    config/
    middleware/
    models/
    routes/
    utils/
    server.js
    package.json
  frontend/
    public/
    src/
      components/
      context/
      pages/
    package.json
  COMPLETE_SETUP.md
  API_KEY_SETUP.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Optional for AI features:
  - Gemini API key
  - Groq API key
- Optional for Google OAuth:
  - Google OAuth client ID/secret

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/job-portal
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=replace_with_a_long_random_secret
SESSION_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Variable notes
- `JWT_SECRET` and `SESSION_SECRET` are required for auth/session flows.
- `GEMINI_API_KEY` and `GROQ_API_KEY` are optional but recommended for best AI quality.
- `GOOGLE_*` variables are only required if using Google OAuth.

## Local Development Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Start backend:

```bash
cd ../backend
npm run dev
```

4. Start frontend in another terminal:

```bash
cd frontend
npm start
```

5. Open:
- `http://localhost:3000`

## Available Scripts

### Backend (`backend/package.json`)
- `npm run dev`: run with nodemon
- `npm start`: run with node

### Frontend (`frontend/package.json`)
- `npm start`: start CRA dev server
- `npm run build`: production build
- `npm test`: CRA test runner
- `npm run eject`: CRA eject

## API Reference

Base URL: `http://localhost:5000/api`

### Health
- `GET /api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/me` (auth)
- `POST /auth/logout` (auth)
- `PUT /auth/profile` (auth, multipart)
- `DELETE /auth/avatar` (auth)

### Jobs
- `GET /jobs`
- `GET /jobs/my-jobs` (auth, employer)
- `GET /jobs/:id`
- `POST /jobs` (auth, employer)
- `PUT /jobs/:id` (auth, employer owner)
- `DELETE /jobs/:id` (auth, employer owner)

### Applications
- `POST /applications` (auth, jobseeker, multipart)
- `GET /applications` (auth)
- `GET /applications/:id` (auth)
- `PUT /applications/:id` (auth, employer)
- `PUT /applications/:id/status` (auth, employer)
- `PUT /applications/:id/withdraw` (auth, jobseeker)

### Messages
- `GET /messages/users/search` (auth)
- `GET /messages/conversation/:userId` (auth)
- `GET /messages/conversations` (auth)
- `POST /messages` (auth)
- `GET /messages` (auth)
- `GET /messages/unread` (auth)
- `GET /messages/thread/:threadId` (auth)
- `PUT /messages/:id/read` (auth)
- `DELETE /messages/:id` (auth)

### Resume AI
- `POST /resume/analyze` (auth)
- `POST /resume/analyze-text` (auth)
- `POST /resume/analyze-pdf` (auth, multipart)

### Cover Letter AI
- `POST /cover-letter/generate` (auth, multipart)

### Practice Test AI
- `POST /practice-test/generate` (auth)
- `POST /practice-test/evaluate` (auth)

### Experiences
- `GET /experiences`
- `GET /experiences/stats`
- `POST /experiences` (auth)
- `PUT /experiences/:id/helpful` (auth)

## WebSocket Events

Server listens on backend host (`http://localhost:5000` by default).

Client emits:
- `user:join` with `userId`
- `message:send` with `{ senderId, receiverId, content }`
- `message:read` with `messageId`
- `user:typing` with `{ senderId, receiverId }`

Server emits:
- `user:online`
- `user:offline`
- `message:receive`
- `message:sent`
- `user:typing`
- `error`

## Data Models

### User
- auth: `name`, `email`, `password`, `googleId`, `role`
- profile: `avatar`, `phone`, `location`, `professionalSummary`
- job seeker data: `resumeFile`, `skills`, `education`, `experience`, `certifications`
- employer data: `company.*`

### Job
- `title`, `company`, `description`, `requirements`, `responsibilities`
- `employmentType`, `experienceLevel`, `location`, `salary`
- `skills`, `category`, `applicationDeadline`, `applicationFields`
- `status`, `applicationsCount`, `views`

### Application
- references: `job`, `applicant`, `employer`
- content: `coverLetter`, `resume`, `answers`
- workflow: `status`, `statusUpdates`, `appliedAt`

### Message
- `sender`, `receiver`, `subject`, `content`
- optional refs: `application`, `job`, `inReplyTo`
- thread/read tracking: `threadId`, `read`, `readAt`

### Experience
- `company`, `location`, `role`, `year`
- `applicationStatus`, `experienceText`, `interviewProcess`, `rating`, `tips`, `difficulty`
- engagement: `helpfulCount`, `helpfulBy`

## File Upload Limits

- Profile avatar/resume (`/auth/profile`): up to 10MB
- Job application resume (`/applications`): up to 10MB (`pdf/doc/docx`)
- Resume analyzer PDF (`/resume/analyze-pdf`): up to 5MB (PDF only)
- Cover letter generator resume (`/cover-letter/generate`): up to 5MB (PDF only)

## Troubleshooting

### MongoDB connection errors
- Verify `MONGO_URI`
- Ensure MongoDB is running or Atlas IP is allowed

### CORS/auth errors
- Confirm backend `CLIENT_URL` matches frontend origin
- Confirm frontend `REACT_APP_API_URL` points to backend `/api`

### Google OAuth issues
- Check `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Ensure callback URL exactly matches Google Console config

### AI issues
- Verify `GEMINI_API_KEY`/`GROQ_API_KEY`
- On quota/rate-limit responses, retry after delay
- For PDF parsing, use text-based PDFs (not image-only scans)

## Known Notes

- `frontend/src/pages/EditJob.js` exists, but route `/edit-job/:id` is not currently registered in `frontend/src/App.js`.
- Backend Google callback redirects to `/auth/success?token=...`; frontend route for `/auth/success` is not currently defined.
- Some UI status labels in `frontend/src/pages/Dashboard.js` use different names than backend application statuses.
- There are debug log `fetch(...)` calls to `http://127.0.0.1:7242/...` in a few files; they are wrapped with `.catch(() => {})` and fail silently if endpoint is unavailable.


## Future Work and Collaboration

Future directions for this project include:

- interview scheduling with Google Meet, where meeting invite links are generated and sent through Gmail using Nodemailer
- automatic acceptance-letter emails sent to selected candidates
- end-to-end email notification workflows for hiring updates

If you are interested in collaborating on these features, contributions and ideas are welcome.

---

For additional setup notes, see:
- `COMPLETE_SETUP.md`
- `API_KEY_SETUP.md`


