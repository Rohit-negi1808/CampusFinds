import React, { useState } from "react";
import AdminHeader from "../../components/admin/Header.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import LostItemsManagement from "./LostItemsManagement.jsx";
import FoundItemsManagement from "./FoundItemsManagement.jsx";
import ClaimsVerification from "./Claims&Verification.jsx";
import UsersManagement from "./UsersManagement.jsx";
import FeedbackComplaints from "./Feedback&Complaints.jsx";
import Settings from "./Settings.jsx";

export default function AdminApp({ onLogout }) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const adminUser = {
    name: "System Admin",
    email: "admin@campusfinds.com",
  };

  const showPage = (pageId) => {
    setCurrentPage(pageId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        // ✅ Pass showPage to AdminDashboard so clicking stats navigates correctly
        return <AdminDashboard showPage={showPage} />; 
      case "lostItems":
        return <LostItemsManagement />;
      case "foundItems":
        return <FoundItemsManagement />;
      case "claims":
        return <ClaimsVerification />;
      case "users":
        return <UsersManagement />;
      case "feedback":
        return <FeedbackComplaints />;
      case "settings":
        return <Settings />;
      default:
        return <AdminDashboard showPage={showPage} />; // also here for safety
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader 
        showPage={showPage} 
        currentPage={currentPage}
        adminName={adminUser.name}
        adminEmail={adminUser.email}
        onLogout={onLogout} 
      />
      
      <div className="flex-grow p-6 bg-gray-50 pt-0 sm:pt-6"> 
        {renderPage()}
      </div>
    </div>
  );
}
