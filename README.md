# Backend Design Exercise: Node.js & Express.js Application

## Overview

This project is a backend application built with Node.js and Express.js, designed to handle user registration, login, and profile management. It simulates a database using JSON files and incorporates middleware for authentication, rate limiting, and logging.

## Features

- **User Registration:** Create new user accounts with username, email, and password.
- **User Login:** Authenticate users and generate JWT tokens for secure access.
- **Profile Management:** Retrieve and manage user profile information.
- **Middleware:**
  - **Authentication:** Protect routes using JWT verification.
  - **Logging:** Log request details including method, route, and timestamp.
  - **Rate Limiting:** Control the number of requests per IP to prevent abuse.

## Project Structure

```
project/
├── app.js
├── controllers/
│   └── userController.js
├── data/
│   ├── test_users.json
│   └── users.json
├── middleware/
│   ├── authMiddleware.js
│   ├── loggerMiddleware.js
│   └── rateLimitMiddleware.js
├── models/
│   └── userModel.js
├── routes/
│   └── user.js
├── test/
│   ├── rateLimit.test.js
│   └── user.test.js
├── .env
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your configurations.

### Running the Application

Start the server with:

```bash
npm start
```

The server will run on the port specified in the `.env` file or default to `3000`.

### API Endpoints

- **POST /api/register**
  - Register a new user.
  - **Body:** `username`, `email`, `password`

- **POST /api/login**
  - Authenticate a user and receive a JWT token.
  - **Body:** `username`, `password`

- **GET /api/profile**
  - Retrieve the authenticated user's profile.
  - **Headers:** `Authorization: Bearer <token>`

- **PUT /api/change-password**
  - Change the authenticated user's password.
  - **Headers:** `Authorization: Bearer <token>`
  - **Body:** `oldPassword`, `newPassword`

### Running Tests

Execute the test suites using:

```bash
npm test
```

Tests cover user registration, login, profile access, password changes, and rate limiting.

## Technologies Used

- **Node.js & Express.js:** Server and routing.
- **JWT:** Authentication.
- **Joi:** Input validation.
- **bcrypt:** Password hashing.
- **express-rate-limit:** Rate limiting.
- **Mocha & Chai:** Testing frameworks.
