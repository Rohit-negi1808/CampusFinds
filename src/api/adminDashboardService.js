// /src/api/adminDashboardService.js

import axios from "axios";
// Import necessary general fetch functions from adminService
import { 
    getLostItems, 
    getFoundItems, 
    getClaims, 
    getUsers, 
    getFeedback 
} from "./adminService"; 

const BASE_API_URL = "http://localhost:5000/api";

// --- Dashboard Stats (Calculated on the Client) ---
export const getStats = async () => {
    try {
        const [lostItems, foundItems, allClaims, users, feedback] = await Promise.all([
            getLostItems(),
            getFoundItems(),
            getClaims(), 
            getUsers(), 
            getFeedback(), 
        ]);

        // --- 1. CLAIM STATS (Kept as is from previous fix) ---
        const totalClaims = allClaims.length;
        const pendingClaims = allClaims.filter(
            // Handles both 'pending' and 'waiting' (case-insensitive)
            (claim) => claim.status && 
                       (claim.status.toLowerCase() === 'pending' || claim.status.toLowerCase() === 'waiting')
        ).length;

        // --- 2. FEEDBACK/CONTACT STATS (MINIMAL CHANGE 2: Update filter) ---
        const totalContacts = feedback.length;
        
        // ** FIX: Filter specifically for status === 'pending' **
        const pendingFeedbacks = feedback.filter(
            // Changed 'open' to 'pending' to match the updated model default
            (f) => f.status && f.status.toLowerCase() === 'pending' 
        ).length;
        
        // --- 3. Final Stats Object ---
        return {
            totalLost: lostItems.length,
            totalFound: foundItems.length,
            totalClaims: totalClaims,
            pendingClaims: pendingClaims, 
            totalUsers: users.length,
            totalContacts: totalContacts,
            pendingFeedbacks: pendingFeedbacks, 
        };

    } catch (error) {
        console.error("Error fetching and calculating dashboard stats:", error);
        return {
            totalLost: 0, totalFound: 0, totalClaims: 0, pendingClaims: 0, totalUsers: 0, totalContacts: 0, pendingFeedbacks: 0
        };
    }
};

// --- Recent Lost Items ---
export const getRecentLostItems = async () => {
    const allLostItems = await getLostItems(); 
    return allLostItems
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 7);
};

// --- Recent Found Items ---
export const getRecentFoundItems = async () => {
    const allFoundItems = await getFoundItems();
    return allFoundItems
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 7);
};

// --- Recent Claims ---
export const getRecentClaims = async () => {
    const allClaims = await getClaims();
    return allClaims
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 7);
};