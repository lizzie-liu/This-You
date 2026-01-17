import React from 'react';

function VerdictScreen({ verdict, onRestart }) {
  const getVerdictClass = () => {
    switch (verdict.verdict) {
      case 'Verified':
        return 'verified';
      case 'Probably You':
        return 'probably';
      case 'Suspiciously You-Like':
        return 'suspicious';
      case 'Absolutely Not You':
        return 'not-you';
      default:
        return '';
    }
  };

  return (
    <div className="verdict-container">
      <div className={`verdict-title ${getVerdictClass()}`}>
        {verdict.verdict}
      </div>
      <div className="verdict-subtitle">{verdict.title}</div>
      
      <div className="verdict-stats">
        <p><strong>Confidence Level:</strong> {verdict.confidence_level}%</p>
        <p><strong>Challenges Passed:</strong> {verdict.successes} / {verdict.total}</p>
        <p><strong>Verification Status:</strong> {verdict.verdict}</p>
      </div>

      {verdict.verdict === 'Verified' && (
        <div className="message success">
          Congratulations! Your identity has been verified with the highest level of certainty. 
          You are officially confirmed to be yourself. Please proceed with your day.
        </div>
      )}

      {verdict.verdict === 'Probably You' && (
        <div className="message info">
          Based on our analysis, you are probably who you claim to be. 
          The system has determined with moderate certainty that you are yourself.
        </div>
      )}

      {verdict.verdict === 'Suspiciously You-Like' && (
        <div className="message info">
          The verification process has yielded ambiguous results. 
          You appear to be you-like, but the system cannot confirm with certainty.
        </div>
      )}

      {verdict.verdict === 'Absolutely Not You' && (
        <div className="message error">
          Verification failed successfully. The system has determined that you are 
          absolutely not yourself. Please try again or contact support if you believe 
          this is an error.
        </div>
      )}

      <button className="button-primary" onClick={onRestart} style={{ marginTop: '30px' }}>
        Verify Again
      </button>
    </div>
  );
}

export default VerdictScreen;
