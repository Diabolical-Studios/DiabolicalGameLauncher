import React from "react";
import Cookies from "js-cookie";

const LogoutButton = () => {
    return (
        <button className="game-button shimmer-button"
                onClick={() => {
                    Cookies.remove("username");
                    Cookies.remove("sessionID");

                    window.location.reload();
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
