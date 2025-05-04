import React from "react";
import {colors} from "../theme/colors";
import {Zoom} from "@mui/material";

const ContentPanel = ({children}) => {
    return (
        <Zoom
            in={true}
            timeout={400}
            style={{
                transitionDelay: '100ms'
            }}
        >
            <div
                className={"flex flex-col overflow-hidden h-full w-full border rounded-sm backdrop-blur"}
                style={{
                    borderColor: colors.border
                }}
            >
                {children}
            </div>
        </Zoom>
    );
};

export default ContentPanel;
