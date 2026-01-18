import React, { useState, useEffect, useRef } from 'react';

function TypeSequenceChallenge({ challenge, onVerify }) {
  const [typed, setTyped] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const inputRef = useRef(null);

  // Delay interaction to prevent spacebar from previous challenge
  useEffect(() => {
    // Clear any existing value in the input immediately
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    const timer = setTimeout(() => {
      setCanInteract(true);
      if (inputRef.current) {
        // Clear again just before enabling
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    }, 600); // Increased delay to 600ms
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Reset state when challenge changes
    setTyped('');
    setIsComplete(false);
    setHasStartedTyping(false);
    setCanInteract(false); // Reset interaction state
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [challenge.id]);

  const handleChange = (e) => {
    if (!canInteract) {
      // Force clear the input if someone tries to type during delay
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }
    
    let value = e.target.value;
    
    // Filter out any leading spaces from spacebar carryover
    if (!hasStartedTyping) {
      value = value.trimStart();
      if (value.length === 0) {
        // Clear the input completely if only spaces
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }
    }
    
    if (!hasStartedTyping && value.length > 0) {
      setHasStartedTyping(true);
    }
    setTyped(value);
  };

  useEffect(() => {
    // Only check for completion if user has started typing
    if (!hasStartedTyping || isComplete) return;
    
    const sequence = challenge.sequence.toLowerCase();
    const typedClean = typed.toLowerCase().replace(/\s/g, '');
    const sequenceClean = sequence.replace(/\s/g, '');
    
    if (typedClean === sequenceClean && typedClean.length > 0 && typedClean.length === sequenceClean.length) {
      setIsComplete(true);
      setTimeout(() => {
        onVerify({ typed: typedClean });
      }, 500);
    }
  }, [typed, challenge.sequence, onVerify, hasStartedTyping, isComplete]);

  const handleKeyDown = (e) => {
    // Block all keyboard input during delay period
    if (!canInteract) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Block spacebar if user hasn't started typing yet (prevent carryover)
    if (!hasStartedTyping && (e.code === 'Space' || e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Allow spacebar in the input field - don't let other handlers interfere
    if (e.code === 'Space' || e.key === ' ') {
      e.stopPropagation();
    }
  };

  return (
    <div className="typing-container">
      {!canInteract && (
        <div style={{ textAlign: 'center', padding: '10px', color: '#666', marginBottom: '10px' }}>
          <p>Loading...</p>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="text"
        className="typing-input"
        value={typed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type the alphabet: a b c d e f..."
        disabled={!canInteract}
        style={{ 
          width: '100%', 
          padding: '10px', 
          fontSize: '16px',
          opacity: canInteract ? 1 : 0.5,
          cursor: canInteract ? 'text' : 'not-allowed'
        }}
      />
      <div className="typing-hint" style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Type: {challenge.sequence}
      </div>
      {isComplete && (
        <div className="message success" style={{ marginTop: '10px' }}>
          Sequence complete!
        </div>
      )}
    </div>
  );
}

export default TypeSequenceChallenge;