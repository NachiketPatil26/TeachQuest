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
cd teachquest
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
cp .env
```

2. Update the `.env` file with your configuration:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://nachiketpa26:3PDgmectZZP3U5Yg@cluster1.yrefb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1


# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:5173

# JWT Secret
# Change this to a strong, random string in production
JWT_SECRET=teachquest_secure_jwt_secret_key_2024

```

(For Chatbot API key, contact the repo owner or moderators)


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

2. Start the backend server:
```bash
npm start
```

## Project Structure

```
teachquest/
├── client/
│   └── frontend/          # React frontend application
├── server/                # Node.js backend application
├── package.json          # Root package.json for managing both applications
└── README.md            # This file
```

## API Documentation

The API documentation is available at `/api-docs` when running the server in development mode.

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
