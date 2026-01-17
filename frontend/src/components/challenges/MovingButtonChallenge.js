import React, { useState, useEffect, useRef } from 'react';

function MovingButtonChallenge({ challenge, onVerify }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (clicked) return;

    const moveButton = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const maxX = container.offsetWidth - 200;
        const maxY = container.offsetHeight - 50;
        
        setPosition({
          x: Math.random() * maxX,
          y: Math.random() * maxY,
        });
      }
    };

    const interval = setInterval(moveButton, 500);
    return () => clearInterval(interval);
  }, [clicked]);

  const handleClick = () => {
    setClicked(true);
    onVerify({ clicked: true });
  };

  return (
    <div className="moving-button" ref={containerRef} style={{ minHeight: '200px', position: 'relative' }}>
      <button
        className="button-primary"
        onClick={handleClick}
        disabled={clicked}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '200px',
          transition: clicked ? 'none' : 'all 0.3s ease',
          zIndex: 10,
        }}
      >
        {clicked ? 'Identity Confirmed' : 'Click to Confirm'}
      </button>
    </div>
  );
}

export default MovingButtonChallenge;
