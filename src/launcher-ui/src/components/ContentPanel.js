import React from "react";

const ContentPanel = ({ children }) => {
    return (
        <div style={{
            flex: 1,
            height: "auto",
            width: "100px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            border: "1px solid rgb(48, 48, 48)",
            borderRadius: "2px",
            backdropFilter: "blur(10px)",
        }}>
            {children}
        </div>
    );
};

export default ContentPanel;
