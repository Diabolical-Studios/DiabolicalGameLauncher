import React from "react";
import {SvgIcon} from "@mui/material";

const OnlyImageButton = ({icon: IconComponent, onClick, style = {}}) => {
    return (<button
            className="game-button shimmer-button"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                padding: "6px",
                border: "none",
                cursor: "pointer",
                width: "fit-content",
                height: "fit-content",
                margin: 0,
                ...style,
                
            }}
            onClick={onClick}
        >

            {IconComponent && (
                <SvgIcon component={IconComponent} style={{width: "24px", height: "24px", color: "#fff"}}/>)}
        </button>);
};

export default OnlyImageButton;
