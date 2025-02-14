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
                className={"w-full aspect-square cursor-pointer"}
                src="android-chrome-192x192.png"
                alt="Icon"
                draggable="false"
            />
        </OpenExternalLink>

        <ul className={"flex flex-col align-center m-0 p-0 gap-3 w-fit"}
        >
            {menuItems.map((item) => (<li key={item.id}>
                <button
                    onClick={() => {
                        setActiveButton(item.id);
                        onPageChange(item.id);
                    }}
                    className={"game-button p-3 border rounded-xs w-fit flex align-center cursor-pointer justify-center backdrop-blur"}
                    style={{
                        borderColor: colors.border,
                        backgroundColor: activeButton === item.id ? "rgba(0,0,0,0.6)" : "transparent",
                        transition: "background-color 0.3s ease",
                    }}
                >
                    <item.icon fill={activeButton === item.id ? "#ffffff" : "#4b4b4b"}/>
                </button>
            </li>))}
        </ul>
    </VerticalFlex>);
};

export default NavBar;
