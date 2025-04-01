import React, { useState } from 'react';
import './MarkerForm.css';

function MarkerForm({ onSubmit, onCancel, coordinates }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'damage',
    description: '',
    status: 'needsHelp',
    images: []
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const MAX_IMAGES = 5;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to MAX_IMAGES total (existing + new)
      const totalImages = imagePreviews.length + selectedFiles.length;
      if (totalImages > MAX_IMAGES) {
        alert(`You can only upload up to ${MAX_IMAGES} images. Please select fewer images.`);
        return;
      }
      
      // Process each selected image
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Add this image to previews
          setImagePreviews(prev => [...prev, reader.result]);
          
          // Add to form data
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removeImage = (index) => {
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Remove from form data
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
          <label htmlFor="images">Upload Images (up to 5)</label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            onChange={handleImageChange}
            multiple
            disabled={imagePreviews.length >= MAX_IMAGES}
          />
          <p className="image-count">
            {imagePreviews.length} of {MAX_IMAGES} images selected
          </p>
          
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-container">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn" 
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
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