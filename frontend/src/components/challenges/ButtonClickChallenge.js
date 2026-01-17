import React, { useState } from 'react';

function ButtonClickChallenge({ challenge, onVerify }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    onVerify({ clicked: true });
  };

  return (
    <div>
      <button className="button-primary" onClick={handleClick} disabled={clicked}>
        {clicked ? 'Identity Confirmed' : 'This is me'}
      </button>
    </div>
  );
}

export default ButtonClickChallenge;
