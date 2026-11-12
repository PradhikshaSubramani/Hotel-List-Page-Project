import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HotelForm = ({ initialData, onSubmit, isEdit = false }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    latitude: '',
    longitude: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
      });

      let existingImages = [];
      if (Array.isArray(initialData.images)) {
        existingImages = initialData.images;
      } else if (typeof initialData.images === 'string') {
        existingImages = initialData.images.replace(/[{}"']/g, '').split(',').filter(Boolean);
      } else if (initialData.image) {
        existingImages = [initialData.image];
      }

      setImagePreviews(
        existingImages.map((img) =>
          img.startsWith('http') ? img : `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`
        )
      );
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Hotel title is required.';
    if (!formData.description.trim()) errs.description = 'Hotel description is required.';

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      errs.price = 'Price must be a number greater than 0.';
    }

    const lat = parseFloat(formData.latitude);
    if (formData.latitude === '' || isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitude = 'Latitude must be between -90 and 90.';
    }

    const lng = parseFloat(formData.longitude);
    if (formData.longitude === '' || isNaN(lng) || lng < -180 || lng > 180) {
      errs.longitude = 'Longitude must be between -180 and 180.';
    }

    if (!isEdit && imageFiles.length === 0) {
      errs.images = 'At least one hotel image is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (files.length > 5) {
      setErrors((prev) => ({ ...prev, images: 'You can select up to 5 images only.' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const invalid = files.some((f) => !allowedTypes.includes(f.type));
    if (invalid) {
      setErrors((prev) => ({ ...prev, images: 'Only JPEG, JPG, PNG, or WebP images are permitted.' }));
      return;
    }

    imagePreviews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    setErrors((prev) => ({ ...prev, images: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('price', formData.price);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);

    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    onSubmit(data);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">{isEdit ? 'Edit Hotel Details' : 'Add New Hotel'}</h2>

      <div className="form-group">
        <label htmlFor="title">Hotel Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Grand Palace Bay Resort"
        />
        {errors.title && <span className="error-msg">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a comprehensive overview of amenities and suites..."
        />
        {errors.description && <span className="error-msg">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="price">Price (₹ per night) *</label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="e.g. 4500"
        />
        {errors.price && <span className="error-msg">{errors.price}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="latitude">Latitude (-90 to 90) *</label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="13.0827"
          />
          {errors.latitude && <span className="error-msg">{errors.latitude}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude (-180 to 180) *</label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="80.2707"
          />
          {errors.longitude && <span className="error-msg">{errors.longitude}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="images">
          Hotel Photos (Upload up to 5) {isEdit ? '(Leave empty to keep existing)' : '*'}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleImageChange}
        />
        {errors.images && <span className="error-msg">{errors.images}</span>}

        {imagePreviews.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {imagePreviews.map((src, index) => (
              <div
                key={index}
                style={{
                  width: '100px',
                  height: '75px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid #dee2e6',
                }}
              >
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/100x75/0056b3/ffffff?text=Image';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
          {isEdit ? 'Save Changes' : 'Create Hotel'}
        </button>
        <button
          type="button"
          className="btn"
          style={{ background: '#e2e6ea', color: '#333' }}
          onClick={() => navigate('/')}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default HotelForm;