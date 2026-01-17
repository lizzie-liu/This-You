import React, { useState, useEffect } from 'react';

function TypeSequenceChallenge({ challenge, onVerify }) {
  const [typed, setTyped] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const sequence = challenge.sequence.toLowerCase();
    if (typed.toLowerCase().replace(/\s/g, '') === sequence.replace(/\s/g, '')) {
      setIsComplete(true);
      setTimeout(() => {
        onVerify({ typed: typed.toLowerCase().replace(/\s/g, '') });
      }, 500);
    }
  }, [typed, challenge.sequence, onVerify]);

  return (
    <div className="typing-container">
      <input
        type="text"
        className="typing-input"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="Type the alphabet: a b c d e f..."
        autoFocus
      />
      <div className="typing-hint">
        Type: {challenge.sequence}
      </div>
      {isComplete && (
        <div className="message success">
          Sequence complete!
        </div>
      )}
    </div>
  );
}

export default TypeSequenceChallenge;
