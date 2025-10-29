import React, { useState, useRef, useEffect } from 'react';
import './Header.css'; 

const NAV_ITEMS = [
    { label: 'Home', page: 'home' },
    { label: 'Lost Items', page: 'lostItems' },
    { label: 'Found Items', page: 'foundItems' },
    { label: 'Report Item', page: 'report' },
    { label: 'Contact', page: 'contact' }
];

const Header = ({ showPage, currentPage, userName, userEmail, onLogout }) => {
    const [showUserCard, setShowUserCard] = useState(false);
    const userCardRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 

    // --- Avatar Logic (Gravatar-style placeholder) ---
    const getAvatarUrl = (email, name) => {
        // If email is null (Guest user), return a default grey placeholder
        if (!email) {
            return 'https://ui-avatars.com/api/?name=Guest&size=40&background=6c757d&color=ffffff&bold=true';
        }
        // Use a service to generate a unique avatar based on the name/email
        // Using the blue accent color from the banner for logged-in users
        const initials = name ? name.split(' ').map(n => n[0]).join('') : 'U';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || initials)}&size=40&background=3498db&color=ffffff&bold=true`;
    };

    const avatarUrl = getAvatarUrl(userEmail, userName);
    // ----------------------

    // Close user card/menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const userAvatar = document.querySelector('.user-avatar-button');
            
            // Close User Card
            if (userCardRef.current && 
                !userCardRef.current.contains(event.target) &&
                userAvatar &&
                !userAvatar.contains(event.target)
            ) {
                setShowUserCard(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Function to handle link clicks and also close the mobile menu
    const handleLinkClick = (page) => {
        showPage(page);
        setIsMenuOpen(false); // Close menu on click
    };

    return (
        // header-spacer ensures content below doesn't overlap
        <div className="header-spacer">
            {/* The fixed header wrapper */}
            <nav className="app-navbar-fixed" role="navigation" aria-label="Main">
                <div className="app-header-container">

                    {/* Branding / Logo */}
                    <a className="app-branding" href="#" onClick={() => handleLinkClick('home')}>
                        <i className="fas fa-search me-2"></i>CampusFinds
                    </a>

                    {/* Mobile Toggler */}
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
                                <li key={item.page} role="none">
                                    <a 
                                        role="menuitem"
                                        className={`nav-link-item ${currentPage === item.page ? 'active' : ''}`} 
                                        href={`#${item.page}`} 
                                        onClick={() => handleLinkClick(item.page)}
                                    >
                                        {item.label}
                                        <span className="link-underline"></span>
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* User avatar and Logout button */}
                        <div className="user-profile-section" ref={userCardRef}>
                            <button
                                className="user-avatar-button"
                                onClick={() => setShowUserCard(!showUserCard)}
                                aria-label="User menu"
                            >
                                <img
                                    src={avatarUrl}
                                    alt={userName}
                                    className="user-avatar-image"
                                />
                            </button>

                            {showUserCard && (
                                <div className="user-card-popover">
                                    <p className="user-name-text">Hello, {userName}</p>
                                    <button
                                        className="logout-button"
                                        onClick={() => {
                                            setShowUserCard(false);
                                            onLogout && onLogout();
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
};

export default Header;
