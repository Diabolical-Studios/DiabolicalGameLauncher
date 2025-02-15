import React, {useEffect, useState} from "react";
import clsx from "clsx";

const Grid = ({children, gap = "12px", className = "", style = {}}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className={clsx(
                "grid w-full h-full m-0",
                isMobile ? "grid-cols-1 min-[100px]:min-w-[100px]" : "grid-cols-auto-fit min-[250px]:min-w-[250px]",
                className
            )}
            style={{gap, ...style}}
        >
            {children}
        </div>
    );
};

export default Grid;
