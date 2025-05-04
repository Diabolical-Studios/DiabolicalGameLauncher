import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import CachedIcon from "@mui/icons-material/Cached";
import MinimizeIcon from "@mui/icons-material/Minimize";
import {colors} from "../theme/colors";
import {Zoom} from "@mui/material";

const AppCloseRefreshButtons = () => {
    const handleClose = () => {
        if (window.api) {
            window.electronAPI.closeWindow();
        }
    };

    const handleReload = () => {
        if (window.api) {
            window.electronAPI.reloadWindow();
        }
    };

    const handleMinimize = () => {
        if (window.api) {
            window.electronAPI.minimizeWindow();
        }
    };

    return (
        <div
            className="flex flex-row-reverse items-start justify-between relative left-0 top-0 w-[-webkit-fill-available] h-full z-[999]"
            style={{
                WebkitAppRegion: "drag",
                color: colors.text
            }}
        >
            <div className="flex gap-1" style={{WebkitAppRegion: "no-drag"}}>
            <Zoom in={true} timeout={200} style={{transitionDelay: '100ms'}}>
                    <button onClick={handleMinimize} className="window-button minimize-button">
                        <MinimizeIcon style={{color: colors.text}} fontSize="small"/>
                    </button>
                </Zoom>
                <Zoom in={true} timeout={200} style={{transitionDelay: '50ms'}}>
                    <button onClick={handleReload} className="window-button reload-button">
                        <CachedIcon style={{color: colors.text}} fontSize="small"/>
                    </button>
                </Zoom>
                <Zoom in={true} timeout={200} style={{transitionDelay: '100ms'}}>
                    <button onClick={handleClose} className="window-button close-button">
                        <CloseIcon style={{color: colors.text}} fontSize="small"/>
                    </button>
                </Zoom>
            </div>
        </div>
    );
};

export default AppCloseRefreshButtons;
