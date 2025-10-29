import React, { useState, useRef } from 'react';
import SuccessModal from '../../components/SuccessModal';

const ReportItemPage = ({ addItem, showPage }) => {
const [reportType, setReportType] = useState('lost'); // 'lost' or 'found'
const [formData, setFormData] = useState({
title: '',
category: '',
location: '',
date: '',
description: '',
image: null,
contact: ''
});
const [imagePreviewUrl, setImagePreviewUrl] = useState('');
const successModalRef = useRef(null);

const handleChange = (e) => {
const { id, value } = e.target;
setFormData(prev => ({ ...prev, [id]: value }));
};

const handleImageChange = (e) => {
const file = e.target.files[0];
setFormData(prev => ({ ...prev, image: file }));
if (file) {
const reader = new FileReader();
reader.onloadend = () => {
setImagePreviewUrl(reader.result);
};
reader.readAsDataURL(file);
} else {
setImagePreviewUrl('');
}
};

const handleSubmit = async (e) => {
e.preventDefault();

const newItem = {
  title: formData.title,
  description: formData.description,
  category: formData.category,
  location: formData.location,
  contact: formData.contact,
  imageUrl: imagePreviewUrl || "" // ✅ Added this line safely
};

if (reportType === "lost") {
  newItem.dateLost = formData.date;
} else {
  newItem.dateFound = formData.date;
}

try {
  const endpoint =
    reportType === "lost"
      ? "http://localhost:5000/api/lost-items"
      : "http://localhost:5000/api/found-items";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newItem),
  });

  if (!response.ok) {
    throw new Error("Failed to submit item");
  }

  const data = await response.json();
  addItem(data);

  if (successModalRef.current) {
    const modal = new window.bootstrap.Modal(successModalRef.current);
    modal.show();
  }

  setFormData({
    title: '',
    category: '',
    location: '',
    date: '',
    description: '',
    image: null,
    contact: ''
  });
  setImagePreviewUrl('');

} catch (err) {
  console.error("Error submitting item:", err);
  alert("Something went wrong while submitting the item!");
}


};

return ( <div id="report-page" className="page"> <div className="row justify-content-center"> <div className="col-lg-7"> <div className="page-title"> <h2>Report Item</h2> </div>

      <div className="form-section">
        <div className="mb-3 text-center">
          <div className="btn-group btn-group-lg w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn btn-outline-primary py-3 ${reportType === 'lost' ? 'active' : ''}`}
              onClick={() => setReportType('lost')}
            >
              <i className="fas fa-exclamation-circle me-2"></i>I Lost Something
            </button>
            <button
              type="button"
              className={`btn btn-outline-success py-3 ${reportType === 'found' ? 'active' : ''}`}
              onClick={() => setReportType('found')}
            >
              <i className="fas fa-lightbulb me-2"></i>I Found Something
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Item Title</label>
            <input type="text" className="form-control" id="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <select className="form-select" id="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books & Notes</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="keys">Keys</option>
              <option value="id">ID Cards</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">{reportType === 'lost' ? 'Lost Location' : 'Found Location'}</label>
            <input type="text" className="form-control" id="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">{reportType === 'lost' ? 'Lost Date & Time' : 'Found Date & Time'}</label>
            <input type="datetime-local" className="form-control" id="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" id="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Upload Image (optional)</label>
            <input className="form-control" type="file" id="image" accept="image/*" onChange={handleImageChange} />
            {imagePreviewUrl && (
              <div className="mt-2" id="image-preview">
                <img src={imagePreviewUrl} className="img-thumbnail" style={{ maxHeight: '200px' }} alt="Preview" />
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="contact" className="form-label">Your Contact Information</label>
            <input type="text" className="form-control" id="contact" value={formData.contact} onChange={handleChange} required />
            <div className="form-text">{reportType === 'lost' ? 'This will be shared with potential finders' : 'This will be shared with potential owners'}</div>
          </div>
          <button type="submit" className={`btn ${reportType === 'lost' ? 'btn-primary' : 'btn-success'} w-100 py-3 mt-3`}>
            <i className="fas fa-paper-plane me-2"></i>Submit {reportType === 'lost' ? 'Lost' : 'Found'} Item Report
          </button>
        </form>
      </div>
    </div>
  </div>
  <SuccessModal reportType={reportType} modalRef={successModalRef} />
</div>

);
};

export default ReportItemPage;
