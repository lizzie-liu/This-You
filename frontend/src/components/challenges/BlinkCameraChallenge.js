import React, { useState, useRef, useEffect } from 'react';

function BlinkCameraChallenge({ challenge, onVerify }) {
  const [blinkCount, setBlinkCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleBlink = () => {
    const newCount = blinkCount + 1;
    setBlinkCount(newCount);
    
    if (newCount >= challenge.required_blinks) {
      setTimeout(() => {
        onVerify({ blink_count: newCount });
      }, 500);
    }
  };

  const handleManualComplete = () => {
    onVerify({ blink_count: blinkCount || challenge.required_blinks });
  };

  return (
    <div>
      {!isActive && (
        <button className="button-primary" onClick={startCamera}>
          Enable Camera
        </button>
      )}
      
      {isActive && (
        <>
          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '400px' }} />
          </div>
          <div className="blink-counter">
            Blinks: {blinkCount} / {challenge.required_blinks}
          </div>
          <button className="button-primary" onClick={handleBlink}>
            I Just Blinked
          </button>
        </>
      )}
      
      <button
        className="button-primary"
        onClick={handleManualComplete}
        style={{ marginTop: '10px', background: '#2196F3' }}
      >
        Complete Verification
      </button>
    </div>
  );
}

export default BlinkCameraChallenge;
