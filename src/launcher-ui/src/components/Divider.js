import React from "react";

const Divider = ({ vertical = false, thickness = "1px", color = "#444444", length = "100%" }) => {
    const style = {
        backgroundColor: color,
        minWidth: vertical ? thickness : length,
        minHeight: vertical ? length : thickness,
    };

    return <div style={style}></div>;
};

export default Divider;
