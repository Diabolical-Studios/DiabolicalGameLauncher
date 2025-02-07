import React from "react";

const ImageButton = ({ text, imageSrc, onClick }) => {
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
            <p style={{margin: "0", fontSize: "14px", color: "#fff"}}>{text}</p>

            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={text}
                    style={{width: "16px", height: "16px", objectFit: "contain"}}
                />
            )}
        </button>
    );
};

export default ImageButton;
