# YouTube Visualization Project

This is a full-stack web application that visualizes YouTube channel data using React and Node.js.

## Project Structure

```
youtube_visualization-master/
├── client/             # React frontend
└── server/             # Node.js backend
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will open in your browser at http://localhost:3000

## API Endpoints

- `GET /api/channel-types`: Returns data about different YouTube channel types
- `GET /api/channel-stats`: Returns statistics about YouTube channels

## Technologies Used

- Frontend:
  - React
  - D3.js for visualizations
  - CSS for styling

- Backend:
  - Node.js
  - Express.js
  - CORS for cross-origin requests 