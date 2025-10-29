import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// 🌟 CORRECTED IMPORTS: getUsers, updateUserStatus, deleteUser
import { getUsers, updateUserStatus, deleteUser } from "../../api/adminService"; 

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // NOTE: Assuming your main admin account has ID 1. Adjust if necessary.
  const mainAdminId = 1; 

  // --- Data Fetching Effect ---
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // 🌟 Using the correct API function
        const data = await getUsers(); 
        // NOTE: In a real app, ensure your backend provides the 'id' and 'role' fields
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]); 
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // --- Utility Functions ---

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success rounded-pill fw-normal">Active</span>;
      case "suspended":
        return <span className="badge bg-warning text-dark rounded-pill fw-normal">Suspended</span>;
      default:
        return <span className="badge bg-secondary rounded-pill fw-normal">{status}</span>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className="badge bg-dark rounded-pill fw-semibold">ADMIN</span>;
      case "user":
        return <span className="badge bg-primary rounded-pill fw-normal">User</span>;
      default:
        return <span className="badge bg-secondary rounded-pill fw-normal">{role}</span>;
    }
  };

  // --- Action Handlers ---

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    if (id === mainAdminId) return alert("Cannot suspend/activate the main administrator account.");
    
    const originalStatus = currentStatus;
    
    try {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        
        // 🌟 Calling the correct API function
        await updateUserStatus(id, newStatus); 
        
    } catch (error) {
        console.error(`Failed to update user ${id} status:`, error);
        // Revert the state if API call failed
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: originalStatus } : u));
        alert("Failed to update user status on the server.");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === mainAdminId) return alert("Cannot delete the main administrator account.");

    if (window.confirm(`Are you sure you want to permanently delete user: ${name}?`)) {
      try {
        setUsers(prev => prev.filter(u => u.id !== id));
        
        // 🌟 Calling the correct API function
        await deleteUser(id); 
        
      } catch (error) {
        console.error(`Failed to delete user ${id}:`, error);
        alert("Failed to delete user on the server.");
        // A re-fetch or manual restoration would be needed here on failure
      }
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Fetching user data...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bolder">Users Management 🧑‍💻</h2>

      <div className="card shadow-lg border-0 rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="p-3 fw-semibold text-uppercase small">ID</th>
                  <th className="p-3 fw-semibold text-uppercase small">Name</th>
                  <th className="p-3 fw-semibold text-uppercase small">Email</th>
                  <th className="p-3 fw-semibold text-uppercase small">Role</th>
                  <th className="p-3 fw-semibold text-uppercase small">Status</th>
                  <th className="p-3 fw-semibold text-uppercase small text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center p-5 text-muted">No users found.</td>
                    </tr>
                ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        {/* NOTE: If using MongoDB, use u._id instead of u.id for display */}
                        <td className="p-3 small text-muted">#{u.id}</td> 
                        <td className="p-3 fw-bold">{u.name}</td>
                        <td className="p-3 text-muted">{u.email}</td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                        <td className="p-3">{getStatusBadge(u.status)}</td>
                        
                        <td className="p-3 text-center">
                          {u.id === mainAdminId ? (
                            <span className="text-danger small fw-bold">SYSTEM ADMIN</span>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleToggleStatus(u.id, u.status)} 
                                className={`btn btn-sm me-2 ${u.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id, u.name)} 
                                className="btn btn-sm btn-outline-danger"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}