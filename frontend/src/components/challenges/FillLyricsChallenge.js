import React, { useState } from 'react';

function FillLyricsChallenge({ challenge, onVerify }) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify({ answer });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          {challenge.song && (
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              Song: <strong>{challenge.song}</strong>
            </div>
          )}
          Fill in the missing word(s): <strong>"{challenge.lyric}"</strong>
        </label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the missing word(s)..."
          required
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
      </div>
      <button type="submit" className="button-primary">
        Submit
      </button>
    </form>
  );
}

export default FillLyricsChallenge;
