import React, { useState } from 'react';

function TextInputChallenge({ challenge, userInfo, onVerify }) {
  const [text, setText] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    onVerify({
      text,
      attempts: newAttempts,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={challenge.field_name === 'name' ? 'Enter your name' : 'Enter text'}
          required
        />
      </div>
      <button type="submit" className="button-primary">
        Verify
      </button>
    </form>
  );
}

export default TextInputChallenge;
