import React, {useEffect, useState} from "react";
import OpenExternalLink from "./link/OpenExternalLink";
import {colors} from "../theme/colors";

const StatusBar = () => {
    const [statusColor, setStatusColor] = useState("rgb(97, 97, 97)");
    const [message, setMessage] = useState("Status message...");
    const [appVersion, setAppVersion] = useState("");

    useEffect(() => {
        if (window.versions) {
            window.versions.getAppVersion().then((version) => {
                setAppVersion(`v${version}`);
            });
        }

        if (window.api) {
            window.api.onDbStatusChange((color) => {
                console.log(`Received new status color: ${color}`);
                setStatusColor(color);
            });

            window.api.onUpdateMessage((msg) => {
                console.log(`Received new message: ${msg}`);
                setMessage(msg);
            });
        } else {
            console.log("window.api is not available (running in the browser)");
        }

        return () => {
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
            border: "1px solid" + colors.border,
            borderRadius: "2px",
            gap: "12px",
            height: "50px",
            maxWidth: "700px",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
        }}>

            <div id="message" style={{
                whiteSpace: "nowrap",
                color: colors.text,
            }}>{message}</div>

            <div id="launcher-version-status-and-number" style={{
                display: "flex", flexDirection: "row", alignItems: "center",
            }}>
                <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "12px",
                    backgroundColor: statusColor,
                    animation: "blink 2s infinite",
                    boxShadow: `0 0 12px ${statusColor}`,
                }}></div>
            </div>
            <span style={{color: colors.text}} id="launcher-version-number">{appVersion}</span>
        </div>
    </OpenExternalLink>);
};

export default StatusBar;
