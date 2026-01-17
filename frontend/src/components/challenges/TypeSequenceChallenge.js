import React, { useState, useEffect, useRef } from 'react';

function TypeSequenceChallenge({ challenge, onVerify }) {
  const [typed, setTyped] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Reset state when challenge changes
    setTyped('');
    setIsComplete(false);
    setHasStartedTyping(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [challenge.id]);

  const handleChange = (e) => {
    const value = e.target.value;
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

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    // Allow spacebar in the input field - don't let other handlers interfere
    if (e.code === 'Space' || e.key === ' ') {
      e.stopPropagation();
    }
  };

  return (
    <div className="typing-container">
      <input
        ref={inputRef}
        type="text"
        className="typing-input"
        value={typed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type the alphabet: a b c d e f..."
        autoFocus
        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
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
