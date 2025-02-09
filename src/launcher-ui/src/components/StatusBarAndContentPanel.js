import React from "react";

const StatusBarAndContentPanel = ({children}) => {
    return (
        <div style={{
            width: "-webkit-fill-available",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
        }}>
            {children}
        </div>
    );
};

export default StatusBarAndContentPanel;
