# TeachQuest - Exam Management System

TeachQuest is a comprehensive exam management system designed for educational institutions. It helps manage exam schedules, teacher allocations, and block assignments efficiently.

## Features

- **Teacher Management**
  - Add, edit, and manage teacher information
  - Track teacher allocations and assignments
  - Export teacher data to Excel

- **Exam Scheduling**
  - Create and manage exam schedules
  - Assign teachers to exam blocks
  - Track exam locations and timings

- **Block Management**
  - Manage exam blocks and their capacities
  - Track block assignments and locations
  - Monitor block utilization

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/NachiketPatil26/TeachQuest.git
cd TeachQuest
```

2. Install dependencies for all components:
```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Frontend (React + TypeScript)
- Backend (Node.js + Express)

## Configuration

1. Create a `.env` file in the server directory:
```bash
cd server
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:5173

# JWT Secret
# Change this to a strong, random string in production
JWT_SECRET=your_jwt_secret

```

(For Chatbot API key, contact the repo owner or moderators)

3. Create the first admin account:
```bash
cd server
npm run seed:admin
```
Admins can then add teachers from the dashboard.


## Running the Application

### Development Mode

To run both frontend and backend concurrently in development mode:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:5000

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Build and start the backend server:
```bash
cd server
npm run build
npm start
```

## Deployment

### Backend (Render)

The repo includes a `render.yaml`, so the backend can be deployed as a Blueprint on Render (or create a Web Service manually):

- **Root directory:** `server`
- **Build command:** `npm ci --include=dev && npm run build`
- **Start command:** `npm start`
- **Health check path:** `/api/health`
- **Environment variables:** `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL), `GROQ_API_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

If you use MongoDB Atlas, allow access from Render under Network Access.

### Frontend (Vercel)

- **Root directory:** `client/frontend`
- **Framework preset:** Vite
- **Environment variable:** `VITE_API_URL` = your Render backend URL (e.g. `https://teachquest-api.onrender.com`)

`vercel.json` takes care of routing so pages like `/admin/dashboard` work on refresh.

## Project Structure

```
teachquest/
├── client/
│   └── frontend/          # React frontend application
├── server/                # Node.js backend application
├── package.json          # Root package.json for managing both applications
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- React for the frontend framework
- Node.js and Express for the backend
- MongoDB for the database
- All contributors who have helped shape this project
