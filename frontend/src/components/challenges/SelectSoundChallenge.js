import React, { useState } from 'react';

function SelectSoundChallenge({ challenge, onVerify }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (soundId) => {
    setSelected(soundId);
    onVerify({ sound_id: soundId });
  };

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
