import React, { useState, useEffect, useRef } from 'react';

function HoldKeyChallenge({ challenge, onVerify }) {
  const [isHolding, setIsHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus the container to ensure key events are captured
    if (containerRef.current) {
      containerRef.current.focus();
    }

    const handleKeyDown = (e) => {
      // Check for spacebar (both 'Space' code and key === ' ')
      if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && !isHolding && !completed) {
        e.preventDefault();
        setIsHolding(true);
        setDuration(0);
        
        intervalRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 0.1;
            if (newDuration >= challenge.duration) {
              clearInterval(intervalRef.current);
              setCompleted(true);
              setIsHolding(false);
              onVerify({ duration: newDuration });
              return newDuration;
            }
            return newDuration;
          });
        }, 100);
      }
    };

    const handleKeyUp = (e) => {
      if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && isHolding && !completed) {
        e.preventDefault();
        setIsHolding(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // Use document instead of window for better event capture
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHolding, completed, challenge.duration, onVerify]);

  const progress = Math.min((duration / challenge.duration) * 100, 100);

  return (
    <div 
      ref={containerRef}
      className="key-hold-container"
      tabIndex={0}
      style={{ outline: 'none' }}
      onFocus={(e) => e.target.focus()}
    >
      <p style={{ marginBottom: '20px', fontSize: '16px' }}>
        Hold the <strong>SPACEBAR</strong> for {challenge.duration} seconds
      </p>
      <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        (Click here first to focus, then hold spacebar)
      </p>
      
      <div className="key-hold-progress" style={{ marginBottom: '20px' }}>
        <div
          className="key-hold-progress-bar"
          style={{ width: `${progress}%` }}
        >
          {completed ? 'Complete!' : `${duration.toFixed(1)}s / ${challenge.duration}s`}
        </div>
      </div>
      
      {isHolding && !completed && (
        <div style={{ textAlign: 'center', color: '#4CAF50', fontWeight: 'bold' }}>
          Holding spacebar...
        </div>
      )}
      
      {completed && (
        <div className="message success">
          Commitment demonstrated successfully!
        </div>
      )}
    </div>
  );
}

export default HoldKeyChallenge;
