import React, { useState, useRef, useEffect } from 'react';

function BlinkCameraChallenge({ challenge, onVerify }) {
  const [blinkCount, setBlinkCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. You can still proceed by clicking the button manually.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleBlink = () => {
    if (isComplete) return;
    
    const newCount = blinkCount + 1;
    setBlinkCount(newCount);
    
    if (newCount >= challenge.required_blinks) {
      setIsComplete(true);
      setTimeout(() => {
        stopCamera();
        onVerify({ blink_count: newCount });
      }, 500);
    }
  };

  const handleManualComplete = () => {
    if (isComplete) return;
    
    // Only allow completion if they've actually blinked
    if (blinkCount > 0) {
      setIsComplete(true);
      stopCamera();
      onVerify({ blink_count: blinkCount });
    } else {
      alert(`Please blink at least once before completing. Required: ${challenge.required_blinks} blinks.`);
    }
  };

  return (
    <div>
      {!isActive && !isComplete && (
        <button className="button-primary" onClick={startCamera}>
          Enable Camera
        </button>
      )}
      
      {isActive && !isComplete && (
        <>
          <div className="camera-container" style={{ marginBottom: '20px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                border: '2px solid #333',
                borderRadius: '4px',
                display: 'block',
                margin: '0 auto'
              }} 
            />
          </div>
          <div className="blink-counter" style={{ textAlign: 'center', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
            Blinks: {blinkCount} / {challenge.required_blinks}
          </div>
          <button className="button-primary" onClick={handleBlink} style={{ display: 'block', margin: '0 auto 10px' }}>
            I Just Blinked
          </button>
        </>
      )}
      
      {isActive && !isComplete && (
        <button
          className="button-primary"
          onClick={handleManualComplete}
          style={{ display: 'block', margin: '10px auto', background: '#2196F3' }}
        >
          Complete Verification ({blinkCount} blinks)
        </button>
      )}
      
      {isComplete && (
        <div className="message success" style={{ textAlign: 'center' }}>
          Verification complete! {blinkCount} blinks detected.
        </div>
      )}
    </div>
  );
}

export default BlinkCameraChallenge;
