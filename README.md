# 🚀 Shift Manager Backend API

This is the backend system for the **Shift Manager** application, built with **Node.js**, **Express**, and **MongoDB**. It supports:

- ✅ User registration and login with JWT authentication
- 🔐 Protected routes for shift management
- 🔁 Password reset via email with secure token flow
- 📄 Auto-generated API docs using Swagger (OpenAPI 3.0)

---

## 📂 Folder Structure

```
AI-test-backend/
├── controllers/           # Route handlers (User, Shift, Forgot Password)
├── middleware/            # JWT authentication middleware
├── models/                # Mongoose schemas (User, Shift)
├── routes/                # API route definitions
├── scheduler/             # Optional job scheduler logic
├── swagger/               # Swagger config for auto docs
├── .env                   # Environment variables (not committed)
├── .gitignore
├── package.json
├── server.js              # Entry point
```

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Wahhab1801/ai-test-be.git
cd ai-test-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Create a `.env` file in the root with the following variables:

```env
MONGO_URI=<your-mongodb-connection-uri>
PORT=8000
JWT_SECRET=secret1234
NODE_ENV=development
```

---

### 4. Run the server

```bash
npm run dev
```

> Server will run locally on: [http://localhost:8000](http://localhost:8000)

---

## 📁 API Documentation

Swagger UI is available at:

👉 **[https://ai-test-be.onrender.com/api/docs](https://ai-test-be.onrender.com/api/docs)**

---

## 🔐 Authenticated Endpoints

Use the `/user/login` route to get a JWT. Then include it in your requests:

```
Authorization: Bearer <token>
```

---

## 📄 License

MIT

## Cypress Frontend Tests

## Prerequisites

- Backend server running locally (on localhost:8000)

## Installation

```bash
npm install cypress --save-dev
```

## Running tests

API Tests with Newman

- This project includes Postman-based end-to-end API tests using Newman.

Prerequisites

- Ensure the backend server is running locally on http://localhost:8000.

Run Tests

```bash
npm test
```

This will:

- Run the happy-path.postman_collection.json
- Use the postman_environment.json
- Output results to the terminal (CLI)
