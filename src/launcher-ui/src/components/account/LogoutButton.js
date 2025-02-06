import React from "react";

const LogoutButton = () => {

    return (
        <button className="game-button shimmer-button"
                onClick={() => {
                    localStorage.removeItem("username");
                    localStorage.removeItem("sessionID");
                    window.dispatchEvent(new Event("storage")); // Notify UI of logout
                }}
                style={{
                    padding: "12px 24px",
                    fontSize: "14px",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    cursor: "pointer",
                    width: "fit-content",
                }}>
            Logout
        </button>
    );
};

export default LogoutButton;
