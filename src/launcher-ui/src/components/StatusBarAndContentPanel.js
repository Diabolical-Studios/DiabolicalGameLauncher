import React from "react";

const StatusBarAndContentPanel = ({children}) => {
    return (
        <div style={{
            width: "-webkit-fill-available",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
        }}>
            {children}
        </div>
    );
};

export default StatusBarAndContentPanel;
