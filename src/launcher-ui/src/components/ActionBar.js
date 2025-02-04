import React, { useState } from "react";
import { HomeIcon, SettingsIcon, ChangelogIcon } from "./icons"; // Import icons

const ActionBar = () => {
    const [activeButton, setActiveButton] = useState("home");

    // Menu items
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
                position: "absolute",
                left: 0,
                top: 0,
                width: "60px",
                minWidth: "60px",
                height: "-webkit-fill-available",
                padding: "12px 0",
                zIndex: 9998, // Below title bar
            }}
        >
            {/* Main Icon */}
            <div style={{ textAlign: "center", padding: "12px 0" }}>
                <img
                    src="android-chrome-192x192.png"
                    alt="Icon"
                    draggable="false"
                    style={{ width: "48px", height: "48px" }}
                />
            </div>

            {/* Menu Items */}
            <ul
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    margin: 0,
                    padding: 0,
                    listStyleType: "none",
                    gap: "12px",
                }}
            >
                {menuItems.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => setActiveButton(item.id)}
                            style={{
                                padding: 0,
                                border: "1px solid #303030",
                                borderRadius: "8px",
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
