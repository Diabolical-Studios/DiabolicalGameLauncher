import React from "react";

const Layout = ({ children }) => {
    return (
        <div style={{ height: "100%", overflow: "hidden", }}>
            {children}
        </div>
    );
};

export default Layout;
