import React, { useState, useEffect, useRef } from 'react';

function HoldKeyChallenge({ challenge, onVerify }) {
  const [isHolding, setIsHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const isHoldingRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    isHoldingRef.current = isHolding;
    completedRef.current = completed;
  }, [isHolding, completed]);

  useEffect(() => {
    // Focus the container to ensure key events are captured
    if (containerRef.current) {
      containerRef.current.focus();
    }

    const handleKeyDown = (e) => {
      // Only handle spacebar if we're in this challenge's container or not in an input
      const isInInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      const isInThisContainer = containerRef.current && containerRef.current.contains(e.target);
      
      // Check for spacebar and prevent default scrolling
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        // Only prevent default and handle if we're in this container or not in an input
        if (isInThisContainer || (!isInInput && !isInThisContainer)) {
          // Prevent page scroll only if not in an input field
          if (!isInInput) {
            e.preventDefault();
          }
          
          // Start holding if not already holding and not completed, and we're in this container
          if (isInThisContainer && !isHoldingRef.current && !completedRef.current) {
            setIsHolding(true);
            setDuration(0);
            
            intervalRef.current = setInterval(() => {
              setDuration(prev => {
                const newDuration = prev + 0.1;
                if (newDuration >= challenge.duration) {
                  clearInterval(intervalRef.current);
                  setCompleted(true);
                  setIsHolding(false);
                  completedRef.current = true;
                  isHoldingRef.current = false;
                  onVerify({ duration: newDuration });
                  return newDuration;
                }
                return newDuration;
              });
            }, 100);
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      const isInInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      const isInThisContainer = containerRef.current && containerRef.current.contains(e.target);
      
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        if (isInThisContainer || (!isInInput && !isInThisContainer)) {
          if (!isInInput) {
            e.preventDefault();
          }
          
          if (isInThisContainer && isHoldingRef.current && !completedRef.current) {
            setIsHolding(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }
      }
    };

    // Use document with capture phase for better event capture
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [challenge.duration, onVerify]);

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
