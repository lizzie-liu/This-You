import React, { useState, useEffect } from 'react';

function UserInfoForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    personality: '',
    favoriteColor: '',
    nationality: '',
    favoriteFood: '',
    randomFact: '',
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your full legal name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Your age"
        />
      </div>

      <div className="form-group">
        <label htmlFor="personality">Personality Trait</label>
        <select
          id="personality"
          name="personality"
          value={formData.personality}
          onChange={handleChange}
        >
          <option value="">Select a personality trait</option>
          <option value="Traditional">Traditional</option>
          <option value="Modern">Modern</option>
          <option value="Bold">Bold</option>
          <option value="Tech-savvy">Tech-savvy</option>
          <option value="Quirky">Quirky</option>
          <option value="Mysterious">Mysterious</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="favoriteColor">Favorite Color</label>
        <input
          type="text"
          id="favoriteColor"
          name="favoriteColor"
          value={formData.favoriteColor}
          onChange={handleChange}
          placeholder="Your favorite color"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nationality">Nationality</label>
        <input
          type="text"
          id="nationality"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          placeholder="Your nationality"
        />
      </div>

      <div className="form-group">
        <label htmlFor="favoriteFood">Favorite Food</label>
        <input
          type="text"
          id="favoriteFood"
          name="favoriteFood"
          value={formData.favoriteFood}
          onChange={handleChange}
          placeholder="Your favorite food"
        />
      </div>

      <div className="form-group">
        <label htmlFor="randomFact">Random Fact About Yourself</label>
        <textarea
          id="randomFact"
          name="randomFact"
          value={formData.randomFact}
          onChange={handleChange}
          placeholder="Tell us something interesting about yourself..."
        />
      </div>

      <button type="submit" className="button-primary">
        Verify It's You
      </button>
    </form>
  );
}

export default UserInfoForm;
