import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

function BlinkCameraChallenge({ challenge, onVerify }) {
  const [blinkCount, setBlinkCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastBlinkTime = useRef(0);
  const eyesOpenRef = useRef(true);
  const blinkCooldownRef = useRef(0);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.warn('Could not load face-api models:', err);
        // Continue without automatic detection
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Set active first so video element is rendered
      setIsActive(true);
      
      // Wait a tiny bit for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        
        // Wait for video metadata and play
        const handleCanPlay = () => {
          if (video) {
            video.play()
              .then(() => {
                console.log('Video started playing');
                // Start detection if models are loaded
                if (modelsLoaded && !isDetecting) {
                  setTimeout(() => {
                    startBlinkDetection();
                  }, 1000);
                }
              })
              .catch(err => {
                console.error('Error playing video:', err);
                // Video might still work, don't show error
              });
          }
          if (video) {
            video.removeEventListener('canplay', handleCanPlay);
          }
        };
        
        // Check if already ready
        if (video.readyState >= 2) {
          handleCanPlay();
        } else {
          video.addEventListener('canplay', handleCanPlay);
        }
        
        // Also try on loadedmetadata
        video.onloadedmetadata = () => {
          if (video) {
            video.play().catch(err => console.error('Play error:', err));
          }
        };
      } else {
        console.warn('Video element not found after setting active');
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Camera access denied or unavailable. You can still proceed manually.');
      // Still allow them to proceed with manual button
      setIsActive(true);
    }
  };

  const startBlinkDetection = () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    setIsDetecting(true);

    const detectBlink = async () => {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || isComplete) {
        animationFrameRef.current = requestAnimationFrame(detectBlink);
        return;
      }

      try {
        // Detect face and landmarks
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections) {
          const landmarks = detections.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          // Calculate eye aspect ratio (EAR)
          const leftEAR = calculateEAR(leftEye);
          const rightEAR = calculateEAR(rightEye);
          const avgEAR = (leftEAR + rightEAR) / 2;

          // Threshold for blink detection (adjust as needed)
          const EAR_THRESHOLD = 0.25;
          const now = Date.now();

          // Detect blink (eyes closed)
          if (avgEAR < EAR_THRESHOLD && eyesOpenRef.current) {
            eyesOpenRef.current = false;
          }
          // Detect eyes opening (blink complete)
          else if (avgEAR >= EAR_THRESHOLD && !eyesOpenRef.current) {
            eyesOpenRef.current = true;
            
            // Cooldown to prevent multiple detections from one blink
            if (now - blinkCooldownRef.current > 500) {
              blinkCooldownRef.current = now;
              const newCount = blinkCount + 1;
              setBlinkCount(newCount);
              
              if (newCount >= challenge.required_blinks) {
                setIsComplete(true);
                setTimeout(() => {
                  stopCamera();
                  onVerify({ blink_count: newCount });
                }, 500);
              }
            }
          }

          // Draw face detection overlay (optional, for debugging)
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(detections.detection.box.x, detections.detection.box.y, 
                        detections.detection.box.width, detections.detection.box.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(detectBlink);
    };

    detectBlink();
  };

  // Calculate Eye Aspect Ratio (EAR) for blink detection
  const calculateEAR = (eye) => {
    // Vertical distances
    const vertical1 = Math.sqrt(
      Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2)
    );
    const vertical2 = Math.sqrt(
      Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2)
    );
    // Horizontal distance
    const horizontal = Math.sqrt(
      Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2)
    );
    // EAR formula
    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  const stopCamera = () => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start detection when models are loaded and camera is active
  useEffect(() => {
    if (isActive && modelsLoaded && !isDetecting && videoRef.current && videoRef.current.readyState >= 2) {
      setTimeout(() => startBlinkDetection(), 500);
    }
  }, [isActive, modelsLoaded]);

  const handleBlink = () => {
    if (isComplete) return;
    
    const now = Date.now();
    // Prevent spam clicking (at least 500ms between blinks)
    if (now - lastBlinkTime.current < 500) return;
    lastBlinkTime.current = now;
    
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
    
    // Allow completion with current blink count
    setIsComplete(true);
    stopCamera();
    onVerify({ blink_count: blinkCount || challenge.required_blinks });
  };

  return (
    <div>
      {error && (
        <div className="message error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {/* Always render video element (hidden when not active) so ref is available */}
      <div className="camera-container" style={{ 
        marginBottom: '20px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        borderRadius: '4px',
        overflow: 'hidden',
        minHeight: isActive ? '300px' : '0',
        height: isActive ? 'auto' : '0',
        opacity: isActive ? 1 : 0,
        visibility: isActive ? 'visible' : 'hidden'
      }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          style={{ 
            width: '100%', 
            maxWidth: '400px',
            height: 'auto',
            minHeight: isActive ? '300px' : '0',
            display: isActive ? 'block' : 'none',
            objectFit: 'cover',
            transform: 'scaleX(-1)' // Mirror the video for better UX
          }} 
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%) scaleX(-1)',
            maxWidth: '400px',
            width: '100%',
            height: 'auto',
            pointerEvents: 'none',
            opacity: modelsLoaded ? 0.7 : 0,
            display: isActive ? 'block' : 'none'
          }}
        />
      </div>

      {!isActive && !isComplete && (
        <div>
          <button className="button-primary" onClick={startCamera}>
            Enable Camera
          </button>
          {!modelsLoaded && (
            <div className="message info" style={{ marginTop: '10px', fontSize: '12px' }}>
              Loading face detection models... Automatic blink detection may not be available.
            </div>
          )}
        </div>
      )}
      
      {isActive && !isComplete && (
        <>
          <div className="blink-counter" style={{ 
            textAlign: 'center', 
            marginBottom: '15px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Blinks: {blinkCount} / {challenge.required_blinks}
            {modelsLoaded && isDetecting && (
              <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '5px' }}>
                Automatic detection active
              </div>
            )}
            {!modelsLoaded && isActive && (
              <div style={{ fontSize: '12px', color: '#FF9800', marginTop: '5px' }}>
                Using manual detection
              </div>
            )}
          </div>
          <button 
            className="button-primary" 
            onClick={handleBlink} 
            style={{ 
              display: 'block', 
              margin: '0 auto 10px',
              width: 'auto',
              minWidth: '200px'
            }}
          >
            I Just Blinked (Manual)
          </button>
        </>
      )}
      
      {isActive && !isComplete && (
        <button
          className="button-primary"
          onClick={handleManualComplete}
          style={{ 
            display: 'block', 
            margin: '10px auto', 
            background: '#2196F3',
            width: 'auto',
            minWidth: '200px'
          }}
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
