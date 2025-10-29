import React, { useState, useRef, useEffect } from "react";
// Import the SAME CSS file used by the user app
import '../../components/Header.css'; 

export default function AdminHeader({ currentPage, showPage, adminName, adminEmail, onLogout }) {
  const [showAdminCard, setShowAdminCard] = useState(false);
  const adminCardRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "lostItems", label: "Lost Items" },
    { id: "foundItems", label: "Found Items" },
    { id: "claims", label: "Claims & Verification" },
    { id: "users", label: "Users Management" },
    { id: "feedback", label: "Feedback & Complaints" },
    { id: "settings", label: "Settings" },
  ];

  // --- Avatar Logic ---
  const getAvatarUrl = (email, name) => {
    // Admin avatar uses a distinct color (e.g., gold/orange/dark-red)
    // Using D4AF37 (Gold) as the background color for Admin
    if (!email) {
        return 'https://ui-avatars.com/api/?name=Admin&size=40&background=D4AF37&color=060010&bold=true';
    }
    const initials = name ? name.split(' ').map(n => n[0]).join('') : 'A';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || initials)}&size=40&background=D4AF37&color=060010&bold=true`;
  };

  const avatarUrl = getAvatarUrl(adminEmail, adminName);
  // ----------------------

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const adminAvatarButton = document.querySelector('.admin-avatar-button');
      
      if (adminCardRef.current && 
          !adminCardRef.current.contains(event.target) &&
          adminAvatarButton &&
          !adminAvatarButton.contains(event.target)
      ) {
        setShowAdminCard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleLinkClick = (pageId) => {
    showPage(pageId);
    setIsMenuOpen(false); // Close menu on click
  };

  return (
    // header-spacer ensures content below doesn't overlap
    <div className="header-spacer">
        {/* Using the same fixed wrapper class */}
        <nav className="app-navbar-fixed admin-theme" role="navigation" aria-label="Admin Main">
            <div className="app-header-container">

                {/* Branding / Logo */}
                <a 
                    className="app-branding" 
                    href="#" 
                    onClick={() => handleLinkClick('dashboard')}
                >
                    <i className="fas fa-shield-alt me-2"></i> Admin Panel
                </a>

                {/* Mobile Toggler (Uses CSS animation) */}
                <button 
                    className={`navbar-toggler ${isMenuOpen ? 'is-active' : ''}`} 
                    type="button"
                    aria-label="Toggle navigation"
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="toggler-line"></span>
                    <span className="toggler-line"></span>
                </button>

                {/* Navigation Links and User Menu */}
                <div className={`app-nav-wrapper ${isMenuOpen ? 'open' : ''}`}>
                    <ul className="nav-list" role="menubar">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.id} role="none">
                                <a 
                                    role="menuitem"
                                    className={`nav-link-item ${currentPage === item.id ? 'active' : ''}`} 
                                    href={`#${item.id}`} 
                                    onClick={() => handleLinkClick(item.id)}
                                >
                                    {item.label}
                                    <span className="link-underline"></span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Admin avatar + dropdown */}
                    <div className="user-profile-section" ref={adminCardRef}>
                        <button
                            className="user-avatar-button admin-avatar-button"
                            onClick={() => setShowAdminCard(!showAdminCard)}
                            aria-label="Admin menu"
                        >
                            <img
                                src={avatarUrl}
                                alt={adminName || "Admin"}
                                className="user-avatar-image admin-avatar-image"
                            />
                        </button>

                        {showAdminCard && (
                            <div className="user-card-popover admin-card-popover">
                                <p className="user-name-text">👋 Hello, {adminName || "Admin"}</p>
                                <button
                                    className="logout-button admin-logout-button"
                                    onClick={() => {
                                        setShowAdminCard(false);
                                        onLogout && onLogout();
                                        handleLinkClick("dashboard"); 
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    </div>
  );
}
