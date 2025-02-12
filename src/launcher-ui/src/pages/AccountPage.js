import React, {useEffect, useState} from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";

const AccountPage = () => {
    const [username, setUsername] = useState(Cookies.get("username") || "");

    useEffect(() => {
        if(!window.api) return;
        
        window.electronAPI.onProtocolData((action, data) => {
            console.log("Received Protocol Data:", action, data);

            if (action === "auth") {
                console.log("✅ GitHub OAuth successful. Storing session data in cookies.");

                Cookies.set("sessionID", data.sessionID, {secure: true, sameSite: "Strict", expires: 7});
                Cookies.set("username", data.username, {secure: true, sameSite: "Strict", expires: 7});

                setUsername(data.username);
            }

            if (action === "github-app") {
                console.log("✅ GitHub App Installation Successful.");

                Cookies.set("githubInstallationId", data.githubInstallationId, {
                    secure: true,
                    sameSite: "Strict",
                    expires: 7
                });
                Cookies.set("githubAccessToken", data.githubAccessToken, {
                    secure: true,
                    sameSite: "Strict",
                    expires: 7
                });
            }
        });
    }, []);

    return (
        <Layout>
            {username ? <AccountDashboard username={username}/> : <LoginScreen/>}
        </Layout>
    );
};

export default AccountPage;
