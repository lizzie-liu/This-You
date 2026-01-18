import React, { useState, useRef, useEffect } from 'react';

function DrawCircleChallenge({ challenge, onVerify }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [usedPremade, setUsedPremade] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawing(false);
    setUsedPremade(false);
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
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
      <div className="canvas-container" style={{ display: 'inline-block', maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: 'auto',
            touchAction: 'none' 
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            startDrawing(mouseEvent);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            draw(mouseEvent);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
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
          style={{
            padding: '10px 20px',
            background: 'blue',
            color: 'white',
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={clearCanvas}
        >
          Restart
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
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '0';
          }}
        >
          Use Perfect Circle
        </button>
      </div>
    </div>
  );
}

export default DrawCircleChallenge;
