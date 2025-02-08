import React from "react";

const Grid = ({children, gap = "12px", style = {}}) => {
    return (<div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Responsive grid
            gap: gap,
            width: "-webkit-fill-available",
            height: "-webkit-fill-available",
            margin: 0,
            overflowX: "hidden",
            overflowY: "scroll",

            ...style
        }}>
            {children}
        </div>);
};

export default Grid;
