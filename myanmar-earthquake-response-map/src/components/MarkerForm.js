import React, { useState } from 'react';
import './MarkerForm.css';

function MarkerForm({ onSubmit, onCancel, coordinates }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'damage',
    description: '',
    status: 'needsHelp',
    imageUrl: ''
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      
      // Create an image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(selectedImage);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="marker-form">
      <h2>Add New Report</h2>
      <p className="coordinates-display">Location: {coordinates}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Name of area or specific issue"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="damage">Damage Report</option>
            <option value="shelter">Shelter Needed</option>
            <option value="medical">Medical Help</option>
            <option value="supplies">Supplies Needed</option>
            <option value="rescue">Rescue Needed</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Please provide details about the situation"
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="needsHelp">Needs Help</option>
            <option value="inProgress">Help In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Upload Image (optional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}

export default MarkerForm;