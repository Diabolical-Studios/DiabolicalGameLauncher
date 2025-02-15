import React, {useEffect, useState} from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";

const AccountPage = () => {
    const [username, setUsername] = useState(Cookies.get("username") || "");
    const [checkingSession, setCheckingSession] = useState(true);

    // Verify session on mount
    useEffect(() => {
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            setCheckingSession(false);
            return;
        }

        fetch("/.netlify/functions/verifySession", {
            method: "GET", headers: {sessionID},
        })
            .then((res) => res.json())
            .then((data) => {
                // Assume a valid session returns a GitHub ID and username
                if (data && data.github_id && data.username) {
                    // Always set the username from server response
                    setUsername(data.username);
                } else {
                    // Session invalid or missing data
                    Cookies.remove("sessionID");
                    Cookies.remove("username");
                    setUsername("");
                }
            })
            .catch((err) => {
                console.error("Session verification error:", err);
                Cookies.remove("sessionID");
                Cookies.remove("username");
                setUsername("");
            })
            .finally(() => {
                setCheckingSession(false);
            });
    }, []);

    // Existing protocol data logic remains intact
    useEffect(() => {
        if (!window.api) return;

        window.electronAPI.onProtocolData((action, data) => {
            console.log("Received Protocol Data:", action, data);

            if (action === "auth") {
                console.log("✅ GitHub OAuth successful. Storing session data in cookies.");

                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("GitHub OAuth", "Success! Logging user in...");
                }

                Cookies.set("sessionID", data.sessionID, {
                    secure: true, sameSite: "Strict", expires: 7,
                });
                Cookies.set("username", data.username, {
                    secure: true, sameSite: "Strict", expires: 7,
                });
                setUsername(data.username);
            }

            if (action === "github-app") {
                console.log("✅ GitHub App Installation Successful.");

                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("GitHub App", "Successfully authorized! Ready to deploy project.");
                }

                Cookies.set("githubInstallationId", data.githubInstallationId, {
                    secure: true, sameSite: "Strict", expires: 7,
                });
                Cookies.set("githubAccessToken", data.githubAccessToken, {
                    secure: true, sameSite: "Strict", expires: 7,
                });
            }
        });
    }, []);

    if (checkingSession) {
        return (<Layout>
            <div>Loading...</div>
        </Layout>);
    }

    return (<Layout>
        {username ? <AccountDashboard username={username}/> : <LoginScreen/>}
    </Layout>);
};

export default AccountPage;
