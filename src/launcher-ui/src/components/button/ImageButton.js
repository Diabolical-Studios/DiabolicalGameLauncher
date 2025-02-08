import React from "react";
import { SvgIcon } from "@mui/material";

const ImageButton = ({ text, icon: IconComponent, onClick }) => {
    return (
        <button
            className="game-button shimmer-button"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                border: "none",
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            <p style={{ margin: "0", fontSize: "14px", color: "#fff", }}>{text.toUpperCase()}</p>

            {IconComponent && (
                <SvgIcon component={IconComponent} style={{ width: "24px", height: "24px", color: "#fff" }} />
            )}
        </button>
    );
};

export default ImageButton;
