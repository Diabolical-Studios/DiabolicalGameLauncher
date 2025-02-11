import React, { useEffect, useState } from "react";

const Grid = ({ children, gap = "12px", style = {} }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024); 
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const gridStyles = {
        display: "grid",
        gridTemplateColumns: isMobile
            ? "repeat(1, minmax(100px, 1fr))"
            : "repeat(auto-fit, minmax(250px, 1fr))",
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
