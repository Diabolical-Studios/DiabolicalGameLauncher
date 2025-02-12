import React from "react";
import Cookies from "js-cookie";
import {colors} from "../../theme/colors";

const LogoutButton = () => {
    return (
        <button className="game-button shimmer-button"
                onClick={() => {
                    Cookies.remove("username");
                    Cookies.remove("sessionID");
                    Cookies.remove("githubInstallationId");
                    Cookies.remove("githubAccessToken");

                    window.location.reload();
                }}
                style={{
                    padding: "12px 24px",
                    fontSize: "14px",
                    color: colors.text,
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
