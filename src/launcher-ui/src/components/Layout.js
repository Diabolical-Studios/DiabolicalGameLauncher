import React from "react";
import { Outlet } from "react-router-dom";

const Layout = ({children}) => {
    return (<div className={"h-full overflow-hidden"}>
        {children}
        <Outlet />
    </div>);
};

export default Layout;
