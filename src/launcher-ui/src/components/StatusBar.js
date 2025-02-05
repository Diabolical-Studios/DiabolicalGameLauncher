import React, { useEffect, useState } from "react";

const StatusBar = () => {
    const [statusColor, setStatusColor] = useState("rgb(97, 97, 97)"); // Default gray
    const [message, setMessage] = useState("Status message..."); // Default message

    useEffect(() => {
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
            window.api.onDbStatusChange(() => {});
            window.api.onUpdateMessage(() => {});
        };
    }, []);

    return (
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
        }}>
            <div id="launcher-version-status-and-number" style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}>
                <span id="launcher-version-number"></span>
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
    );
};

export default StatusBar;
