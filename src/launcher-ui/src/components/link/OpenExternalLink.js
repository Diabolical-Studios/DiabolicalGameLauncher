import React from "react";

const OpenExternalLink = ({ url, children, className, style }) => {
    const handleClick = (e) => {
        e.preventDefault();
        window.electronAPI.openExternal(url);
    };

    return (
        <a href={url} onClick={handleClick} className={className} style={{textDecoration: "none", color: "white"}}>
            {children}
        </a>
    );
};

export default OpenExternalLink;
