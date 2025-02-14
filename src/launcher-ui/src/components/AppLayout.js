import React from "react";

const AppLayout = ({ children }) => {
    return (
        <div className="overflow-hidden flex flex-row w-full h-full p-3 gap-3">
            {children}
        </div>
    );
};

export default AppLayout;
