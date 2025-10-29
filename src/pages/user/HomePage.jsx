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
            badgeClass: "bg-primary", // Using primary blue for Found status
            fullText: "Found"
        };
    }
};
// -----------------------------------------------------------------


const HomePage = ({ showPage }) => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claimData, setClaimData] = useState({ name: '', contact: '', message: '' });
    const [loading, setLoading] = useState(true);
    const claimModalRef = useRef(null);

    // Fetch latest 3 found items
    useEffect(() => {
        const fetchRecentFound = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:5000/api/found-items');
                const data = await res.json();
                const sorted = data
                    .sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound))
                    .slice(0, 3)
                    .map(item => ({ ...item, type: 'found' }));
                setItems(sorted);
            } catch (err) {
                console.error('Error fetching recent found items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentFound();
    }, []);

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
                        ← Back
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
                                
                                {/* ⭐ APPLY DYNAMIC STATUS BADGE (DETAIL VIEW) ⭐ */}
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

                                <div className="mt-3">
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={() => setShowClaimForm(!showClaimForm)}
                                    >
                                        {showClaimForm ? "Cancel Claim" : "Claim This Item"}
                                    </button>
                                </div>

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
                                        <button className="btn btn-success w-100" onClick={submitClaim}>
                                            Submit Claim
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <SuccessModal isClaim={true} modalRef={claimModalRef} claimData={claimData} />
            </div>
        );
    }

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

    // Default homepage view
    return (
        <div id="home-page" className="page">
            {/* HERO SECTION */}
            <section className="hero-section text-center">
                <div className="container">
                    <h1 className="display-4 fw-bold mb-4">Lost Something?</h1>
                    <p className="lead mb-4">Our CampusFinds platform helps students reunite with their belongings.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-light btn-lg" onClick={() => showPage('report')}>Report Item</button>
                        <button className="btn btn-outline-light btn-lg" onClick={() => showPage('foundItems')}>Browse Found Items</button>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-5">
                <div className="container">
                    <h2 className="text-center mb-5">How It Works</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center py-4">
                                    <div className="mb-3">
                                        <i className="fas fa-exclamation-triangle fs-1 text-danger"></i>
                                    </div>
                                    <h5 className="card-title">Report Lost Item</h5>
                                    <p className="card-text">Complete our simple form to notify others about your lost item.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center py-4">
                                    <div className="mb-3">
                                        <i className="fas fa-lightbulb fs-1 text-warning"></i>
                                    </div>
                                    <h5 className="card-title">Browse Found Items</h5>
                                    <p className="card-text">Check our database of found items matching your description.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center py-4">
                                    <div className="mb-3">
                                        <i className="fas fa-handshake fs-1 text-success"></i>
                                    </div>
                                    <h5 className="card-title">Claim Your Item</h5>
                                    <p className="card-text">Contact the finder through our secure messaging system.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RECENTLY FOUND ITEMS */}
            <section className="py-5">
                <div className="container">
                    <h2 className="text-center mb-5">Recently Found Items</h2>
                    <div className="row g-4" id="recent-found-items">
                        {loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : items.length > 0 ? (
                            items.map(item => (
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
                                <h4>No recent found items</h4>
                                <p>Check back later or report a lost item.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;