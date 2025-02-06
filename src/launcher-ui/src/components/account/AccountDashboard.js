import React from "react";
import Teams from "./Teams";

const AccountDashboard = ({ username }) => {
    const sessionID = localStorage.getItem("sessionID");

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
        }}>
            <h2>Welcome, <strong>{username}</strong>!</h2>
            <p>Your account is now synced.</p>

            {/* Render Teams Section */}
            <Teams sessionID={sessionID} />

            <button className="game-button shimmer-button"
                    onClick={() => {
                        localStorage.removeItem("username");
                        localStorage.removeItem("sessionID");
                        window.dispatchEvent(new Event("storage")); // Notify UI of logout
                    }}
                    style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        backgroundColor: "#d9534f",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}>
                Logout
            </button>
        </div>
    );
};

export default AccountDashboard;
