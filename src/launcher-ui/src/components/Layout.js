import React from "react";

const Layout = ({children}) => {
    return (<div className={"h-full overflow-hidden"}>
        {children}
    </div>);
};

export default Layout;
