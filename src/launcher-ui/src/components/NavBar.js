import React from "react";
import {NavLink} from "react-router-dom";
import {AccountIcon, ChangelogIcon, HomeIcon, SettingsIcon} from "./icons";
import VerticalFlex from "./layout/VerticalFlex";
import OpenExternalLink from "./link/OpenExternalLink";
import {colors} from "../theme/colors";

const NavBar = () => {
    const menuItems = [
        {to: "/account", icon: AccountIcon, alt: "Account"},
        {to: "/", icon: HomeIcon, alt: "Home"},
        {to: "/settings", icon: SettingsIcon, alt: "Settings"},
        {to: "/changelog", icon: ChangelogIcon, alt: "Changelog"},
    ];

    return (
        <VerticalFlex>
            <OpenExternalLink url="https://diabolical.studio">
                <img
                    className="w-full aspect-square cursor-pointer"
                    src="/android-chrome-192x192.png"
                    alt="Icon"
                    draggable="false"
                />
            </OpenExternalLink>

            <ul className="flex flex-col align-center m-0 p-0 gap-3 w-fit">
                {menuItems.map((item) => (
                    <li key={item.to}>
                        <NavLink
                            to={item.to}
                            className={({isActive}) =>
                                "dialog p-3 border rounded-xs w-fit flex align-center cursor-pointer justify-center backdrop-blur " +
                                (isActive ? " active" : "")
                            }
                            style={({isActive}) => ({
                                borderColor: colors.border,
                                backgroundColor: isActive ? "rgba(0,0,0,0.6)" : "transparent",
                                transition: "background-color 0.3s ease",
                            })}
                        >
                            {({isActive}) => (
                                <item.icon fill={isActive ? "#ffffff" : "#4b4b4b"} alt={item.alt}/>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </VerticalFlex>
    );
};

export default NavBar;
