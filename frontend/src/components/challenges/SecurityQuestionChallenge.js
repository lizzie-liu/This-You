import React, { useState } from 'react';

function SecurityQuestionChallenge({ challenge, onVerify }) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify({ answer });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>{challenge.question}</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          required
        />
      </div>
      <button type="submit" className="button-primary">
        Submit Answer
      </button>
    </form>
  );
}

export default SecurityQuestionChallenge;
