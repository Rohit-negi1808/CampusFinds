import axios from 'axios';

const BASE_API_URL = "http://localhost:5000/api";

// --- API calls for Lost Items Management ---
export const getLostItems = async () => {
    try {
        const response = await axios.get(`${BASE_API_URL}/lost-items`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching lost items:", error);
        throw error;
    }
};

export const createLostItem = async (itemData) => {
    try {
        const response = await axios.post(`${BASE_API_URL}/lost-items`, itemData);
        return response.data; 
    } catch (error) {
        console.error("Error creating lost item:", error);
        throw error;
    }
};

export const updateLostItem = async (id, itemData) => {
    try {
        const response = await axios.put(`${BASE_API_URL}/lost-items/${id}`, itemData);
        return response.data; 
    } catch (error) {
        console.error("Error updating lost item:", error);
        throw error;
    }
};

export const deleteLostItem = async (id) => {
    try {
        const response = await axios.delete(`${BASE_API_URL}/lost-items/${id}`);
        return response.data; 
    } catch (error) {
        console.error("Error deleting lost item:", error);
        throw error;
    }
};

// --- API calls for Found Items Management ---
export const getFoundItems = async () => {
    try {
        const response = await axios.get(`${BASE_API_URL}/found-items`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching found items:", error);
        throw error;
    }
};

export const updateFoundItem = async (id, data) => {
    try {
        const response = await axios.put(`${BASE_API_URL}/found-items/${id}`, data);
        return response.data; 
    } catch (error) {
        console.error("Error updating found item:", error);
        throw error;
    }
};

export const deleteFoundItem = async (id) => {
    try {
        const response = await axios.delete(`${BASE_API_URL}/found-items/${id}`);
        return response.data; 
    } catch (error) {
        console.error("Error deleting found item:", error);
        throw error;
    }
};

// --- API calls for Claims Management (REQUIRED FOR STATS) ---
export const getClaims = async () => {
    try {
        // This must return ALL claims for accurate stats calculation
        const response = await axios.get(`${BASE_API_URL}/claims`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching claims:", error);
        throw error;
    }
};

export const updateClaim = async (id, data) => {
    try {
        const response = await axios.put(`${BASE_API_URL}/claims/${id}`, data);
        return response.data; 
    } catch (error) {
        console.error("Error updating claim:", error);
        throw error;
    }
};

// --- API calls for Users Management (REQUIRED FOR STATS) ---
export const getUsers = async () => {
    try {
        // This must return ALL users for accurate stats calculation
        const response = await axios.get(`${BASE_API_URL}/users`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const updateUserStatus = async (id, newStatus) => {
    try {
        // Assumes backend route: PUT /api/users/status/:id
        const response = await axios.put(`${BASE_API_URL}/users/status/${id}`, { status: newStatus });
        return response.data;
    } catch (error) {
        console.error(`Error updating user ${id} status:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        // Assumes backend route: DELETE /api/users/:id
        const response = await axios.delete(`${BASE_API_URL}/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        throw error;
    }
};

// --- API calls for Feedback/Contact (REQUIRED FOR STATS) ---
export const getFeedback = async () => {
    try {
        // This must return ALL feedback/contacts for accurate stats calculation
        const response = await axios.get(`${BASE_API_URL}/contact`); // Assuming /api/contact route
        return response.data; 
    } catch (error) {
        console.error("Error fetching feedback:", error);
        throw error;
    }
};