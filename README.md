# CodeForge

> Real-time collaborative coding workspace with live editing, project management, and authenticated full-stack delivery.

CodeForge is a full-stack MERN application for creating and editing coding projects in a browser-based workspace. It combines a React + Vite frontend, an Express + Socket.IO backend, MongoDB persistence, JWT-based authentication, and a Monaco-powered editor to deliver a responsive online coding environment with real-time sync, typing presence, and language switching.

## Demo

[![Live Frontend](https://img.shields.io/badge/Frontend-Live-111827?style=for-the-badge&logo=vercel)](https://codeforge-ayushxt25.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend-Live-0f172a?style=for-the-badge&logo=render)](https://codeforge-backend-59te.onrender.com/api/health)
[![License: ISC](https://img.shields.io/badge/License-ISC-2563eb?style=for-the-badge)](./LICENSE)

## Live Project

- [Open CodeForge](https://codeforge-ayushxt25.vercel.app)
- [Backend health check](https://codeforge-backend-59te.onrender.com/api/health)

The backend is hosted on Render, so the first request may take a few moments if the service has been idle.

## Features

- Secure user registration and login with JWT-based authentication
- Personal project dashboard with create, rename, delete, and open actions
- Monaco Editor-powered browser workspace for editing code in real time
- Socket.IO synchronization for shared code updates across connected clients
- Live user presence list inside the workspace sidebar
- Typing indicator for active collaborators in the same session
- Language switching for JavaScript, Python, Java, and C++
- Manual save action plus `Ctrl+S` / `Cmd+S` support
- MongoDB-backed persistence for users and projects
- Frontend/backend separation suitable for independent deployment

## Screenshots

### Login

![CodeForge login](docs/screenshots/login.png)

### Dashboard

![CodeForge dashboard](docs/screenshots/dashboard.png)

### Workspace

![CodeForge workspace](docs/screenshots/workspace.png)

## Architecture

```mermaid
flowchart LR
    User["Authenticated user"] --> Frontend["React + Vite client"]
    Frontend -->|"REST API"| Backend["Express backend"]
    Frontend -->|"WebSocket events"| Socket["Socket.IO server"]
    Backend --> Auth["JWT auth middleware"]
    Backend --> Mongo["MongoDB via Mongoose"]
    Socket --> Memory["In-memory room state"]
    Mongo --> Projects["Users and projects"]
```

## How It Works

1. A user signs up or logs in from the React frontend.
2. The frontend stores the JWT and uses it for authenticated project API requests.
3. The dashboard loads the user's projects from the Express API.
4. Opening a project loads its saved code and language from MongoDB.
5. The workspace connects to Socket.IO and joins a room keyed by the project ID.
6. Code edits, typing events, and language changes are broadcast to connected clients in the same room.
7. Project code and language can be persisted back to MongoDB through the REST API.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Monaco Editor, Socket.IO Client, Axios, React Router, Lucide React |
| Backend | Node.js, Express.js, Socket.IO |
| Database / Auth | MongoDB, Mongoose, JWT, bcrypt |
| Tooling / Deployment | npm, Nodemon, Vercel, Render |

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

## Quick Start

### Clone the repository

```powershell
git clone https://github.com/ayushxt25/CodeForge.git
cd CodeForge
```

### Install root dependencies

```powershell
npm install
```

### Backend setup

```powershell
cd backend
npm install
```

Create a `.env` file inside `backend/` using the variables documented below.

### Frontend setup

In a second terminal:

```powershell
cd frontend
npm install
```

Create a `.env` file inside `frontend/` if you want to point the app to a custom API or Socket.IO server.

### Run the backend

```powershell
cd backend
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### Run the frontend

In a second terminal:

```powershell
cd frontend
npm run dev
```

Open the Vite app at `http://localhost:5173`.

## Environment Variables

Only the variables referenced in the current codebase are documented below.

### Backend

```env
MONGO_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/codeforge
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `PORT` | No | Backend server port, defaults to `5000` |
| `NODE_ENV` | No | Enables production checks when set to `production` |
| `CORS_ORIGIN` | Recommended | Comma-separated allowed origins for browser requests |
| `FRONTEND_URL` | Optional | Fallback allowed origin used by the backend |

In production, the backend expects either `CORS_ORIGIN` or `FRONTEND_URL` to be set.

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_API_PROXY_TARGET=http://localhost:5000
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Optional | Base URL for Axios requests; defaults to `/api` |
| `VITE_SOCKET_URL` | Optional | Socket.IO server URL; falls back to the API host or current origin |
| `VITE_API_PROXY_TARGET` | Optional | Vite dev proxy target for `/api` requests |

## Usage Guide

1. Sign up for a new account or log in with an existing one.
2. Create a project from the dashboard.
3. Open the project workspace.
4. Copy the workspace ID from the sidebar if you want to reference the active session.
5. Choose a language from the workspace selector.
6. Start editing code and watch updates sync in real time across connected clients.
7. Use the presence list and typing indicator to track activity in the room.
8. Save your work with the save button or `Ctrl+S` / `Cmd+S`.

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/auth/me` | Return the authenticated user |
| `GET` | `/api/projects` | List the current user's projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Fetch one project |
| `PUT` | `/api/projects/:id` | Update project title, code, or language |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `GET` | `/api/health` | Service and database health check |

## Project Structure

```text
CodeForge/
|-- backend/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- index.js
|   `-- package.json
|-- docs/
|   `-- screenshots/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- LICENSE
|-- package.json
`-- README.md
```

## For Recruiters

CodeForge demonstrates:

- Full-stack MERN application design with separated frontend and backend concerns
- Real-time collaboration patterns using WebSocket-style communication with Socket.IO
- Stateful collaborative editor UX with presence, typing, and language controls
- Authentication and protected route handling with JWT and backend middleware
- MongoDB data modeling for users and project persistence
- Deployment-aware application structure with independently hosted frontend and backend services

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request with a clear summary

## License

This project is licensed under the ISC License. See [LICENSE](./LICENSE) for details.
