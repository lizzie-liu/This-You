import React, { useEffect } from 'react';

function ButtonClickChallenge({ challenge, onVerify }) {
  // Auto-verify immediately when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      onVerify({ clicked: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [onVerify]);

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Verifying your identity...</p>
      </div>
    </div>
  );
}

export default ButtonClickChallenge;
