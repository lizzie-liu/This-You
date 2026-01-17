import React, { useState, useEffect } from 'react';

function MatchToasterChallenge({ challenge, onVerify }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!challenge.toasters) {
      console.warn('MatchToasterChallenge: Missing toasters data', challenge);
    }
  }, [challenge]);

  const handleSelect = (toasterId) => {
    setSelected(toasterId);
    onVerify({ toaster_id: toasterId });
  };

  if (!challenge.toasters || !Array.isArray(challenge.toasters)) {
    return (
      <div>
        <p>Loading challenge...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="toaster-grid">
        {challenge.toasters.map((toaster) => (
          <div
            key={toaster.id}
            className={`toaster-item ${selected === toaster.id ? 'selected' : ''}`}
            onClick={() => handleSelect(toaster.id)}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🍞</div>
            <div style={{ fontWeight: 'bold' }}>{toaster.name}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {toaster.personality}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchToasterChallenge;
