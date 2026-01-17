# This-You?

A light-hearted identity verification game that parodies serious authentication flows by replacing them with playful, absurd, and sometimes intentionally inconvenient challenges.

## Overview

This-You? is a humorous web-based game that satirizes modern identity verification systems. Players are asked to "verify" that they are themselves through a sequence of mini-challenges that range from semi-serious (parodying real systems) to completely absurd.

## Features

- **Multiple Challenge Types**: 
  - Semi-serious challenges (select images with vibes, click buttons, enter name)
  - Silly/absurd challenges (draw a perfect circle, match personality to toaster, choose funniest sound)
  - Physical/meta challenges (blink at camera, say "this is me", hold spacebar, type alphabet)

- **Progression System**: 
  - Confidence level tracking
  - Final verdicts: Verified, Probably You, Suspiciously You-Like, Absolutely Not You
  - Custom titles based on performance

- **2000s-Style UI**: 
  - Retro interface design
  - Official-looking bureaucratic aesthetic
  - Deadpan system messages

## Tech Stack

- **Frontend**: React.js
- **Backend**: Python/Django with Django REST Framework
- **Styling**: CSS with 2000s-inspired design

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run database migrations:
```bash
python manage.py migrate
```

5. Start the Django development server:
```bash
python manage.py runserver
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## How to Play

1. Fill out the initial information form (name is required, other fields are optional)
2. Click "Verify It's You" to start the verification process
3. Complete each challenge as it appears
4. Watch your confidence level change based on your performance
5. Receive your final verification verdict and title

## Challenge Types

### Semi-Serious Challenges
- **Select Images with Vibes**: Choose all images that contain "vibes"
- **Click "This is me" Button**: Simple button click verification
- **Enter Your Name**: Text input (succeeds on second attempt)
- **Security Question**: Answer a question you don't remember setting

### Silly/Absurd Challenges
- **Draw a Perfect Circle**: Draw a circle in 3 seconds (or use the premade circle)
- **Complete National Anthem**: Fill in the missing lyrics
- **Match Personality to Toaster**: Select the toaster that matches your personality
- **Choose Funniest Sound**: Pick the funniest sound effect
- **Moving Button**: Click a button that moves around

### Physical/Meta Challenges
- **Blink at Camera**: Blink exactly 7 times (or use manual button)
- **Say "This is me"**: Voice recognition or text input
- **Hold Spacebar**: Hold the spacebar for 3 seconds
- **Type the Alphabet**: Type A-Z in order

## API Endpoints

- `POST /api/session/start/` - Start a new verification session
- `GET /api/challenges/?session_id=<id>` - Get current challenge
- `POST /api/challenges/<id>/verify/` - Verify a challenge attempt
- `POST /api/session/<id>/complete/` - Complete session and get verdict

## Notes

- No real personal data is stored permanently
- Camera and microphone access are optional (manual alternatives provided)
- The game is designed to be humorous and should not be taken seriously
- All verification logic is intentionally lenient for comedic effect

## Future Ideas

- Daily verification mode
- Multiplayer "verify your friend" mode
- Custom challenge creator
- Localization with culturally specific jokes

## License

This project is created for UofT Hacks 2026.
