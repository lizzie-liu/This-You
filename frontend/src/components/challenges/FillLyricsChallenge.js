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
          Complete the lyric: <strong>"{challenge.lyric}"</strong>
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the next line..."
          required
        />
      </div>
      <button type="submit" className="button-primary">
        Submit
      </button>
    </form>
  );
}

export default FillLyricsChallenge;
