import React, { useState, useRef, useEffect } from 'react';

function DrawCircleChallenge({ challenge, onVerify }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [usedPremade, setUsedPremade] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && isDrawing) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isDrawing) {
      handleFinish();
    }
  }, [timeLeft, isDrawing]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleFinish = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    
    // Very simple circle detection (check if there's any drawing)
    const hasDrawing = imageData.data.some((pixel, index) => {
      return index % 4 === 3 && pixel > 0; // Check alpha channel
    });

    onVerify({
      circle_data: { is_circle: hasDrawing },
      used_premade: usedPremade,
    });
  };

  const usePremadeCircle = () => {
    setUsedPremade(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    setTimeout(() => {
      onVerify({
        circle_data: { is_circle: true },
        used_premade: true,
      });
    }, 500);
  };

  return (
    <div>
      {timeLeft > 0 && isDrawing && (
        <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', color: '#f44336' }}>
          Time: {timeLeft}s
        </div>
      )}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div className="canvas-controls">
        <button
          type="button"
          className="button-primary"
          onClick={handleFinish}
          style={{ width: 'auto', margin: 0 }}
        >
          Finish Drawing
        </button>
        <button
          type="button"
          onClick={usePremadeCircle}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Use Perfect Circle
        </button>
      </div>
    </div>
  );
}

export default DrawCircleChallenge;
