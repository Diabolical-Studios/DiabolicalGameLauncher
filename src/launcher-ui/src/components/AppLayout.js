import React from "react";

const AppLayout = ({children}) => {
    return (
        <div style={{
            overflow: "hidden", display: "flex",
            flexDirection: "row",
            width: "-webkit-fill-available",
            height: "-webkit-fill-available",
            padding: "12px",
            gap: "12px",
        }}>
            {children}
        </div>
    );
};

export default AppLayout;
