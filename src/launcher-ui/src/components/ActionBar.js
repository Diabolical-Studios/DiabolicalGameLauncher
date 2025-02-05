import React, { useState } from "react";
import { HomeIcon, SettingsIcon, ChangelogIcon } from "./icons";

const ActionBar = ({ onPageChange }) => {
    const [activeButton, setActiveButton] = useState("home");

    const menuItems = [
        { id: "home", icon: HomeIcon, alt: "Home" },
        { id: "settings", icon: SettingsIcon, alt: "Settings" },
        { id: "changelog", icon: ChangelogIcon, alt: "Changelog" },
    ];

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                left: 0,
                top: 0,
                height: "100%",
                width: "min-content",
                zIndex: 9998,
                alignItems: "center",
            }}
        >
            <a
                href="https://diabolical.studio"
                onClick={(e) => {
                    e.preventDefault();
                    window.electronAPI.openExternal("https://diabolical.studio");
                }}
                style={{ display: "block", width: "100%" }}
            >
                <img
                    src="android-chrome-192x192.png"
                    alt="Icon"
                    draggable="false"
                    style={{ width: "100%", aspectRatio: "1/1", cursor: "pointer" }}
                />
            </a>

            <ul
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    margin: 0,
                    padding: 0,
                    listStyleType: "none",
                    gap: "12px",
                    width: "fit-content",
                }}
            >
                {menuItems.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => {
                                setActiveButton(item.id);
                                onPageChange(item.id);
                            }}
                            style={{
                                padding: 0,
                                border: "1px solid #303030",
                                borderRadius: "2px",
                                backgroundColor: activeButton === item.id ? "rgba(60, 60, 60, 0.3)" : "transparent",
                                width: "50px",
                                height: "50px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease",
                            }}
                        >
                            <item.icon fill={activeButton === item.id ? "#ffffff" : "#4b4b4b"} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActionBar;
