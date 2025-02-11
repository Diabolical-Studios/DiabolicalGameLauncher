import React from "react";
import {CircularProgress} from "@mui/material";

const Loader = () => {
    return (
        <div style={{

            width: "-webkit-fill-available",
            height: "-webkit-fill-available",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

        }}>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#444444"/>
                        <stop offset="100%" stopColor="#000"/>
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress sx={{"svg circle": {stroke: "url(#my_gradient)"}}}/>
        </div>
    );
};

export default Loader;
