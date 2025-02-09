import React, { useState, useEffect } from "react";
import { SvgIcon } from "@mui/material";

const ImageButton = ({ text, icon: IconComponent, onClick }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Adjust the breakpoint for mobile
        };

        handleResize(); // Check on initial load
        window.addEventListener("resize", handleResize); // Update on resize

        return () => window.removeEventListener("resize", handleResize); // Cleanup event listener
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
            }}
            onClick={onClick}
        >
            {/* Conditionally render the text */}
            <p
                style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#fff",
                    display: isMobile ? "none" : "block", // Hide text on mobile screens
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
