# 🎡 Fortuna Wheel

A **Wheel of Fortune** web application. Built with a **Vanilla JavaScript** frontend and a **Node.js/Express** backend to ensure secure, server-side random calculations.

## ✨ Features

- **Vanilla JS & Canvas:** Lightweight and performant wheel rendering without heavy UI frameworks.
- **Secure Randomness:** Winning logic and angles are calculated on the backend to prevent client-side manipulation.
- **Dockerized Architecture:** Separated frontend (Nginx) and backend (Node.js) containers for seamless deployment.

## 🛠 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5 Canvas, CSS3
- **Backend:** Node.js, Express
- **Build Tool:** Vite
- **Deployment:** Docker, Docker Compose, Nginx

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LUKON1/fortuna-wheel.git
   cd fortuna-wheel
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

### Running Locally

You'll need to run both the frontend Vite dev server and the backend Express server.

1. **Start the Backend:**
   ```bash
   cd server
   npm run dev
   ```
   *(Server runs on `localhost:3000`)*

2. **Start the Frontend:**
   In a new terminal window:
   ```bash
   npm run dev
   ```
   *(Vite runs on `localhost:5173` and proxies `/api` requests to the backend)*

## 🐳 Running with Docker

The application is fully containerized with a multi-stage Docker build.

1. Make sure you have Docker and Docker Compose installed.
2. Run the application:
   ```bash
   docker compose up -d --build
   ```

The application will be available at `http://localhost:80`. The backend is isolated in its own internal Docker network and is only accessible through the Nginx proxy.

## 📝 License

This project is licensed under the MIT License.
