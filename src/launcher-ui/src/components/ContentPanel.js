import React from "react";
import {colors} from "../theme/colors";

const ContentPanel = ({children}) => {
    return (<div className={"flex flex-col overflow-hidden h-full w-full border rounded-xs backdrop-blur"} style={{
        borderColor: colors.border,
    }}>
        {children}
    </div>);
};

export default ContentPanel;
