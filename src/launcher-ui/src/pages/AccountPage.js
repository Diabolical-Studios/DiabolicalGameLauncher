import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";

const AccountPage = () => {
    // We still store the username for display purposes,
    // but we use isLoggedIn as our primary indicator of valid session.
    const [username, setUsername] = useState(Cookies.get("username") || "");
    const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get("sessionID"));
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            setCheckingSession(false);
            setIsLoggedIn(false);
            return;
        }

        fetch("/.netlify/functions/verifySession", {
            method: "GET",
            headers: { sessionID },
        })
            .then((res) => {
                if (!res.ok) {
                    // Session is invalid, clear cookies and mark as not logged in
                    Cookies.remove("sessionID");
                    Cookies.remove("username");
                    setUsername("");
                    setIsLoggedIn(false);
                } else {
                    // Parse the response and update username and logged in state
                    res.json().then(() => {
                        setIsLoggedIn(true);
                    });
                }
            })
            .catch((err) => {
                console.error("Session verification error:", err);
                Cookies.remove("sessionID");
                Cookies.remove("username");
                setUsername("");
                setIsLoggedIn(false);
            })
            .finally(() => {
                setCheckingSession(false);
            });
    }, []);

    // Protocol data logic remains intact
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
                    secure: true,
                    sameSite: "Strict",
                    expires: 7,
                });
                Cookies.set("username", data.username, {
                    secure: true,
                    sameSite: "Strict",
                    expires: 7,
                });
                setUsername(data.username);
                setIsLoggedIn(true);
            }

            if (action === "github-app") {
                console.log("✅ GitHub App Installation Successful.");
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("GitHub App", "Successfully authorized! Ready to deploy project.");
                }
                Cookies.set("githubInstallationId", data.githubInstallationId, {
                    secure: true,
                    sameSite: "Strict",
                    expires: 7,
                });
                Cookies.set("githubAccessToken", data.githubAccessToken, {
                    secure: true,
                    sameSite: "Strict",
                    expires: 7,
                });
            }
        });
    }, []);

    if (checkingSession) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            {isLoggedIn ? <AccountDashboard username={username} /> : <LoginScreen />}
        </Layout>
    );
};

export default AccountPage;
