import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, InputGroup, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCheckCircle, 
    faTrashAlt, 
    faEdit, 
    faSearch, 
    faSort, 
    faSortUp, 
    faSortDown, 
    faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";

// Import API service for found items (assuming paths are correct)
import { getFoundItems, updateFoundItem, deleteFoundItem } from '../../api/adminService.js';

export default function FoundItemsManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // State for Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    // State for success message & animation
    const [successMessage, setSuccessMessage] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        fetchFoundItems();
    }, []);

    // EFFECT: Manages Auto-dismiss and continuous upward animation
    useEffect(() => {
        if (successMessage) {
            const fadeOutTimer = setTimeout(() => {
                setIsAnimating(true);
            }, 2500);

            const disappearTimer = setTimeout(() => {
                setSuccessMessage(null);
                setIsAnimating(false);
            }, 2500 + 300);

            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(disappearTimer);
            };
        }
    }, [successMessage]);

    const fetchFoundItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFoundItems();
            setItems(data);
        } catch (err) {
            setError("Failed to load found items. Please check server connection.");
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (id, updatedData) => {
        try {
            await updateFoundItem(id, updatedData);
            setItems(prev => prev.map(item => (item._id === id ? { ...item, ...updatedData } : item)));
            setError(null);
            
            // SET SUCCESS MESSAGE FOR EDITING
            setSuccessMessage("Item updated");

        } catch (err) {
            console.error("Failed to update item:", err);
            setError("Failed to update item.");
            setSuccessMessage(null);
        }
    };

    const deleteItem = async (id) => {
        try {
            await deleteFoundItem(id);
            setItems(prev => prev.filter(item => item._id !== id));
            setError(null);

            // SET SUCCESS MESSAGE FOR DELETION
            setSuccessMessage("Item deleted");

        } catch (err) {
            console.error("Failed to delete item:", err);
            setError("Failed to delete item.");
            setSuccessMessage(null);
        }
    };

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

    const sortedAndFilteredItems = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let sortableItems = items.filter(item =>
            item.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.location?.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === '_id') {
                    aValue = String(aValue);
                    bValue = String(bValue);
                }

                if (sortConfig.key === 'dateFound') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
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

        return sortableItems;

    }, [items, searchTerm, sortConfig]);

    // Modal handlers (Logic remains the same)
    const handleShowDeleteModal = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };
    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            deleteItem(itemToDelete._id);
        }
        setShowDeleteModal(false);
        setItemToDelete(null);
    };
    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const handleShowEditModal = (item) => {
        setItemToEdit({
            ...item,
            dateFound: item.dateFound ? new Date(item.dateFound).toISOString().split('T')[0] : '',
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setItemToEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = () => {
        if (itemToEdit) {
            updateItem(itemToEdit._id, itemToEdit);
        }
        setShowEditModal(false);
        setItemToEdit(null);
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "found":
                return <span className="badge bg-primary rounded-pill fw-normal">Found</span>;
            case "found and submitted":
                // Using Success green for 'Submitted' to signify a completed action
                return <span className="badge bg-success rounded-pill fw-normal">Submitted</span>; 
            default:
                return <span className="badge bg-secondary rounded-pill fw-normal">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">Loading items...</p>
            </div>
        );
    }

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
            
            {/* Title and Search Bar Wrapper */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-semibold">Found Items Management</h3>
                <InputGroup style={{ maxWidth: '350px' }}>
                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Search items..."
                        aria-label="Search"
                        className="border-start-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Main Content Card with professional shadow and border radius */}
            <div className="card shadow-sm border-light rounded-2">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="table-secondary">
                                <tr>
                                    <th scope="col" onClick={() => requestSort('_id')} style={{ cursor: 'pointer' }} className="py-3 ps-4">
                                        ID <FontAwesomeIcon icon={getSortIcon('_id')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('title')} style={{ cursor: 'pointer' }} className="py-3">
                                        Item <FontAwesomeIcon icon={getSortIcon('title')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('location')} style={{ cursor: 'pointer' }} className="py-3">
                                        Location <FontAwesomeIcon icon={getSortIcon('location')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('dateFound')} style={{ cursor: 'pointer' }} className="py-3">
                                        Found Date<FontAwesomeIcon icon={getSortIcon('dateFound')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" onClick={() => requestSort('status')} style={{ cursor: 'pointer' }} className="py-3">
                                        Status <FontAwesomeIcon icon={getSortIcon('status')} className="ms-2 small" />
                                    </th>
                                    <th scope="col" className="py-3 pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredItems.length > 0 ? (
                                    sortedAndFilteredItems.map((it) => (
                                        <tr key={it._id}>
                                            <th scope="row" className="text-muted ps-4 small">#{it._id.slice(-4)}</th>
                                            <td>
                                                <div className="fw-medium">{it.title}</div>
                                                <div className="text-secondary small text-truncate" style={{ maxWidth: '250px' }}>{it.description}</div>
                                            </td>
                                            <td>{it.location}</td>
                                            <td>{it.dateFound ? new Date(it.dateFound).toLocaleDateString() : 'N/A'}</td>
                                            <td>{getStatusBadge(it.status)}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => handleShowEditModal(it)}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleShowDeleteModal(it)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-secondary py-4">No found items match the current search criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal 
                show={showDeleteModal} 
                onHide={handleDeleteCancel} 
                dialogClassName="admin-delete-modal-sm"
            >
                <style type="text/css">
                    {`
                        /* Adjusted Max-Width for a Smaller Modal */
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
                    className="bg-danger text-white border-0 py-2"
                >
                    <Modal.Title className="h6 mb-0">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Action Required
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3 px-3">
                    <h6 className="mb-2 text-danger fw-semibold">Permanently Delete Item?</h6>
                    <p className="small mb-2">
                        You are about to delete the found item: <strong className="text-dark">"{itemToDelete?.title}" (ID: #{itemToDelete?._id?.slice(-4)})</strong>. 
                        <br/>
                        This action *cannot be reversed* and all associated data will be lost. Please confirm you wish to proceed.
                    </p>
                    <Alert variant="warning" className="small py-1 px-2 mt-2 mb-0">
                        <strong className="fw-bold">Security Warning:</strong> Ensure no active claims are tied to this item before deleting.
                    </Alert>
                </Modal.Body>
                <Modal.Footer className="py-2">
                    <Button variant="outline-secondary" size="sm" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                        <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Yes, Delete Item
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* EDIT ITEM MODAL */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Found Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {itemToEdit && (
                        <Form>
                            <Form.Group className="mb-2" controlId="editTitle">
                                <Form.Label className="small mb-1">Title</Form.Label>
                                <Form.Control size="sm" name="title" value={itemToEdit.title} onChange={handleEditChange} />
                            </Form.Group>
                            <Form.Group className="mb-2" controlId="editDescription">
                                <Form.Label className="small mb-1">Description</Form.Label>
                                <Form.Control size="sm" as="textarea" rows={2} name="description" value={itemToEdit.description} onChange={handleEditChange} />
                            </Form.Group>
                            <Form.Group className="mb-2" controlId="editLocation">
                                <Form.Label className="small mb-1">Location</Form.Label>
                                <Form.Control size="sm" name="location" value={itemToEdit.location} onChange={handleEditChange} />
                            </Form.Group>
                            <Form.Group className="mb-2" controlId="editDateFound">
                                <Form.Label className="small mb-1">Date Found</Form.Label>
                                <Form.Control size="sm" type="date" name="dateFound" value={itemToEdit.dateFound} onChange={handleEditChange} />
                            </Form.Group>
                            <Form.Group className="mb-2" controlId="editContact">
                                <Form.Label className="small mb-1">Contact</Form.Label>
                                <Form.Control size="sm" name="contact" value={itemToEdit.contact} onChange={handleEditChange} />
                            </Form.Group>
                            
                            {/* ⭐ UPDATED STATUS FIELD ACCORDING TO SCHEMA ⭐ */}
                            <Form.Group className="mb-2" controlId="editStatus">
                                <Form.Label className="small mb-1">Status</Form.Label>
                                <Form.Select size="sm" name="status" value={itemToEdit.status} onChange={handleEditChange}>
                                    <option value="Found">Found</option>
                                    <option value="Found and Submitted">Found and Submitted</option>
                                    {/* Removed 'pending' and 'claimed' options */}
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" size="sm" onClick={() => setShowEditModal(false)}>Close</Button>
                    <Button variant="primary" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}