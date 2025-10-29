import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Spinner, Alert, InputGroup, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faTimes,
    faSearch,
    faSort,
    faSortUp,
    faSortDown,
    faExclamationTriangle,
    faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

// Assuming these are correct from your project
import { formatDate, getImageUrl, capitalizeFirstLetter } from '../../utils.js';
import { getClaims, updateClaim, getLostItems, getFoundItems } from '../../api/adminService.js';

export default function ClaimsVerification() {
    const [claims, setClaims] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for Modals/Alerts
    const [showConfirmModal, setShowConfirmModal] = useState(false); // For pre-update confirmation
    const [statusAction, setStatusAction] = useState({ id: null, status: '', name: '' });
    
    // State for the success toast (message and animation control)
    const [successMessage, setSuccessMessage] = useState(null); 
    const [isAnimating, setIsAnimating] = useState(false); // Controls the fade-out animation
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null); 
    const [isUpdating, setIsUpdating] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch claims and items concurrently
                const [claimsData, lostItemsData, foundItemsData] = await Promise.all([
                    getClaims(),
                    getLostItems(),
                    getFoundItems()
                ]);

                if (!Array.isArray(claimsData)) throw new Error("Invalid claims data");

                const allItems = [
                    ...(Array.isArray(lostItemsData) ? lostItemsData : []), 
                    ...(Array.isArray(foundItemsData) ? foundItemsData : [])
                ];

                setClaims(claimsData);
                setItems(allItems);
            } catch (err) {
                setError("Failed to load data. Please check server connection.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // **EFFECT: Auto-hide success message and handle upward animation**
    useEffect(() => {
        if (successMessage) {
            // 1. Start fade-out animation after 2.5 seconds (gives user time to read)
            const fadeOutTimer = setTimeout(() => {
                setIsAnimating(true);
            }, 2500);

            // 2. Remove the element from the DOM completely after the animation finishes (300ms + 2.5s)
            const disappearTimer = setTimeout(() => {
                setSuccessMessage(null);
                setIsAnimating(false);
            }, 2500 + 300); // 300ms is the duration of the CSS animation

            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(disappearTimer);
            };
        }
    }, [successMessage]);

    const updateClaimStatus = async (id, status) => {
        setIsUpdating(true);
        try {
            const updatedClaim = await updateClaim(id, { status });
            setClaims(prev => prev.map(c => (c._id === id ? updatedClaim : c)));
            
            // 1. Set the concise success message.
            setSuccessMessage("Status updated"); 
            
            // 2. Clear the selected claim (redirect to table view).
            setSelectedClaim(null); 
            
        } catch (err) {
            console.error(`Error updating claim status to ${status}:`, err);
            setError(`Failed to ${status} claim.`);
            setSuccessMessage(null); // Clear success message on failure
        } finally {
            setIsUpdating(false);
            setShowConfirmModal(false); // Close the confirmation modal
            setStatusAction({ id: null, status: '', name: '' });
        }
    };

    const handleStatusConfirm = () => {
        if (statusAction.id) {
            updateClaimStatus(statusAction.id, statusAction.status);
        }
    };

    const handleShowConfirmModal = (id, status, claimantName) => {
        setSuccessMessage(null); // Clear any old success message 
        setStatusAction({ id, status, name: claimantName });
        setShowConfirmModal(true);
    };

    const handleConfirmModalClose = () => {
        setShowConfirmModal(false);
        setStatusAction({ id: null, status: '', name: '' });
    };
    
    const getItemDetails = (itemId) => {
        // This function is still used to display details of an existing item
        const item = items.find(i => i._id === itemId);
        return item || { title: `Item ID: ${itemId}`, description: "N/A", location: "N/A", imageUrl: null };
    };

    const sortedClaims = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        // ⭐ CORE LOGIC CHANGE: Create a set of valid item IDs first ⭐
        const validItemIds = new Set(items.map(item => item._id));

        let sortableClaims = claims.filter(claim =>
            // 1. Filter out claims whose item is no longer in the combined items list
            validItemIds.has(claim.itemId) &&
            
            // 2. Apply existing search filters
            (
                claim.claimantName?.toLowerCase().includes(lowerCaseSearchTerm) ||
                claim.message?.toLowerCase().includes(lowerCaseSearchTerm) ||
                getItemDetails(claim.itemId)?.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                claim._id?.toLowerCase().includes(lowerCaseSearchTerm)
            )
        );

        // Apply sorting logic
        if (sortConfig.key !== null) {
            sortableClaims.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'itemName') {
                    aValue = getItemDetails(a.itemId)?.title;
                    bValue = getItemDetails(b.itemId)?.title;
                } else if (sortConfig.key === 'dateClaimed') {
                    aValue = new Date(a.dateClaimed).getTime();
                    bValue = new Date(b.dateClaimed).getTime();
                } else if (sortConfig.key === '_id') {
                    aValue = String(a._id);
                    bValue = String(b._id);
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableClaims;
    }, [claims, searchTerm, items, sortConfig]); // Depend on `items`

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return faSort;
        }
        return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return <span className="badge bg-success rounded-pill fw-normal">Approved</span>;
            case "rejected":
                return <span className="badge bg-danger rounded-pill fw-normal">Rejected</span>;
            case "pending":
            default:
                return <span className="badge bg-warning text-dark rounded-pill fw-normal">Pending</span>;
        }
    };

    // --- LOADING UI ---
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">Loading claims...</p>
            </div>
        );
    }

    // --- DETAILED CLAIM VIEW UI ---
    if (selectedClaim) {
        const itemDetails = getItemDetails(selectedClaim.itemId);
        // Safety check: if itemDetails is just a placeholder, redirect back
        if (!items.find(i => i._id === selectedClaim.itemId)) {
             setSelectedClaim(null);
             setError("The item associated with this claim has been deleted.");
             return null; // Don't render the detailed view
        }

        return (
            <div className="container my-4 d-flex justify-content-center">
                <div style={{ maxWidth: "1000px", width: "100%" }}>
                    <button
                        className="btn btn-outline-secondary mb-3 btn-sm"
                        onClick={() => setSelectedClaim(null)}
                    >
                        ← Back to Claims List
                    </button>

                    <div className="card p-4 shadow-sm">
                        <h3 className="fw-bold mb-4">Claim Details for {itemDetails.title}</h3>

                        <div className="row g-0 align-items-start">
                            {/* Left column - Item Info */}
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
                                    {itemDetails.imageUrl ? (
                                        <img
                                            src={getImageUrl(itemDetails.imageUrl)}
                                            alt={itemDetails.title}
                                            className="img-fluid"
                                            style={{
                                                width: "100%",
                                                maxHeight: "210px",
                                                objectFit: "cover",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    ) : (
                                        <span className="text-muted">No Image</span>
                                    )}
                                </div>

                                <span className="mt-3 mb-2" style={{ fontSize: "1.1rem" }}>
                                    {getStatusBadge(selectedClaim.status)}
                                </span>

                                <div className="mt-3 text-center">
                                    <p><strong>Item Name:</strong> {itemDetails.title}</p>
                                    <p><strong>Description:</strong> {itemDetails.description}</p>
                                    <p><strong>Location:</strong> {itemDetails.location}</p>
                                </div>
                            </div>

                            {/* Right column - Claim Info */}
                            <div className="col-md-8 ps-md-4">
                                <h5 className="mb-3">Claimant Information</h5>
                                <p><strong>👤 Claimant:</strong> {selectedClaim.claimantName}</p>
                                <p><strong>📧 Contact:</strong> {selectedClaim.contact}</p>
                                <p><strong>📝 Claim Message:</strong> {selectedClaim.message}</p>
                                <p><strong>📅 Submitted On:</strong> {new Date(selectedClaim.dateClaimed).toLocaleDateString()}</p>

                                <div className="mt-4 p-3 border rounded bg-light">
                                    <h6 className="fw-bold">Manage Claim</h6>
                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleShowConfirmModal(selectedClaim._id, "approved", selectedClaim.claimantName)}
                                            disabled={selectedClaim.status?.toLowerCase() === "approved" || isUpdating}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="me-2" /> Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleShowConfirmModal(selectedClaim._id, "rejected", selectedClaim.claimantName)}
                                            disabled={selectedClaim.status?.toLowerCase() === "rejected" || isUpdating}
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="me-2" /> Reject
                                        </Button>
                                        {isUpdating && <Spinner animation="border" size="sm" variant="primary" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* -------------------------------------------------- */}
                    {/* CONFIRMATION MODAL */}
                    {/* -------------------------------------------------- */}
                    <Modal
                        show={showConfirmModal}
                        onHide={handleConfirmModalClose}
                        dialogClassName="admin-delete-modal-sm"
                    >
                        <style type="text/css">
                            {`
                                .admin-delete-modal-sm {
                                    max-width: 678px;
                                    margin: 30px auto; 
                                }
                                .admin-delete-modal-sm .modal-dialog {
                                    top: 50px; 
                                    transform: none !important; 
                                    align-items: flex-start;
                                }
                            `}
                        </style>
                        <Modal.Header
                            closeButton
                            className={statusAction.status === 'approved' ? "bg-success text-white border-0 py-2" : "bg-danger text-white border-0 py-2"}
                        >
                            <Modal.Title className="h6 mb-0">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Action Confirmation
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="py-3 px-3">
                            <h6 className={`mb-2 ${statusAction.status === 'approved' ? 'text-success' : 'text-danger'} fw-semibold`}>
                                {capitalizeFirstLetter(statusAction.status)} Claim: "{statusAction.name}"?
                            </h6>
                            <p className="small mb-2">
                                You are about to **{statusAction.status.toUpperCase()}** the claim from <strong className="text-dark">"{statusAction.name}"</strong> 
                                for item ID: <strong className="text-dark">#{statusAction.id?.slice(-4)}</strong>.
                                <br />
                                Please confirm you wish to proceed with this status change.
                            </p>
                            <Alert variant={statusAction.status === 'approved' ? 'info' : 'warning'} className="small py-1 px-2 mt-2 mb-0">
                                <strong className="fw-bold">Review:</strong> Ensure all verification steps are complete before finalizing the claim status.
                            </Alert>
                        </Modal.Body>
                        <Modal.Footer className="py-2">
                            <Button variant="outline-secondary" size="sm" onClick={handleConfirmModalClose}>
                                Cancel
                            </Button>
                            <Button
                                variant={statusAction.status === 'approved' ? 'success' : 'danger'}
                                size="sm"
                                onClick={handleStatusConfirm}
                                disabled={isUpdating}
                            >
                                <FontAwesomeIcon icon={statusAction.status === 'approved' ? faCheck : faTimes} className="me-1" />
                                {isUpdating ? 'Processing...' : `Confirm ${capitalizeFirstLetter(statusAction.status)}`}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </div>
            </div>
        );
    }

    // --- MAIN TABLE VIEW UI (Styled) ---
    return (
        <div className="container py-4">
            {/* ⭐ CUSTOM CSS FOR TOAST ANIMATION ⭐ */}
            <style jsx global>{`
                /* Container to center and fix position */
                .custom-toast-container {
                    position: fixed;
                    top: 20px; /* Position from top */
                    left: 50%;
                    transform: translateX(-50%); /* Center horizontally */
                    z-index: 2000; 
                    pointer-events: none; /* Ignore clicks on the container */
                    max-width: 450px; /* Adjusted size */
                }

                /* Styling for the Alert */
                .custom-toast {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                    transform: translateY(0);
                    transition: all 0.3s ease-in-out;
                    pointer-events: auto; /* Allow clicks on the visible Alert */
                }

                /* Class applied to start the upward movement and fade out */
                .toast-animate-out {
                    opacity: 0;
                    transform: translateY(-150%); /* Move far up */
                }
            `}</style>

            {/* Title and Search Bar Wrapper (Styled) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-semibold">Claims & Verification</h3> 
                <InputGroup style={{ maxWidth: '350px' }}> 
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Search claims..."
                        aria-label="Search"
                        className="border-start-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            
            {/* ⭐ TOAST MESSAGE WRAPPER ⭐ */}
            {successMessage && (
                <div className="custom-toast-container">
                    <Alert 
                        variant="success" 
                        // The isAnimating class controls the upward animation and fade-out
                        className={`custom-toast ${isAnimating ? 'toast-animate-out' : ''}`}
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        <strong className="fw-semibold">{successMessage}</strong>
                    </Alert>
                </div>
            )}


            {/* Main Content Card (Styled) */}
            <div className="card shadow-sm border-light rounded-2">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="table-secondary"> 
                                <tr>
                                    <th scope="col" onClick={() => requestSort('_id')} style={{ cursor: 'pointer' }} className="py-3 ps-4">
                                        Claim ID <FontAwesomeIcon icon={getSortIcon('_id')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('claimantName')} style={{ cursor: 'pointer' }} className="py-3">
                                        Claimant <FontAwesomeIcon icon={getSortIcon('claimantName')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('itemName')} style={{ cursor: 'pointer' }} className="py-3">
                                        Claimed Item <FontAwesomeIcon icon={getSortIcon('itemName')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('dateClaimed')} style={{ cursor: 'pointer' }} className="py-3">
                                        Submitted At <FontAwesomeIcon icon={getSortIcon('dateClaimed')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('status')} style={{ cursor: 'pointer' }} className="py-3 pe-4">
                                        Status <FontAwesomeIcon icon={getSortIcon('status')} className="ms-2 small" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedClaims.length > 0 ? (
                                    sortedClaims.map((c) => (
                                        <tr 
                                            key={c._id} 
                                            onClick={() => setSelectedClaim(c)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <th scope="row" className="text-muted ps-4 small">#{c._id.slice(-4)}</th>
                                            <td><div className="fw-medium">{c.claimantName}</div></td>
                                            <td>
                                                <div className="fw-medium">{getItemDetails(c.itemId).title}</div>
                                                <div className="text-secondary small">ID: #{c.itemId.slice(-4)}</div>
                                            </td>
                                            <td>{new Date(c.dateClaimed).toLocaleDateString()}</td>
                                            <td className="pe-4">{getStatusBadge(c.status)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-secondary py-4">No pending claims found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}