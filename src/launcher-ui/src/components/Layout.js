import React from "react";

const Layout = ({ children }) => {
    return (
        <div style={{
            textAlign: "center",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            justifyContent: "center",
            width: "-webkit-fill-available",
            height: "-webkit-fill-available"
        }}>
            {children}
        </div>
    );
};

export default Layout;
