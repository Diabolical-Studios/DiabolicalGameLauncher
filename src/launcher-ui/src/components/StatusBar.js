import React from "react";

const StatusBar = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
            padding: "0 12px",
            border: "1px solid #242424",
            borderRadius: "2px",
            gap: "12px",
            height: "50px",
        }}>
            <div id="launcher-version-status-and-number" style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}>
                <span id="launcher-version-number"></span>
                <div id="launcher-version-status" style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "12px",
                    backgroundColor: "rgb(97, 97, 97)",
                    animation: "blink 2s infinite",
                    boxShadow: "0 0 12px rgb(128, 128, 128)",
                }}></div>
            </div>
            <div id="message" style={{
                textWrapMode: "nowrap",
            }}>Status message...
            </div>

        </div>
    );
};

export default StatusBar;
