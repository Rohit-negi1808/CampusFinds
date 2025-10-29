import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getStats,
  getRecentLostItems,
  getRecentFoundItems,
  getRecentClaims,
} from "../../api/adminDashboardService";

// =================================================================
// --- Utility Components (Card + Stat Overview) ---
// =================================================================

function Card({ title, children, className = "", onViewAll }) {
  return (
    <div className={`card shadow-lg h-100 border-0 rounded-4 ${className}`}>
      <div className="card-header bg-white fw-bold border-bottom rounded-top-4 px-4 py-3 d-flex justify-content-between align-items-center">
        <span>{title}</span>
        <small
          className="text-muted"
          style={{ cursor: "pointer" }}
          onClick={onViewAll}
        >
          View All
        </small>
      </div>
      <div className="card-body p-0">{children}</div>
    </div>
  );
}

function StatOverviewCard({ stats, showPage }) {
  const statConfig = [
    // --- ITEM STATS ---
    {
      title: "Total Items",
      value: stats.totalItems,
      redirectTo: "dashboard",
      icon: "fas fa-database",
      color: "text-primary",
      border: "var(--bs-primary)",
    },
    {
      title: "Lost Reports",
      value: stats.lost,
      redirectTo: "lostItems",
      icon: "fas fa-search-location",
      color: "text-danger",
      border: "var(--bs-danger)",
    },
    {
      title: "Found Items",
      value: stats.found,
      redirectTo: "foundItems",
      icon: "fas fa-hand-holding-heart",
      color: "text-success",
      border: "var(--bs-success)",
    },

    // --- USER STATS ---
    {
      title: "Total Users",
      value: stats.users,
      redirectTo: "users",
      icon: "fas fa-users",
      color: "text-secondary",
      border: "var(--bs-secondary)",
    },

    // --- CLAIM STATS ---
    {
      title: "Pending Claims",
      value: stats.pendingClaims,
      redirectTo: "claims",
      icon: "fas fa-clipboard-check",
      color: "text-warning",
      border: "var(--bs-warning)",
    },
    {
      title: "Total Claims",
      value: stats.totalClaims,
      redirectTo: "claims",
      icon: "fas fa-clipboard-list",
      color: "text-info",
      border: "var(--bs-info)",
    },

    // --- FEEDBACK STATS ---
    {
      title: "Pending Feedbacks",
      value: stats.pendingFeedbacks,
      redirectTo: "feedback",
      icon: "fas fa-exclamation-triangle",
      color: "text-danger",
      border: "var(--bs-danger)",
    },
    {
      title: "Total Feedbacks",
      value: stats.totalContacts || 0,
      redirectTo: "feedback",
      icon: "fas fa-envelope-open-text",
      color: "text-dark",
      border: "var(--bs-dark)",
    },
  ];

  return (
    <div className="card shadow-lg border-0 rounded-4 mb-5 p-4 bg-white">
      <h4 className="card-title fw-bold mb-4 border-bottom pb-2 text-primary">
        Key Administrative Metrics 🔑
      </h4>
      <div className="row g-4 justify-content-start">
        {statConfig.map((stat, index) => (
          <div key={index} className="col-xxl-3 col-lg-4 col-md-6 col-12">
            <div
              className={`p-3 rounded-4 h-100 d-flex flex-column justify-content-center shadow-sm border`}
              onClick={() => showPage && showPage(stat.redirectTo)}
              style={{
                cursor: "pointer",
                transition:
                  "transform 0.3s, box-shadow 0.3s, background-color 0.3s",
                borderLeft: `5px solid ${stat.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 0.75rem 1.5rem rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.backgroundColor = "var(--bs-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 .125rem .25rem rgba(0,0,0,.075)";
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <div className="d-flex align-items-center w-100">
                <div className={`${stat.color} display-6 me-3`}>
                  <i className={stat.icon}></i>
                </div>
                <div className="flex-grow-1">
                  <p
                    className={`text-uppercase fw-semibold mb-0 small ${stat.color}`}
                  >
                    {stat.title}
                  </p>
                  <h3 className="fw-bolder mb-0 text-dark">
                    {stat.value || 0}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================================================================
// --- Main AdminDashboard Component ---
// =================================================================

export default function AdminDashboard({ showPage }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    lost: 0,
    found: 0,
    totalClaims: 0,
    pendingClaims: 0,
    users: 0,
    totalContacts: 0,
    pendingFeedbacks: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsData = await getStats();

      setStats({
        totalItems: statsData.totalLost + statsData.totalFound,
        lost: statsData.totalLost,
        found: statsData.totalFound,
        totalClaims: statsData.totalClaims,
        pendingClaims: statsData.pendingClaims,
        users: statsData.totalUsers,
        totalContacts: statsData.totalContacts || 0,
        pendingFeedbacks: statsData.pendingFeedbacks || 0,
      });

      const lostItems = await getRecentLostItems();
      const foundItems = await getRecentFoundItems();
      setRecentItems(
        [...lostItems, ...foundItems]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 7)
      );

      const claims = await getRecentClaims();
      setRecentClaims(claims);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "waiting":
      case "pending":
        return (
          <span className="badge bg-warning text-dark rounded-pill fw-normal">
            Pending
          </span>
        );
      case "verified":
      case "found":
        return (
          <span className="badge bg-success rounded-pill fw-normal">
            Found
          </span>
        );
      case "lost":
        return (
          <span className="badge bg-danger rounded-pill fw-normal">
            Lost
          </span>
        );
      case "approved":
      case "claimed":
        return (
          <span className="badge bg-info rounded-pill fw-normal">
            Claimed
          </span>
        );
      case "rejected":
        return (
          <span className="badge bg-secondary rounded-pill fw-normal">
            Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary rounded-pill fw-normal">
            {status}
          </span>
        );
    }
  };

  const createHorizontalItem = (key, content, statusBadge, secondaryBadge) => (
    <li
      key={key}
      className="list-group-item list-group-item-action border-0 px-4 py-3 d-flex justify-content-between align-items-center"
      style={{
        cursor: "pointer",
        transition: "background-color 0.15s ease-in-out",
        borderBottom: "1px solid #eee",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f2f5")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
    >
      <div className="d-flex align-items-center w-100">
        <div className="flex-grow-1">
          <div className="fw-semibold text-truncate">
            {content.props.children[0]}
          </div>
          <div className="text-muted small">
            {content.props.children[1]}
          </div>
        </div>
        <div className="d-flex flex-column flex-sm-row align-items-end align-items-sm-center ms-3">
          <span className="me-2 mb-1 mb-sm-0">{statusBadge}</span>
          {secondaryBadge}
        </div>
      </div>
    </li>
  );

  return (
    <div className="container-fluid py-0 bg-light min-vh-100">
      {/* Banner */}
      <div
        className="d-flex flex-column align-items-center justify-content-center text-white py-5 mb-5 rounded-bottom-5 shadow"
        style={{
          background: "linear-gradient(to right, #00BCD4, #4CAF50)",
        }}
      >
        <h1 className="fw-bolder mb-2 display-4">Admin Dashboard</h1>
        <p className="lead fw-light text-center px-4">
          Welcome back! Manage reports, claims, and users for CampusFinds.
        </p>
      </div>

      <div className="container pb-5">
        {/* Stats Overview */}
        <StatOverviewCard stats={stats} showPage={showPage} />

        {/* Recent Activity */}
        <h3 className="fw-bold text-center mb-4 mt-5">
          Recently Reported Activity
        </h3>
        <div className="row g-5">
          <div className="col-lg-6">
            <Card title="Recent Item Listings" onViewAll={() => showPage("lostItems")}>
              {recentItems.length === 0 ? (
                <div className="text-muted text-center py-5">
                  <i className="fas fa-box-open fa-2x mb-3"></i>
                  <p className="mb-0">
                    No recent item listings have been reported.
                  </p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {recentItems.map((it) =>
                    createHorizontalItem(
                      it._id,
                      <>
                        <div className="fw-semibold text-truncate">{it.title}</div>
                        <div className="text-muted small">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {it.location} |{" "}
                          <i className="fas fa-calendar-alt me-1"></i>
                          {new Date(it.createdAt).toLocaleDateString()}
                        </div>
                      </>,
                      getStatusBadge(it.status),
                      <span className="badge bg-light text-secondary rounded-pill fw-normal border">
                        ID: {it._id.slice(-4)}
                      </span>
                    )
                  )}
                </ul>
              )}
            </Card>
          </div>

          <div className="col-lg-6">
            <Card title="Recent Claim Submissions" onViewAll={() => showPage("claims")}>
              {recentClaims.length === 0 ? (
                <div className="text-muted text-center py-5">
                  <i className="fas fa-clipboard-check fa-2x mb-3"></i>
                  <p className="mb-0">No recent claims awaiting verification.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {recentClaims.map((c) =>
                    createHorizontalItem(
                      c._id,
                      <>
                        <div className="fw-semibold">
                          <i className="fas fa-check-circle me-1"></i>
                          Claim ID: {c._id.slice(-4)}
                        </div>
                        <div className="text-muted small">
                          Item ID: {c.itemId.slice(-4)} • Claimed by: {c.claimantName}
                        </div>
                      </>,
                      getStatusBadge(c.status),
                      null
                    )
                  )}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
