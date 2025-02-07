import React from "react";

const HorizontalFlex = ({children}) => {
    return (
        <div style={{
            display: "flex", flexDirection: "row", justifyContent: "space-between",
        }}>
            {children}
        </div>
    );
};

export default HorizontalFlex;
