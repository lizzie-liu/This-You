# Quick Setup Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 14+ and npm installed

## Step-by-Step Setup

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd This-You/backend
```

Create and activate a virtual environment:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run migrations:
```bash
python manage.py migrate
```

Start the Django server:
```bash
python manage.py runserver
```

The backend should now be running on `http://localhost:8000`

### 2. Frontend Setup

Open a **new terminal** and navigate to the frontend directory:

```bash
cd This-You/frontend
```

Install dependencies:
```bash
npm install
```

Start the React development server:
```bash
npm start
```

The frontend should now be running on `http://localhost:3000` and will automatically open in your browser.

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change the port with `python manage.py runserver 8001`
- **Module not found**: Make sure you activated the virtual environment and installed requirements
- **Database errors**: Run `python manage.py migrate` again

### Frontend Issues

- **Port 3000 already in use**: React will ask to use a different port, press Y
- **npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **CORS errors**: Make sure the backend is running on port 8000

### API Connection Issues

- Make sure both servers are running
- Check that the backend is accessible at `http://localhost:8000/api/`
- Verify CORS settings in `backend/thisyou/settings.py`

## Testing the Game

1. Fill out the user information form (name is required)
2. Click "Verify It's You"
3. Complete the verification challenges
4. Receive your final verdict!

## Development Notes

- The backend uses in-memory session storage (sessions are lost on server restart)
- No real data is persisted to a database
- Camera and microphone features require browser permissions
- All challenges have manual alternatives if browser features aren't available
