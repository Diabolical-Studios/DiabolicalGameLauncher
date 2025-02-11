import React, { useEffect, useState } from "react";

const Grid = ({ children, gap = "12px", style = {} }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Use window resizing event to determine screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024); // Example: 1024px breakpoint for mobile
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Check size on component mount

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Dynamic inline styles based on screen size
    const gridStyles = {
        display: "grid",
        gridTemplateColumns: isMobile
            ? "repeat(1, minmax(100px, 1fr))" // Mobile layout
            : "repeat(auto-fit, minmax(250px, 1fr))", // Desktop layout
        gap: gap,
        width: "-webkit-fill-available",
        height: "-webkit-fill-available",
        margin: 0,
        overflowX: "hidden",
        overflowY: "scroll",
        ...style,
    };

    return <div style={gridStyles}>{children}</div>;
};

export default Grid;
