# Tiny-Link (URL Shortener)

Lightweight URL shortener with a React + Vite frontend and an Express + PostgreSQL backend.

---

## Table of contents
- Overview
- Prerequisites
- Installation (Backend)
- Installation (Frontend)
- Running (Dev)
- Frontend usage
- Backend API endpoints
- Environment variables (examples)
- Notes

---

## Overview

This repository contains a full-stack URL shortener application:
- `backend/` — Express server providing authentication and URL management backed by PostgreSQL.
- `frontend/` — React app (Vite) providing UI for signup, login, creating short links, and viewing link details and stats.
- **Frontend Deployed Link:** https://tiny-linkly.vercel.app
-  **Backend Deployed Link:** https://tiny-link-backend-nu.vercel.app/
  > **Note:** You may need to wait a few seconds for the API to become responsive.  
> Render deploys endpoints on-demand, so they can take a short time to spin up.

## Prerequisites

- Node.js (v16+ recommended) and `npm` or `pnpm`/`yarn` installed.
- PostgreSQL database (or a hosted Postgres provider).

## Installation (Backend)

1. Open a terminal and go to the backend folder:

```powershell
cd .\backend
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in `backend/` (see Environment variables below for a template). Ensure the database URL and `JWT_SECRET` are set.

4. Start the backend in development mode (check `package.json` scripts):

```powershell
npm run dev
# or
npm start
```

The API listens on `PORT` (default `5000`).

## Installation (Frontend)

1. Open a second terminal and go to the frontend folder:

```powershell
cd .\frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in `frontend/` if you need to override the API base URL (example below). The app currently reads `VITE_BASE_URL`.

4. Start the frontend dev server:

```powershell
npm run dev
```

Open the UI in your browser (Vite will print the local URL, commonly `http://localhost:5173`).

## Running (Dev)

- Start the backend server (runs on `http://localhost:5000` by default).
- Start the frontend with Vite; the frontend will call backend endpoints using `VITE_BASE_URL`.

## Frontend Usage

The frontend includes these primary pages/components:

- `Sign Up` — create an account (name, email, password). Uses client-side validation (Zod) and calls `POST /api/auth/signup`.
- `Login` — sign in (email, password). Calls `POST /api/auth/login` and receives an httpOnly cookie for authentication.
- `Home` — main dashboard for creating short links and listing your existing links.
- `URL Shortener` — input a long URL to create a short link; on success, the shortened entry is shown in your list.
- `URL Details` — view link metadata and click statistics.

Notes:
- Authentication uses cookies (`token` cookie). Frontend requests include credentials and the backend CORS is configured to allow origins listed in `ALLOWED_ORIGINS`.
- The frontend expects the backend responses in JSON with a `success` boolean and `data` object where applicable.

## Backend API Endpoints

Base path: `/api`

Authentication:

- POST `/api/auth/signup`
  - Description: Register a new user.
  - Body (JSON):
    ```json
    { "name": "Your Name", "email": "you@example.com", "password": "P@ssw0rd!" }
    ```
  - Success: `201 Created` with `{ success: true, data: <user object without password> }`.

- POST `/api/auth/login`
  - Description: Login with email and password. Sets an httpOnly `token` cookie on success.
  - Body (JSON):
    ```json
    { "email": "you@example.com", "password": "P@ssw0rd!" }
    ```
  - Success: `200 OK` with `{ success: true, data: { user: { id, name, email } } }`.

- POST `/api/auth/logout`
  - Description: Clears the auth cookie and logs the user out.
  - Success: `200 OK` with `{ success: true, message: "Logged out successfully" }`.

- GET `/api/auth/user`
  - Description: Returns the currently authenticated user's details (requires cookie).
  - Success: `200 OK` with `{ success: true, data: { id, name, email } }`.

Links (protected; require authentication via cookie):

- POST `/api/links/`
  - Description: Create a new shortened URL for the authenticated user.
  - Body (JSON):
    ```json
    { "url": "https://example.com/some/long/path" }
    ```
  - Success: `201 Created` with `{ success: true, data: <url-object> }`. If the same URL already exists for the user, server returns `200` and existing record.

- GET `/api/links/`
  - Description: List URLs for the authenticated user. Supports pagination via query `?page=1&limit=10`.
  - Success: `200 OK` with `{ success: true, data: [ ...urls ] }`.

- GET `/api/links/:id`
  - Description: Get a single URL's metadata and its click records (paginated via `page`/`limit`). Only the owner can access.
  - Success: `200 OK` with `{ success: true, data: { url: <url>, clicks: [...], total: <number> } }`.

- GET `/api/links/:id/stats`
  - Description: Get aggregate statistics for a URL (owner only).
  - Success: `200 OK` with `{ success: true, data: <stats> }`.

- DELETE `/api/links/:id`
  - Description: Deactivate (inactivate) a URL. Owner-only operation.
  - Success: `200 OK` with `{ success: true, data: <deactivated-record> }`.

Redirect endpoint (public):

- GET `/:code`
  - Description: Public redirect endpoint. Visiting `http://<server>/<shortcode>` will redirect (HTTP 302) to the original long URL; the server logs click data asynchronously.

Error handling: The API uses structured errors; for client errors the status code will be set and the response will be processed by the frontend error handler.

## Environment Variables (examples)

Backend (`backend/.env`) — create this file and replace placeholder values:

```dotenv
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL (example format)
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=require"

# JWT secret used to sign auth cookie
JWT_SECRET="your_jwt_secret_here"

# Comma-separated list of allowed origins for CORS
ALLOWED_ORIGINS="http://localhost:5173"

# Optional: token for IP lookup / geo
IP_INFO_TOKEN="your_ipinfo_token"
```

Frontend (`frontend/.env`) — Vite environment variables must start with `VITE_`:

```dotenv
VITE_BASE_URL=http://localhost:5000
```

## Example curl requests

Sign up:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"P@ssw0rd1"}'
```

Create a short link (cookies required):

```bash
curl -X POST http://localhost:5000/api/links/ \
  -H "Content-Type: application/json" \
  --cookie "token=<your_token_cookie_here>" \
  -d '{"url":"https://example.com"}'
```

Visit a shortcode in the browser to redirect:

```
http://localhost:5000/<shortcode>
```
