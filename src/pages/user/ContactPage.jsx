import React, { useState } from 'react';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');

    const formData = {
      name: e.target['contact-name'].value,
      email: e.target['contact-email'].value,
      subject: e.target['contact-subject'].value,
      message: e.target['contact-message'].value,
    };

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage(data.message);
        e.target.reset();
      } else {
        setResponseMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      setResponseMessage('Server error, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-page" className="page">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="page-title">
            <h2>Contact Us</h2>
          </div>

          <div className="row g-4">
            {/* Contact Info */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">CampusFinds Center</h5>
                  <p className="card-text">
                    <i className="fas fa-map-marker-alt me-2"></i> North Campus Chandigarh University <br></br>    E1 Block Student Care, Room_no. 105
                    <br />
                    <i className="fas fa-phone me-2"></i> (123) 456-7890
                    <br />
                    <i className="fas fa-envelope me-2"></i> CampusFinds@campus.edu
                  </p>
                  <p className="card-text">
                    <strong>Hours:</strong>
                    <br />
                    Monday - Friday: 10:00 AM - 4:00 PM
                    <br />
                    Saturday: 10:00 AM - 1:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Send Us a Message</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="contact-name" className="form-label">Your Name</label>
                      <input type="text" className="form-control" id="contact-name" required />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="contact-email" className="form-label">Email</label>
                      <input type="email" className="form-control" id="contact-email" required />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="contact-subject" className="form-label">Subject</label>
                      <input type="text" className="form-control" id="contact-subject" required />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="contact-message" className="form-label">Message</label>
                      <textarea className="form-control" id="contact-message" rows="3" required></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>

                  {responseMessage && (
                    <div className="alert alert-info mt-3">{responseMessage}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
