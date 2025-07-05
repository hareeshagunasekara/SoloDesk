# SoloDesk - Simplified MERN Stack App

A simplified MERN (MongoDB, Express, React, Node.js) stack application with a single page.

## Features

- Simple Express API server
- React frontend with beautiful UI
- MongoDB database connection
- Single page application
- Custom color theme (#210B2C, #BC96E6, #FFD166)
- Whyte font family

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)

## Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```
   The server will run on http://localhost:5000

2. Start the client (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```
   The client will run on http://localhost:3000

## API Endpoints

- `GET /api/hello` - Returns a greeting message
- `GET /health` - Health check endpoint

## Project Structure

```
SoloDesk/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.jsx  # Main app component
│   │   └── styles/  # CSS files
│   └── package.json
├── server/          # Express backend
│   ├── app.js       # Express app setup
│   ├── server.js    # Server entry point
│   ├── config/      # Database configuration
│   └── package.json
└── README.md
```

## Technologies Used

- **Frontend**: React, Vite
- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose
- **Styling**: Custom CSS with Whyte font