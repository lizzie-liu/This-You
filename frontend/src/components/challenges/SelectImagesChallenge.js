import React, { useState } from 'react';

function SelectImagesChallenge({ challenge, onVerify }) {
  const [selected, setSelected] = useState([]);

  const toggleSelection = (imageId) => {
    if (selected.includes(imageId)) {
      setSelected(selected.filter(id => id !== imageId));
    } else {
      setSelected([...selected, imageId]);
    }
  };

  const handleSubmit = () => {
    onVerify({ selected });
  };

  return (
    <div>
      <div className="image-grid">
        {challenge.images.map((image) => (
          <div
            key={image.id}
            className={`image-item ${selected.includes(image.id) ? 'selected' : ''}`}
            onClick={() => toggleSelection(image.id)}
          >
            <div className="image-placeholder">
              {image.has_vibes ? '✨' : '📷'}
            </div>
          </div>
        ))}
      </div>
      <button className="button-primary" onClick={handleSubmit}>
        Submit Selection
      </button>
    </div>
  );
}

export default SelectImagesChallenge;
