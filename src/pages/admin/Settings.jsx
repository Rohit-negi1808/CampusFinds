import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Settings() {
  const [autoDelete, setAutoDelete] = useState(true);
  const [deleteDays, setDeleteDays] = useState(90);
  const [message, setMessage] = useState("");
  const [notifySent, setNotifySent] = useState(false);

  const saveSettings = () => {
    setMessage("Settings saved successfully!");
    setTimeout(() => setMessage(""), 2500);
    alert(`Settings saved. Auto-delete: ${autoDelete}, Days: ${deleteDays}`);
  };

  const handleNotify = () => {
    setNotifySent(true);
    setTimeout(() => setNotifySent(false), 3000);
  };

  return (
    <div className="container mt-5 mb-5">
      {/* PAGE HEADER */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">
          <i className="bi bi-gear-fill me-2"></i>System Settings
        </h2>
        <p className="text-muted">
          Manage your preferences and explore upcoming features for better
          control and automation.
        </p>
      </div>

      {/* AUTO-DELETE SETTINGS */}
      <div className="card shadow-lg border-0 rounded-4 p-4 mb-4">
        <div className="card-body">
          <h5 className="card-title fw-semibold mb-3 text-dark">
            <i className="bi bi-trash3-fill text-danger me-2"></i>Auto-delete Old
            Items
          </h5>
          <p className="text-muted mb-3">
            Automatically remove or archive items older than a specified number
            of days. Helps keep the system clean and efficient.
          </p>

          {/* In Progress Banner */}
          <div
            className="d-inline-flex align-items-center rounded-pill px-3 py-1 mb-3"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,243,224,1) 0%, rgba(255,250,240,1) 100%)",
              border: "1px solid rgba(255, 210, 100, 0.25)",
            }}
          >
            <span className="spinner-grow spinner-grow-sm text-warning me-2"></span>
            <strong className="me-2" style={{ fontSize: 13 }}>
              In Progress
            </strong>
            <small className="text-muted">
              Feature under development — coming soon!
            </small>
          </div>

          {/* Controls */}
          <div className="d-flex align-items-center justify-content-between flex-wrap mt-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input fs-4"
                type="checkbox"
                id="autoDeleteSwitch"
                checked={autoDelete}
                onChange={(e) => setAutoDelete(e.target.checked)}
              />
              <label
                className="form-check-label fw-medium ms-2"
                htmlFor="autoDeleteSwitch"
              >
                {autoDelete ? "Enabled" : "Disabled"}
              </label>
            </div>

            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <input
                type="number"
                className="form-control border-primary shadow-sm"
                style={{ width: "100px" }}
                value={deleteDays}
                onChange={(e) => setDeleteDays(Number(e.target.value))}
              />
              <span className="text-secondary">days</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="progress" style={{ height: "7px", borderRadius: "10px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                style={{ width: "40%" }}
              ></div>
            </div>
            <small className="text-muted d-block mt-1">
              Development progress — phase 2 of 5
            </small>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap">
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
                onClick={saveSettings}
              >
                <i className="bi bi-save me-2"></i>Save Settings
              </button>
              <button
                className="btn btn-outline-secondary px-3 py-2 shadow-sm"
                onClick={() =>
                  alert("This feature is currently in progress.")
                }
              >
                <i className="bi bi-play-btn me-1"></i>Test
              </button>
            </div>

            <div>
              <button
                className={`btn btn-sm ${
                  notifySent ? "btn-success" : "btn-outline-warning"
                } shadow-sm`}
                onClick={handleNotify}
              >
                {notifySent ? (
                  <>
                    <i className="bi bi-check2 me-1"></i> Notified
                  </>
                ) : (
                  <>
                    <i className="bi bi-bell me-1"></i> Notify Me
                  </>
                )}
              </button>
              <div className="small text-muted mt-1 text-end">
                Get notified when this feature goes live.
              </div>
            </div>
          </div>

          {/* Save Confirmation */}
          {message && (
            <div className="alert alert-success mt-3 py-2 text-center mb-0">
              {message}
            </div>
          )}
        </div>
      </div>

      {/* UPCOMING FEATURES */}
      <div className="text-center mb-4 mt-5">
        <h4 className="text-secondary fw-semibold">
          <i className="bi bi-hourglass-split me-2"></i>Upcoming Features
        </h4>
        <p className="text-muted">
          These features are currently in development and will be available in
          future updates.
        </p>
      </div>

      {/* FEATURE GRID */}
      <div className="row g-4">
        {/* Dark Mode */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 future-card text-center p-3 position-relative">
            <div className="card-body">
              <i className="bi bi-moon-stars-fill fs-2 text-primary mb-3"></i>
              <h5 className="fw-bold">Dark Mode</h5>
              <p className="text-muted">
                Switch between light and dark themes for a more comfortable
                viewing experience.
              </p>
              <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 future-card text-center p-3 position-relative">
            <div className="card-body">
              <i className="bi bi-bell-fill fs-2 text-danger mb-3"></i>
              <h5 className="fw-bold">Email & SMS Notifications</h5>
              <p className="text-muted">
                Get instant alerts for newly found items, verification requests,
                or claim updates.
              </p>
              <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 future-card text-center p-3 position-relative">
            <div className="card-body">
              <i className="bi bi-person-gear fs-2 text-success mb-3"></i>
              <h5 className="fw-bold">Account Preferences</h5>
              <p className="text-muted">
                Update your profile, change passwords, and customize your admin
                preferences.
              </p>
              <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Data Backup */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 future-card text-center p-3 position-relative">
            <div className="card-body">
              <i className="bi bi-cloud-arrow-up-fill fs-2 text-info mb-3"></i>
              <h5 className="fw-bold">Data Backup</h5>
              <p className="text-muted">
                Automatically backup lost and found data to prevent accidental
                loss or corruption.
              </p>
              <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 future-card text-center p-3 position-relative">
            <div className="card-body">
              <i className="bi bi-bar-chart-fill fs-2 text-secondary mb-3"></i>
              <h5 className="fw-bold">Advanced Analytics</h5>
              <p className="text-muted">
                View insightful analytics on lost and found patterns to improve
                efficiency and traceability.
              </p>
              <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Admin Control */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 future-card text-center p-3 position-relative">
            <div className="card-body">
              <i className="bi bi-people-fill fs-2 text-primary mb-3"></i>
              <h5 className="fw-bold">Multi-Admin Control</h5>
              <p className="text-muted">
                Allow multiple admins to manage campus finds with different
                access levels and permissions.
              </p>
              <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center mt-5 text-muted small">
        <i className="bi bi-lightbulb-fill text-warning me-2"></i>
        <h6>More exciting updates are on the way. Stay tuned!</h6>
      </div>

      {/* STYLES */}
      <style>{`
        .future-card {
          transition: all 0.3s ease-in-out;
        }
        .future-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
