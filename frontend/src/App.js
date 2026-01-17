import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserInfoForm from './components/UserInfoForm';
import ChallengeDisplay from './components/ChallengeDisplay';
import VerdictScreen from './components/VerdictScreen';
import './index.css';

const API_BASE_URL = 'http://localhost:8000/api';
const USER_INFO_STORAGE_KEY = 'thisyou_user_info';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved user info on mount
  useEffect(() => {
    const savedInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setUserInfo(parsed);
      } catch (e) {
        console.error('Error loading saved user info:', e);
      }
    }
  }, []);

  const startSession = async (info) => {
    try {
      // Save user info to localStorage
      localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(info));
      
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
      setMessage(null);
    } catch (error) {
      console.error('Error starting session:', error);
      setMessage({ type: 'error', text: 'Failed to start verification session. Please try again.' });
    }
  };

  const verifyChallenge = async (attemptData) => {
    // Prevent multiple simultaneous submissions
    if (isVerifying || isTransitioning) {
      return;
    }

    setIsVerifying(true);
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
      setIsVerifying(false);

      if (response.data.next_challenge) {
        setIsTransitioning(true);
        // Clear current challenge first to prevent overlap
        setCurrentChallenge(null);
        setTimeout(() => {
          setCurrentChallenge(response.data.next_challenge);
          setChallengeNumber(response.data.challenge_number);
          setMessage(null);
          setIsTransitioning(false);
        }, 2000);
      } else {
        // All challenges completed
        setIsTransitioning(true);
        setCurrentChallenge(null);
        setTimeout(() => {
          completeSession();
        }, 2000);
      }
    } catch (error) {
      console.error('Error verifying challenge:', error);
      setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
      setIsVerifying(false);
      setIsTransitioning(false);
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
    // Keep userInfo - it's already saved in localStorage and will be loaded
    setCurrentChallenge(null);
    setChallengeNumber(0);
    setTotalChallenges(0);
    setConfidenceLevel(0);
    setVerdict(null);
    setMessage(null);
    setIsVerifying(false);
    setIsTransitioning(false);
  };

  return (
    <div className="verification-container">
      <div className="header">
        <h1>This-You?</h1>
        <div className="subtitle">Official Identity Verification System</div>
      </div>

      {gameState === 'info' && (
        <UserInfoForm onSubmit={startSession} initialData={userInfo} />
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
