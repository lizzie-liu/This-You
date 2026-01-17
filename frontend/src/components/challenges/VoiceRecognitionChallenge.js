import React, { useState, useRef, useEffect } from 'react';

function VoiceRecognitionChallenge({ challenge, onVerify }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
        
        if (result.toLowerCase().includes(challenge.required_phrase.toLowerCase())) {
          setTimeout(() => {
            onVerify({ phrase: result });
          }, 500);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } else {
      alert('Speech recognition not supported. You can type your response instead.');
    }
  };

  const handleManualSubmit = () => {
    onVerify({ phrase: transcript || challenge.required_phrase });
  };

  return (
    <div className="voice-container">
      <button className="button-primary" onClick={startListening} disabled={isListening}>
        {isListening ? 'Listening...' : 'Start Recording'}
      </button>
      
      {transcript && (
        <div className="voice-status">
          Detected: "{transcript}"
        </div>
      )}
      
      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>Or type your response:</label>
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={`Say or type: "${challenge.required_phrase}"`}
        />
      </div>
      
      <button className="button-primary" onClick={handleManualSubmit}>
        Continue
      </button>
    </div>
  );
}

export default VoiceRecognitionChallenge;
