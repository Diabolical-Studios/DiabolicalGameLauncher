import React, { useState, useEffect } from "react";
import { SvgIcon } from "@mui/material";

const ImageButton = ({ text, icon: IconComponent, onClick, style = {} }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                ...style,
            }}
            onClick={onClick}
        >
            {/* Conditionally render the text */}
            <p
                style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#fff",
                    display: isMobile ? "none" : "block",
                }}
            >
                {text.toUpperCase()}
            </p>

            {/* Render the icon */}
            {IconComponent && (
                <SvgIcon component={IconComponent} style={{ width: "24px", height: "24px", color: "#fff" }} />
            )}
        </button>
    );
};

export default ImageButton;
