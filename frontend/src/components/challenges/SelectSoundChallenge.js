import React, { useState, useEffect } from 'react';

function SelectSoundChallenge({ challenge, onVerify }) {
  const [selected, setSelected] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!challenge.sounds) {
      console.warn('SelectSoundChallenge: Missing sounds data', challenge);
    }
  }, [challenge]);

  const handleSelect = (soundId) => {
    if (isVerifying) return; // Prevent double submissions
    
    setSelected(soundId);
    setIsVerifying(true);
    onVerify({ sound_id: soundId });
  };

  if (!challenge.sounds || !Array.isArray(challenge.sounds)) {
    return (
      <div>
        <p>Loading challenge...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sound-grid">
        {challenge.sounds.map((sound) => (
          <div
            key={sound.id}
            className={`sound-item ${selected === sound.id ? 'selected' : ''}`}
            onClick={() => handleSelect(sound.id)}
          >
            {sound.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectSoundChallenge;
