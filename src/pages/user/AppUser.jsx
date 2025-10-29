import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import HomePage from '../user/HomePage.jsx';
import LostItemsPage from '../user/LostItemsPage.jsx';
import FoundItemsPage from '../user/FoundItemsPage.jsx';
import ReportItemPage from '../user/ReportItemPage.jsx';
import ContactPage from '../user/ContactPage.jsx';
import { initialItems, initialItemHistory } from '../../data/data.js';

// Component name is AppUser to match project structure
function AppUser({ currentUser, onLogout }) { 
    const [currentPage, setCurrentPage] = useState('home');
    const [items, setItems] = useState(initialItems);
    const [itemHistory, setItemHistory] = useState(initialItemHistory);
    const [selectedItem, setSelectedItem] = useState(null);

    const showPage = (pageId, item = null) => {
        setCurrentPage(pageId);
        setSelectedItem(item);
    };

    const addItem = (newItem) => {
        setItems(prevItems => [...prevItems, newItem]);
    };

    const addClaimHistory = (newClaim) => {
        setItemHistory(prevHistory => [...prevHistory, newClaim]);
    };

    const updateItemStatus = (itemId, newStatus) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
            )
        );
    };

    const getClaimHistoryForItem = (itemId) => {
        return itemHistory.filter(h => h.itemId === itemId);
    };

    // Determine if user is logged in
    const isLoggedIn = !!currentUser;
    
    // --- Determine Content to Render ---
    let PageContent;
    switch (currentPage) {
        case 'home':
            PageContent = <HomePage showPage={showPage} items={items} />;
            break;
        case 'lostItems':
            PageContent = <LostItemsPage showPage={showPage} items={items} />;
            break;
        case 'foundItems':
            PageContent = <FoundItemsPage showPage={showPage} items={items} />;
            break;
        case 'report':
            // Only allow reporting if logged in
            PageContent = isLoggedIn 
                ? <ReportItemPage addItem={addItem} showPage={showPage} currentUser={currentUser} /> 
                : <HomePage showPage={showPage} items={items} />; 
            break;
        case 'contact':
            PageContent = <ContactPage />;
            break;

        default:
            PageContent = <HomePage showPage={showPage} items={items} />;
    }

    return (
        <>
            <Header 
                showPage={showPage} 
                currentPage={currentPage} 
                userName={currentUser ? currentUser.name : 'Guest'} 
                userEmail={currentUser ? currentUser.email : null} 
                onLogout={onLogout} 
            />
            <div className="container flex-grow-1 py-4">
                {PageContent}
            </div>
            <Footer showPage={showPage} />
        </>
    );
}

export default AppUser;
