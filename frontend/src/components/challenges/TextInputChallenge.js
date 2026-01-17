import React, { useState } from 'react';

function TextInputChallenge({ challenge, userInfo, onVerify }) {
  const [text, setText] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [localMessage, setLocalMessage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isVerified) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Check if name matches (client-side check for immediate feedback)
    if (challenge.field_name === 'name' && userInfo && userInfo.name) {
      const enteredName = text.trim().toLowerCase();
      const correctName = userInfo.name.toLowerCase();
      const isCorrect = enteredName === correctName;
      
      if (isCorrect || newAttempts >= 2) {
        // Success - show message then verify
        setLocalMessage({ type: 'success', text: 'Name verified successfully!' });
        setIsVerified(true);
        setTimeout(() => {
          onVerify({
            text,
            attempts: newAttempts,
          });
          setLocalMessage(null);
        }, 1500);
      } else {
        // Wrong - show error but don't move on yet
        setLocalMessage({ type: 'error', text: 'Name does not match. Please try again.' });
        setText(''); // Clear the input for retry
        setTimeout(() => {
          setLocalMessage(null);
        }, 2000);
      }
    } else {
      // For other text inputs, verify immediately
      onVerify({
        text,
        attempts: newAttempts,
      });
    }
  };

  return (
    <div>
      {localMessage && (
        <div className={`message ${localMessage.type}`} style={{ marginBottom: '15px' }}>
          {localMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={challenge.field_name === 'name' ? 'Enter your name' : 'Enter text'}
            required
            disabled={isVerified}
          />
        </div>
        <button type="submit" className="button-primary" disabled={isVerified}>
          {isVerified ? 'Verified' : 'Verify'}
        </button>
      </form>
    </div>
  );
}

export default TextInputChallenge;
