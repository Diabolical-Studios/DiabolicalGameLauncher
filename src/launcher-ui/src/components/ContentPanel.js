import React from "react";

const ContentPanel = ({children}) => {
    return (
        <div style={{
            flex: 1,
            height: "-webkit-fill-available",
            width: "-webkit-fill-available",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgb(48, 48, 48)",
            borderRadius: "2px",
            backdropFilter: "blur(10px)",
        }}>
            {children}
        </div>
    );
};

export default ContentPanel;
