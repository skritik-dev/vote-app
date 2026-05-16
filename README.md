# SafePoll: Digital Voting System

SafePoll is a secure digital voting system built with a Next.js frontend and an Express/MongoDB backend. It supports user authentication, election management, candidate uploads, and vote tracking for administrators and voters.

## Features

- User registration and login with OAuth + JWT-based authentication
- Admin dashboard for creating and managing elections
- Voter dashboard for casting ballots and viewing results
- Candidate image uploads for election ballots
- REST API backend with Express and MongoDB
- Kubernetes manifests included for deployment

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JSON Web Tokens
- Deployment: Docker, Kubernetes

## Repository Structure

- `backend/` – Express API server
- `frontend/` – Next.js application
- `k8s/` – Kubernetes deployment and service manifests

## Local Setup

### Backend

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following values:
   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   PORT=5000
   JWT_SECRET=<your-jwt-secret>
   SECRET_KEY=<your-secret-key>
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend
1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following values:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the Next.js app:
   ```bash
   npm run dev
   `````

The frontend should be available at `http://localhost:3000` and the backend at `http://localhost:5000` by default.

## Deployment

### Docker

Build and run each service individually:

```bash
docker build -t safepoll-backend ./backend
docker build -t safepoll-frontend ./frontend

docker run -p 5000:5000 safepoll-backend
docker run -p 3000:3000 safepoll-frontend
```

### Kubernetes

Apply all manifests from the `k8s/` directory:

```bash
kubectl apply -k k8s/
```

---
*If something breaks, it's probably MongoDB. IT'S ALWAYS MONGODB!!.*
