import React, { useState, useEffect, useRef } from 'react';

function HoldKeyChallenge({ challenge, onVerify }) {
  const [isHolding, setIsHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isHolding && !completed) {
        e.preventDefault();
        setIsHolding(true);
        setDuration(0);
        
        intervalRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 0.1;
            if (newDuration >= challenge.duration) {
              clearInterval(intervalRef.current);
              setCompleted(true);
              onVerify({ duration: newDuration });
              return newDuration;
            }
            return newDuration;
          });
        }, 100);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' && isHolding && !completed) {
        e.preventDefault();
        setIsHolding(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHolding, completed, challenge.duration, onVerify]);

  const progress = Math.min((duration / challenge.duration) * 100, 100);

  return (
    <div className="key-hold-container">
      <p style={{ marginBottom: '20px', fontSize: '16px' }}>
        Hold the <strong>SPACEBAR</strong> for {challenge.duration} seconds
      </p>
      
      <div className="key-hold-progress">
        <div
          className="key-hold-progress-bar"
          style={{ width: `${progress}%` }}
        >
          {completed ? 'Complete!' : `${duration.toFixed(1)}s / ${challenge.duration}s`}
        </div>
      </div>
      
      {completed && (
        <div className="message success">
          Commitment demonstrated successfully!
        </div>
      )}
    </div>
  );
}

export default HoldKeyChallenge;
