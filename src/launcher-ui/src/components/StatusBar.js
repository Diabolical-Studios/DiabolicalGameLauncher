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


            return () => {
                window.api.onDbStatusChange(() => {
                });
                window.api.onUpdateMessage(() => {
                });
            };
        } else {
            console.log("window.api is not available (running in the browser)");
        }
    }, []);

    return (<OpenExternalLink url="https://github.com/Diabolical-Studios/DiabolicalGameLauncher/">
        <div
            className={"flex position-relative align-center h-fit p-3 border rounded-xs gap-3 w-fit cursor-pointer backdrop-blur"}
            style={{
                borderColor: colors.border,
            }}>

            <div id="message" style={{
                whiteSpace: "nowrap", color: colors.text,
            }}>{message}</div>

            <div id="launcher-version-status-and-number" className={"flex align-center"}>
                <div className={"w-3 h-3 rounded-xl"} style={{
                    backgroundColor: statusColor, animation: "blink 2s infinite", boxShadow: `0 0 12px ${statusColor}`,
                }}></div>
            </div>
            <span style={{color: colors.text}} id="launcher-version-number">{appVersion}</span>
        </div>
    </OpenExternalLink>);
};

export default StatusBar;
