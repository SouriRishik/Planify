# Planify

Planify is a full-stack task and project management application built with React, TypeScript, Express, and SQLite. It provides user authentication, project organization, task tracking with priorities and statuses, and a dashboard overview.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [License](#license)

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- React Router v6
- Axios
- Vite

### Backend

- Node.js with Express
- TypeScript
- SQLite (better-sqlite3)
- JSON Web Tokens (jsonwebtoken)
- bcryptjs
- Nodemailer

---

## Prerequisites

Make sure the following are installed on your system before proceeding:

- Node.js (v18 or higher)
- npm (v9 or higher)

No external database setup is required. The application uses SQLite, which stores data in a local file created automatically on first run.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Planify
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the required environment variables (see [Environment Variables](#environment-variables)).

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

---

## Running the Application

### Start the Backend

From the `backend/` directory:

```bash
npm run dev
```

The API server will start on `http://localhost:5000` by default.

### Start the Frontend

From the `frontend/` directory:

```bash
npm run dev
```

The frontend development server will start on `http://localhost:3000`. It is configured to proxy all `/api` requests to the backend at `http://localhost:5000`.

### Build for Production

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

---

## API Endpoints

### Authentication

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | /api/auth/signup          | Register a new user      |
| POST   | /api/auth/login           | Log in an existing user  |
| POST   | /api/auth/forgot-password | Request password reset   |
| POST   | /api/auth/reset-password  | Reset password with OTP  |

### Projects

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| GET    | /api/projects     | Get all user projects    |
| GET    | /api/projects/:id | Get a single project     |
| POST   | /api/projects     | Create a new project     |
| PUT    | /api/projects/:id | Update a project         |
| DELETE | /api/projects/:id | Delete a project         |

### Tasks

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | /api/tasks                     | Get all user tasks              |
| GET    | /api/tasks/stats               | Get task statistics             |
| GET    | /api/projects/:id/tasks        | Get tasks for a specific project|
| POST   | /api/projects/:id/tasks        | Create a task in a project      |
| PUT    | /api/tasks/:id                 | Update a task                   |
| DELETE | /api/tasks/:id                 | Delete a task                   |

### Health Check

| Method | Endpoint    | Description         |
| ------ | ----------- | ------------------- |
| GET    | /api/health | API health status   |

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Required only if using the forgot-password feature
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

The frontend does not require a separate `.env` file. API requests are proxied to the backend through the Vite dev server configuration.

---

## Features

- User registration and login with JWT-based authentication
- Password reset via email OTP
- Create, update, and delete projects
- Create, update, and delete tasks within projects
- Task priority levels: low, medium, high
- Task statuses: todo, in progress, done
- Filter and sort tasks by priority, status, and date
- Dashboard with task statistics and progress overview
- Light and dark theme support
- Responsive layout with sidebar navigation

---

## License

This project is licensed under the terms specified in the [LICENCE](LICENCE) file.
