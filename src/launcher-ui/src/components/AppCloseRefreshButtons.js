import React from "react";
import {Stack} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CachedIcon from '@mui/icons-material/Cached';
import {colors} from "../theme/colors";

const AppCloseRefreshButtons = () => {
    const handleClose = () => {
        window.electronAPI.closeWindow();
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (<Stack
        style={{
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "flex-start",
            justifyContent: "space-between",
            position: "relative",
            left: 0,
            top: 0,
            width: "-webkit-fill-available",
            height: "100%",
            color: colors.text,
            zIndex: 999,
            WebkitAppRegion: "drag",
        }}
    >
        <Stack style={{WebkitAppRegion: "no-drag", display: "flex", flexDirection: "row", gap: "4px"}}>
            <button onClick={handleReload}
                    className="window-button reload-button"
            >
                <CachedIcon style={{color: colors.text}} fontSize="small"/>
            </button>

            <button onClick={handleClose}
                    className="window-button close-button"
            >
                <CloseIcon style={{color: colors.text}} fontSize="small"/>
            </button>
        </Stack>
    </Stack>);
};

export default AppCloseRefreshButtons;
