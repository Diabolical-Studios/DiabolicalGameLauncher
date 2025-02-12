import React, {useState} from "react";
import {AccountIcon, ChangelogIcon, HomeIcon, SettingsIcon} from "./icons";
import VerticalFlex from "./layout/VerticalFlex";
import OpenExternalLink from "./link/OpenExternalLink";
import {colors} from "../theme/colors";


const NavBar = ({onPageChange}) => {
    const [activeButton, setActiveButton] = useState("account");

    const menuItems = [{id: "account", icon: AccountIcon, alt: "Account"}, {
        id: "home", icon: HomeIcon, alt: "Home"
    }, {id: "settings", icon: SettingsIcon, alt: "Settings"}, {
        id: "changelog", icon: ChangelogIcon, alt: "Changelog"
    },];

    return (<VerticalFlex>
        <OpenExternalLink url="https://diabolical.studio">
            <img
                src="android-chrome-192x192.png"
                alt="Icon"
                draggable="false"
                style={{width: "100%", aspectRatio: "1/1", cursor: "pointer"}}
            />
        </OpenExternalLink>

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
            {menuItems.map((item) => (<li key={item.id}>
                <button
                    onClick={() => {
                        setActiveButton(item.id);
                        onPageChange(item.id);
                    }}
                    style={{
                        padding: 0,
                        border: "1px solid" + colors.border,
                        borderRadius: "2px",
                        backgroundColor: activeButton === item.id ? "rgba(0,0,0,0.6)" : "transparent",
                        width: "50px",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <item.icon fill={activeButton === item.id ? "#ffffff" : "#4b4b4b"}/>
                </button>
            </li>))}
        </ul>
    </VerticalFlex>);
};

export default NavBar;
