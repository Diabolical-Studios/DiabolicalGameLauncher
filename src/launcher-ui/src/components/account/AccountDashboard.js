import React from "react";
import Teams from "./Teams";
import AccountName from "./AccountName";
import LogoutButton from "./LogoutButton";
import Grid from "../Grid";
import Games from "./Games";

const AccountDashboard = ({username}) => {
    const sessionID = localStorage.getItem("sessionID");

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%", gap: "12px",}}>
            <div style={{
                padding: "4px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backdropFilter: "blur(5px)",
                backgroundColor: "transparent",
            }}>
                <AccountName username={username}/>
                <LogoutButton/>
            </div>

            <Grid>
                <Teams sessionID={sessionID}/>
                <Games sessionID={sessionID}/>
            </Grid>

        </div>
    );
};

export default AccountDashboard;
