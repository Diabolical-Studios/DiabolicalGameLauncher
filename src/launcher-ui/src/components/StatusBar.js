import React, {useEffect, useState} from "react";
import OpenExternalLink from "./link/OpenExternalLink";

const StatusBar = () => {
    const [statusColor, setStatusColor] = useState("rgb(97, 97, 97)"); // Default gray
    const [message, setMessage] = useState("Status message..."); // Default message
    const [appVersion, setAppVersion] = useState(""); // Store the version number

    useEffect(() => {
        // Fetch app version from Electron preload
        if (window.versions) {
            window.versions.getAppVersion().then((version) => {
                setAppVersion(`v${version}`);
            });
        }

        if (window.api) {
            // Listen for database status changes
            window.api.onDbStatusChange((color) => {
                console.log(`Received new status color: ${color}`);
                setStatusColor(color);
            });

            // Listen for update messages
            window.api.onUpdateMessage((msg) => {
                console.log(`Received new message: ${msg}`);
                setMessage(msg);
            });
        } else {
            // Log or handle when the API is not available (e.g., in the browser)
            console.log("window.api is not available (running in the browser)");
        }

        return () => {
            // Cleanup event listeners when component unmounts
            window.api.onDbStatusChange(() => {
            });
            window.api.onUpdateMessage(() => {
            });
        };
    }, []);

    return (<OpenExternalLink url="https://github.com/Diabolical-Studios/DiabolicalGameLauncher/">
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
            padding: "0 12px",
            border: "1px solid rgb(48, 48, 48)",
            borderRadius: "2px",
            gap: "12px",
            height: "50px",
            maxWidth: "700px",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
        }}>

            <div id="message" style={{
                whiteSpace: "nowrap", // Prevents text wrapping
            }}>{message}</div>

            <div id="launcher-version-status-and-number" style={{
                display: "flex", flexDirection: "row", alignItems: "center",
            }}>
                <div style={{
                    width: "12px", height: "12px", borderRadius: "12px", backgroundColor: statusColor, // Dynamically update color
                    animation: "blink 2s infinite", boxShadow: `0 0 12px ${statusColor}`,
                }}></div>
            </div>
            <span id="launcher-version-number">{appVersion}</span>
        </div>
    </OpenExternalLink>);
};

export default StatusBar;
