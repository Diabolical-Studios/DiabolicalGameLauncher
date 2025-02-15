import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import CachedIcon from "@mui/icons-material/Cached";
import {colors} from "../theme/colors";

const AppCloseRefreshButtons = () => {
    const handleClose = () => {
        window.electronAPI.closeWindow();
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div
            className="flex flex-row-reverse items-start justify-between relative left-0 top-0 w-[-webkit-fill-available] h-full z-[999]"
            style={{WebkitAppRegion: "drag", color: colors.text}}
        >
            <div className="flex gap-1" style={{WebkitAppRegion: "no-drag"}}>
                <button onClick={handleReload} className="window-button reload-button">
                    <CachedIcon style={{color: colors.text}} fontSize="small"/>
                </button>
                <button onClick={handleClose} className="window-button close-button">
                    <CloseIcon style={{color: colors.text}} fontSize="small"/>
                </button>
            </div>
        </div>
    );
};

export default AppCloseRefreshButtons;
