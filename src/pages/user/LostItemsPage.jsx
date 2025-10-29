import React, { useState, useEffect } from 'react';
import ItemCard from '../../components/ItemCard.jsx';
import { formatDate, getImageUrl, capitalizeFirstLetter } from '../../utils.js';

const LostItemsPage = ({ showPage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch lost items from backend
    useEffect(() => {
        const fetchLostItems = async () => {
            try {
                setLoading(true);
                // ✅ Corrected API URL to match the backend route
                const res = await fetch('http://localhost:5000/api/lost-items'); 
                const data = await res.json();
                const itemsWithType = data.map(item => ({ ...item, type: 'lost' }));
                setItems(itemsWithType);
            } catch (err) {
                console.error('Error fetching lost items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLostItems();
    }, []);

    // Filter based on search
    useEffect(() => {
        const lostItems = items.filter(i => i.type === 'lost');
        const currentFiltered = lostItems.filter(item =>
            (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredItems(currentFiltered);
    }, [searchTerm, items]);

    const handleSearch = () => {
        setSearchTerm(searchTerm.trim());
    };

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

    if (selectedItem) {
        return (
            <div className="container md-4 d-flex justify-content-center">
                <div style={{ maxWidth: "1000px", width: "100%" }}>
                    <button
                        className="btn btn-outline-secondary mb-3"
                        onClick={() => setSelectedItem(null)}
                    >
                        ← Back to Lost Items
                    </button>
                    <div className="card p-3 shadow-sm">
                        <div className="row g-0 align-items-center">
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
                                </div>
                                <span className="badge bg-danger mt-3 mb-2" style={{ fontSize: "1.1rem" }}>
                                    Lost
                                </span>
                            </div>
                            <div className="col-md-8 ps-md-4">
                                <h3>{selectedItem.title}</h3>
                                <p className="text-muted">
                                    Category: {capitalizeFirstLetter(selectedItem.category || "Uncategorized")}
                                </p>
                                <p>{selectedItem.description}</p>
                                <div className="mt-4 p-3 border rounded bg-light">
                                    <h5>Lost Details</h5>
                                    <p><strong>📍 Location:</strong> {selectedItem.location || "Not provided"}</p>
                                    <p><strong>📅 Date:</strong> {formatDate(selectedItem.dateLost)}</p>
                                    <p><strong>📧 Contact:</strong> {selectedItem.contact || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="lost-items-page" className="page">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="page-title">
                    <h2>Lost Items</h2>
                </div>
                <div className="search-box" style={{ maxWidth: "500px", width: "100%" }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            id="lost-search"
                            placeholder="Search lost items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleSearch}
                        >
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
                        <h5 className="mt-3 text-muted">Fetching lost items...</h5>
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
                <div className="row g-4" id="lost-items-container">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <ItemCard
                                key={item._id}
                                item={item}
                                showItemDetail={() => setSelectedItem(item)}
                            />
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h4 className="text-muted">No lost items found</h4>
                            <p className="text-secondary">Check back later or submit a lost item report</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LostItemsPage;