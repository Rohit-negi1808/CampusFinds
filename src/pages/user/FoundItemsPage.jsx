import React, { useState, useEffect, useRef } from 'react';
import ItemCard from '../../components/ItemCard.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';
import { formatDate, getImageUrl, capitalizeFirstLetter } from '../../utils.js';

// --- HELPER FUNCTION FOR STATUS DISPLAY (Based on Mongoose Enum) ---
const getStatusDisplay = (status) => {
    const statusLower = status?.toLowerCase(); 

    if (statusLower === "found and submitted") {
        return { 
            text: "F & Submitted", // Shorter text for badge display
            badgeClass: "bg-success",
            fullText: "Found and Submitted" // Full text for detail view
        };
    } else {
        return { 
            text: "Found", 
            badgeClass: "bg-primary",
            fullText: "Found"
        };
    }
};
// -----------------------------------------------------------------


const FoundItemsPage = ({ showPage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claimData, setClaimData] = useState({ name: '', contact: '', message: '' });
    const [loading, setLoading] = useState(true);
    const claimModalRef = useRef(null);

    // Fetch found items from backend
    useEffect(() => {
        const fetchFoundItems = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:5000/api/found-items');
                const data = await res.json();
                const itemsWithType = data.map(item => ({ ...item, type: 'found' }));
                setItems(itemsWithType);
            } catch (err) {
                console.error('Error fetching found items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFoundItems();
    }, []);

    // Filter based on search
    useEffect(() => {
        const foundItems = items.filter(i => i.type === 'found');
        const currentFiltered = foundItems.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(currentFiltered);
    }, [searchTerm, items]);

    const handleSearch = () => setSearchTerm(searchTerm.trim());

    const submitClaim = async () => {
        if (!claimData.name || !claimData.contact || !claimData.message) {
            return alert("Please fill in Name, Contact, and Message.");
        }

        try {
            const res = await fetch('http://localhost:5000/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId: selectedItem._id,
                    claimantName: claimData.name,
                    contact: claimData.contact,
                    message: claimData.message
                })
            });

            if (!res.ok) throw new Error("Failed to send claim");
            const data = await res.json();

            // Show success modal
            if (claimModalRef.current) {
                const modal = new window.bootstrap.Modal(claimModalRef.current);
                modal.show();
            }

            setShowClaimForm(false);
            setClaimData({ name: '', contact: '', message: '' });

        } catch (err) {
            console.error(err);
            alert("Error submitting claim.");
        }
    };

    // Skeleton loader card
    const SkeletonCard = () => (
        <div className="col-md-4">
            <div className="card shadow-sm p-3">
                <div className="placeholder-glow">
                    <div className="placeholder rounded w-100 mb-3" style={{ height: "180px" }}></div>
                    <h5 className="card-title placeholder-glow">
                        <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                        <span className="placeholder col-7"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-6"></span>
                    </p>
                </div>
            </div>
        </div>
    );

    // Detail view
    if (selectedItem) {
        // ⭐ GET STATUS INFO FOR DETAIL VIEW ⭐
        const statusInfo = getStatusDisplay(selectedItem.status);

        return (
            <div className="container md-4 d-flex justify-content-center">
                <div style={{ maxWidth: "1000px", width: "100%" }}>
                    <button
                        className="btn btn-outline-secondary mb-3"
                        onClick={() => {
                            setSelectedItem(null);
                            setShowClaimForm(false);
                            setClaimData({ name: '', contact: '', message: '' });
                        }}
                    >
                        ← Back to Found Items
                    </button>

                    <div className="card p-3 shadow-sm">
                        <div className="row g-0 align-items-center">
                            {/* Image */}
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <div
                                    style={{
                                        border: "5px solid #e9ecef",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        width: "250px",
                                        height: "250px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto"
                                    }}
                                >
                                    {selectedItem.imageUrl ? (
                                        <img
                                            src={getImageUrl(selectedItem.imageUrl)}
                                            alt={selectedItem.title}
                                            className="img-fluid"
                                            style={{
                                                width: "100%",
                                                maxHeight: "210px",
                                                objectFit: "cover",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    ) : <span>No Image</span>}
                                </div>
                                
                                {/* ⭐ APPLY STATUS BADGE ⭐ */}
                                <span className={`badge ${statusInfo.badgeClass} mt-3 mb-2`} style={{ fontSize: "1.1rem" }}>
                                    {statusInfo.fullText} 
                                </span>
                            </div>

                            {/* Details */}
                            <div className="col-md-8 ps-md-4">
                                <h3>{selectedItem.title}</h3>
                                <p className="text-muted">
                                    Category: {capitalizeFirstLetter(selectedItem.category || "Uncategorized")}
                                </p>
                                <p>{selectedItem.description}</p>

                                <div className="mt-4 p-3 border rounded bg-light">
                                    <h5>Found Details</h5>
                                    <p><strong>📍 Location:</strong> {selectedItem.location || "Not provided"}</p>
                                    <p><strong>📅 Date:</strong> {formatDate(selectedItem.dateFound)}</p>
                                    <p><strong>📧 Contact:</strong> {selectedItem.contact || "Not provided"}</p>
                                </div>

                                {/* Claim Button */}
                                <div className="mt-3">
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => setShowClaimForm(!showClaimForm)}
                                    >
                                        {showClaimForm ? "Cancel Claim" : "Claim This Item"}
                                    </button>
                                </div>

                                {/* Claim Form */}
                                {showClaimForm && (
                                    <div className="mt-3 p-3 border rounded bg-light">
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            className="form-control mb-2"
                                            value={claimData.name}
                                            onChange={(e) => setClaimData({ ...claimData, name: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Your Contact Number"
                                            className="form-control mb-2"
                                            value={claimData.contact}
                                            onChange={(e) => setClaimData({ ...claimData, contact: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Message to finder"
                                            className="form-control mb-2"
                                            value={claimData.message}
                                            onChange={(e) => setClaimData({ ...claimData, message: e.target.value })}
                                        />
                                        <button
                                            className="btn btn-success w-100"
                                            onClick={submitClaim}
                                        >
                                            Submit Claim
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Modal */}
                <SuccessModal isClaim={true} modalRef={claimModalRef} claimData={claimData} />
            </div>
        );
    }

    // List view with search bar + skeleton loader
    return (
        <div id="found-items-page" className="page">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="page-title">
                    <h2>Found Items</h2>
                </div>
                <div className="search-box" style={{ maxWidth: "500px", width: "100%" }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            id="found-search"
                            placeholder="Search found items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="button" onClick={handleSearch}>
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="mt-4">
                    <div className="text-center mb-4">
                        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5 className="mt-3 text-muted">Fetching found items...</h5>
                    </div>
                    <div className="row g-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            ) : (
                <div className="row g-4" id="found-items-container">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <ItemCard
                                key={item._id}
                                item={item}
                                showItemDetail={() => setSelectedItem(item)}
                                // ⭐ PASS STATUS INFO TO ITEMCARD ⭐
                                statusInfo={getStatusDisplay(item.status)}
                            />
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h4 className="text-muted">No found items found</h4>
                            <p className="text-secondary">Check back later or view lost items</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FoundItemsPage;