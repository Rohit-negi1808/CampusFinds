// src/AppRouter.jsx
import React, { useState } from "react";
import AppUser from "../pages/user/AppUser.jsx";
import AdminApp from "../pages/admin/AdminApp.jsx";
import RegisterPage from "../pages/login/RegisterPage.jsx";
import LoginPage from "../pages/login/LoginPage.jsx";

function AppRouter() {
  const [role, setRole] = useState(null);
  const [loginType, setLoginType] = useState("user");
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSetCurrentUser = (user, roleType) => {
    setCurrentUser(user);
    setRole(roleType);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole(null);
    setLoginType("user");
    setShowRegister(false);
    setEmail("");
    setPassword("");
    setErrorMessage(null);
  };

  // ==========================================================
  // 🔐 LOGIN HANDLER: Handles both Admin & User Login
  // ==========================================================
  const handleLogin = async () => {
    setErrorMessage(null);

    try {
      const endpoint =
        loginType === "admin"
          ? "http://localhost:5000/api/admin/login"
          : "http://localhost:5000/api/users/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // For users: validate account status
      if (loginType === "user" && data.user) {
        const userStatus = data.user.status || "pending";

        if (userStatus === "suspended") {
          setErrorMessage(
            "🚫 Account Suspended: Please contact Student Care for assistance."
          );
          return;
        }
        if (userStatus !== "active") {
          setErrorMessage(`Login Failed: Your account status is '${userStatus}'.`);
          return;
        }

        handleSetCurrentUser(data.user, "user");
      } else if (loginType === "admin" && data.admin) {
        handleSetCurrentUser(data.admin, "admin");
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (err) {
      setErrorMessage(`Login Error: ${err.message}`);
    }
  };

  // ==========================================================
  // CONDITIONAL RENDERING
  // ==========================================================
  if (role === "admin") return <AdminApp onLogout={handleLogout} />;
  if (role === "user" && currentUser) return <AppUser currentUser={currentUser} onLogout={handleLogout} />;

  // ==========================================================
  // DEFAULT LOGIN / REGISTER VIEW
  // ==========================================================
  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#f4f7f9" }}
    >
      <div
        className="card shadow-xl rounded-4 p-4"
        style={{ width: "400px", border: "1px solid #e0e0e0" }}
      >
        {/* Error Banner */}
        {errorMessage && (
          <div
            className="alert alert-danger p-3 mb-4 rounded-3 d-flex align-items-center"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <div>
              <small className="fw-semibold">{errorMessage}</small>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={() => setErrorMessage(null)}
            ></button>
          </div>
        )}

        {/* Header */}
        {!showRegister && (
          <h3
            className="text-center mb-4"
            style={{ color: "#2c3e50", fontWeight: "700" }}
          >
            Welcome to CampusFinds
          </h3>
        )}

        {/* User/Admin Toggle */}
        {!showRegister && (
          <div
            className="btn-group w-100 mb-4 shadow-sm rounded-pill overflow-hidden"
            role="group"
          >
            <button
              className={`btn fw-semibold ${
                loginType === "user" ? "btn-primary" : "btn-light text-muted"
              }`}
              onClick={() => setLoginType("user")}
            >
              👤 Student
            </button>
            <button
              className={`btn fw-semibold ${
                loginType === "admin" ? "btn-success" : "btn-light text-muted"
              }`}
              onClick={() => setLoginType("admin")}
            >
              🛠️ Admin
            </button>
          </div>
        )}

        {/* Auth Form */}
        {showRegister ? (
          <RegisterPage showPage={(page) => page === "login" && setShowRegister(false)} />
        ) : (
          <LoginPage
            handleLogin={handleLogin}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loginType={loginType}
            setShowRegister={setShowRegister}
          />
        )}
      </div>
    </div>
  );
}

export default AppRouter;
