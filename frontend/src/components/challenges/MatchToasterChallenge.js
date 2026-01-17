import React, { useState } from 'react';

function MatchToasterChallenge({ challenge, onVerify }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (toasterId) => {
    setSelected(toasterId);
    onVerify({ toaster_id: toasterId });
  };

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
