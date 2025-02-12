import React from "react";
import {colors} from "../theme/colors";

const ContentPanel = ({children}) => {
    return (
        <div style={{
            flex: 1,
            height: "-webkit-fill-available",
            width: "-webkit-fill-available",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid" + colors.border,
            borderRadius: "2px",
            backdropFilter: "blur(10px)",
        }}>
            {children}
        </div>
    );
};

export default ContentPanel;
