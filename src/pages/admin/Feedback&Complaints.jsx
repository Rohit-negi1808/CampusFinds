import React, { useState, useEffect, Fragment } from "react";

// --- START: Inline SVG Icon Definitions (NO CHANGES) ---
const MailIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
  </svg>
);

const UserIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const AlertCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const LoaderIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
// --- END: Inline SVG Icon Definitions ---

// Helper to format date nicely
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function FeedbackComplaints() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data from the API endpoint
      const res = await fetch("http://localhost:5000/api/contact");
      if (!res.ok) {
        throw new Error("Failed to fetch contact messages");
      }
      const data = await res.json();
      
      // Client-side sorting: PENDING messages first, then newest first
      data.sort((a, b) => {
        // --- CRITICAL FIX 1: Change 'open' to 'pending' in sorting ---
        if (a.status === "pending" && b.status === "resolved") return -1;
        if (a.status === "resolved" && b.status === "pending") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setContacts(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // RESOLVE LOGIC: Sends PUT request and updates local state
  const resolveReport = async (id) => {
    try {
      // Endpoint is correct: PUT /api/contact/:id/resolve
      const res = await fetch(`http://localhost:5000/api/contact/${id}/resolve`, {
        method: "PUT",
      });

      if (res.ok) {
        // Optimistically update the UI to "resolved"
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: "resolved" } : c))
        );
      } else {
        const errorData = await res.json();
        console.error('Failed to resolve:', errorData.error);
        alert(`Failed to resolve: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Resolve Error:", error);
      alert("Server error while resolving message.");
    }
  };

  // --- CRITICAL FIX 2: Change 'open' to 'pending' in the count ---
  const openContactsCount = contacts.filter((c) => c.status === "pending").length;

  return (
    <Fragment>
      {/* Custom style block to inject the specific green color (#20c997) */}
      <style>
        {`
          .custom-green-border {
              border-color: #20c997 !important;
          }
          .custom-green-text {
              color: #20c997 !important;
          }
          /* Ensure the spinner animates */
          @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
          .animate-spin {
              animation: spin 1s linear infinite;
          }
        `}
      </style>
      
      <div>
        
        {/* Main Content Area */}
        <div className="container-lg pt-4 px-4"> 
          
          {/* Header Section (Title and Description) */}
          <div className="mb-4">
            <h2 className="fs-3 fw-bold text-dark d-flex align-items-center mb-1">
              <MailIcon
                className="me-2 text-secondary"
                style={{ width: "1.75rem", height: "1.75rem" }}
              />
              Support & Feedback Inbox
            </h2>
            <p className="text-secondary small mb-3">
              Review and resolve user complaints and feedback submitted through the contact form.
            </p>
          </div>

          {/* Status Summary (Alert Box) - Uses custom green */}
          <div className="alert alert-secondary border-start border-4 custom-green-border shadow-sm py-2 px-3 mb-3">
            <div className="d-flex align-items-center">
              <AlertCircleIcon
                className="me-2 custom-green-text"
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <span className="fw-semibold text-dark">
                You have{" "}
                <span className="custom-green-text fw-bold">{openContactsCount}</span>{" "}
                pending message{openContactsCount !== 1 ? "s" : ""} requiring
                action.
              </span>
            </div>
          </div>

          {/* Loading, Error, Empty States */}
          {loading && (
            <div className="text-center py-4 text-secondary">
              <LoaderIcon
                className="animate-spin"
                style={{ width: "2rem", height: "2rem" }}
              />
              <p className="mt-2 small">Loading contact messages...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center small py-2 mb-3">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && contacts.length === 0 && (
            <div className="alert alert-success text-center py-3 mb-2">
              <CheckCircleIcon
                style={{ width: "1.5rem", height: "1.5rem" }}
                className="text-success mb-2"
              />
              <p className="fw-medium mb-0 small">
                All clear! No new contact messages submitted.
              </p>
            </div>
          )}

          {/* Contact Cards */}
          <div className="d-grid gap-3">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className={`card shadow-sm border-start border-4 ${
                  // --- CRITICAL FIX 3: Change 'open' to 'pending' in styling ---
                  contact.status === "pending"
                    ? "border-danger" // Red border for pending
                    : "border-success bg-white" // Green border for resolved
                }`}
              >
                <div className="card-body p-3">
                  {/* Header Info */}
                  <div className="d-flex justify-content-between align-items-start flex-column flex-md-row mb-2">
                    <div className="mb-2 mb-md-0">
                      <h6 className="card-title fw-semibold text-dark d-flex align-items-center mb-1">
                        <MailIcon
                          className="me-2 text-dark"
                          style={{ width: "1rem", height: "1rem" }}
                        />
                        {contact.subject}
                      </h6>
                      <div className="text-secondary small d-flex align-items-center mb-1">
                        <UserIcon
                          className="me-1"
                          style={{ width: "0.9rem", height: "0.9rem" }}
                        />
                        <span className="fw-semibold text-dark me-1">
                          {contact.name}
                        </span>
                        (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-info text-decoration-none"
                        >
                          {contact.email}
                        </a>
                        )
                      </div>
                      <div className="text-muted small d-flex align-items-center">
                        <ClockIcon
                          className="me-1"
                          style={{ width: "0.9rem", height: "0.9rem" }}
                        />
                        {formatDate(contact.createdAt)}
                      </div>
                    </div>

                    {/* Resolved Badge */}
                    {contact.status === "resolved" && (
                      <span className="badge bg-success-subtle text-success fw-semibold align-self-start p-2">
                        <CheckCircleIcon
                          className="me-1"
                          style={{ width: "0.9rem", height: "0.9rem" }}
                        />
                        Resolved
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="bg-light rounded p-2 mb-2 border">
                    <p className="fw-medium text-dark small mb-1 border-bottom pb-1">
                      Message:
                    </p>
                    <p
                      className="text-secondary small mb-0"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {contact.message}
                    </p>
                  </div>

                  {/* Resolve Button */}
                  {/* --- CRITICAL FIX 4: Change 'open' to 'pending' for button visibility --- */}
                  {contact.status === "pending" && ( 
                    <div className="text-end">
                      <button
                        onClick={() => resolveReport(contact._id)}
                        className="btn btn-sm btn-dark fw-semibold d-flex align-items-center ms-auto"
                      >
                        <CheckCircleIcon
                          className="me-1"
                          style={{ width: "0.9rem", height: "0.9rem" }}
                        />
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Fragment>
  );
}