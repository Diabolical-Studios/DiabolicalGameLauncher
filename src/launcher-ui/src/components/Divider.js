import React from "react";
import {colors} from "../theme/colors";

const Divider = ({vertical = false, thickness = "1px", color = colors.border, length = "100%"}) => {
    const style = {
        backgroundColor: color, minWidth: vertical ? thickness : length, minHeight: vertical ? length : thickness,
    };

    return <div style={style}></div>;
};

export default Divider;
