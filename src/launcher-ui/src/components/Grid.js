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

            padding: "12px",
            overscrollBehavior: "contain",
            scrollSnapType: "x mandatory",
            scrollSnapAlign: "start",
            scrollbarWidth: "thin",
            scrollbarColor: "#1f1e1e transparent",

            ...style
        }}>
            {children}
        </div>);
};

export default Grid;
