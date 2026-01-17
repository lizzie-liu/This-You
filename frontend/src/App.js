import React, { useState } from 'react';
import axios from 'axios';
import UserInfoForm from './components/UserInfoForm';
import ChallengeDisplay from './components/ChallengeDisplay';
import VerdictScreen from './components/VerdictScreen';
import Disclaimer from './components/Disclaimer';
import './index.css';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [gameState, setGameState] = useState('info'); // 'info', 'playing', 'verdict'
  const [sessionId, setSessionId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeNumber, setChallengeNumber] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [message, setMessage] = useState(null);

  const startSession = async (info) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/session/start/`, {
        user_info: info,
      });
      
      setSessionId(response.data.session_id);
      setUserInfo(info);
      setTotalChallenges(response.data.total_challenges);
      setCurrentChallenge(response.data.first_challenge);
      setChallengeNumber(1);
      setGameState('playing');
      setConfidenceLevel(0);
    } catch (error) {
      console.error('Error starting session:', error);
      setMessage({ type: 'error', text: 'Failed to start verification session. Please try again.' });
    }
  };

  const verifyChallenge = async (attemptData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/challenges/verify/`,
        {
          session_id: sessionId,
          attempt_data: attemptData,
        }
      );

      setMessage({
        type: response.data.success ? 'success' : 'error',
        text: response.data.message,
      });

      setConfidenceLevel(response.data.confidence_level);

      if (response.data.next_challenge) {
        setTimeout(() => {
          setCurrentChallenge(response.data.next_challenge);
          setChallengeNumber(response.data.challenge_number);
          setMessage(null);
        }, 2000);
      } else {
        // All challenges completed
        completeSession();
      }
    } catch (error) {
      console.error('Error verifying challenge:', error);
      setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
    }
  };

  const completeSession = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/session/${sessionId}/complete/`);
      setVerdict(response.data);
      setGameState('verdict');
    } catch (error) {
      console.error('Error completing session:', error);
      setMessage({ type: 'error', text: 'Failed to complete session.' });
    }
  };

  const restartGame = () => {
    setGameState('info');
    setSessionId(null);
    setUserInfo(null);
    setCurrentChallenge(null);
    setChallengeNumber(0);
    setTotalChallenges(0);
    setConfidenceLevel(0);
    setVerdict(null);
    setMessage(null);
  };

  return (
    <div className="verification-container">
      <div className="header">
        <h1>This-You?</h1>
        <div className="subtitle">Official Identity Verification System</div>
      </div>

      {gameState === 'info' && (
        <>
          <UserInfoForm onSubmit={startSession} />
          <Disclaimer />
        </>
      )}

      {gameState === 'playing' && (
        <>
          <div className="progress-bar-container">
            <div className="progress-label">Confidence Level: {confidenceLevel}%</div>
            <div
              className="progress-bar"
              style={{ width: `${confidenceLevel}%` }}
            >
              {confidenceLevel > 10 && `${confidenceLevel}%`}
            </div>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {currentChallenge && (
            <ChallengeDisplay
              challenge={currentChallenge}
              challengeNumber={challengeNumber}
              totalChallenges={totalChallenges}
              userInfo={userInfo}
              onVerify={verifyChallenge}
            />
          )}
        </>
      )}

      {gameState === 'verdict' && verdict && (
        <VerdictScreen verdict={verdict} onRestart={restartGame} />
      )}
    </div>
  );
}

export default App;
