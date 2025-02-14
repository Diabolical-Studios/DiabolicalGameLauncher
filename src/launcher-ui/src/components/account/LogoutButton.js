import React from "react";
import Cookies from "js-cookie";
import {colors} from "../../theme/colors";

const LogoutButton = () => {
    return (<button className="game-button shimmer-button rounded-xs cursor-pointer w-fit p-3 text-sm "
                    onClick={() => {
                        Cookies.remove("username");
                        Cookies.remove("sessionID");
                        window.location.reload();
                    }}
                    style={{
                        color: colors.text,
                    }}>
        Logout
    </button>);
};

export default LogoutButton;
