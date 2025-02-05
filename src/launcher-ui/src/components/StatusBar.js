import React, {useEffect, useState} from "react";

const StatusBar = () => {
    const [statusColor, setStatusColor] = useState("rgb(97, 97, 97)"); // Default gray
    const [message, setMessage] = useState("Status message..."); // Default message
    const [appVersion, setAppVersion] = useState(""); // Store the version number

    const handleClick = (event) => {
        event.preventDefault();

        const url = event.currentTarget.href;

        if (!url) {
            console.error("Invalid URL: href is undefined.");
            return;
        }

        console.log("Opening URL:", url);
        window.electronAPI.openExternal(url);
    };

    useEffect(() => {
        // Fetch app version from Electron preload
        if (window.versions) {
            window.versions.getAppVersion().then((version) => {
                setAppVersion(`v${version}`);
            });
        }

        // Listen for db-status event from Electron
        window.api.onDbStatusChange((color) => {
            console.log(`Received new status color: ${color}`);
            setStatusColor(color);
        });

        // Listen for update messages
        window.api.onUpdateMessage((msg) => {
            console.log(`Received new message: ${msg}`);
            setMessage(msg);
        });

        return () => {
            // Cleanup event listeners when component unmounts
            window.api.onDbStatusChange(() => {
            });
            window.api.onUpdateMessage(() => {
            });
        };
    }, []);

    return (
        <a href="https://github.com/Diabolical-Studios/DiabolicalGameLauncher/"
           onClick={(e) => handleClick(e, "https://github.com/Diabolical-Studios/DiabolicalGameLauncher/")} style={{textDecoration: "none", color: "white"}}>
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
                padding: "0 12px",
                border: "1px solid rgb(48, 48, 48)",
                borderRadius: "2px",
                backgroundColor: "rgba(60, 60, 60, 0.3)",
                gap: "12px",
                height: "50px",
                maxWidth: "700px",
                cursor: "pointer",
            }}>
                <span id="launcher-version-number">{appVersion}</span>

                <div id="launcher-version-status-and-number" style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}>
                    <div style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "12px",
                        backgroundColor: statusColor, // Dynamically update color
                        animation: "blink 2s infinite",
                        boxShadow: `0 0 12px ${statusColor}`,
                    }}></div>
                </div>
                <div id="message" style={{
                    whiteSpace: "nowrap", // Prevents text wrapping
                }}>{message}</div>
            </div>
        </a>
    );
};

export default StatusBar;
