import React from "react";
import Cookies from "js-cookie";
import {colors} from "../../theme/colors";

const LogoutButton = ({children, style = {}}) => {
    return (
        <button
            className="game-button shimmer-button rounded-sm cursor-pointer w-fit p-3 text-sm"
            onClick={() => {
                Cookies.remove("username");
                Cookies.remove("sessionID");
                Cookies.remove("githubID");
                window.location.reload();
            }}
            style={{
                color: colors.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...style
            }}
        >
            {children || "Logout"}
        </button>
    );
};

export default LogoutButton;
