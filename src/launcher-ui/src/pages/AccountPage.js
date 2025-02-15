// AccountPage.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";
import { Routes, Route, Navigate } from "react-router-dom";

export default function AccountPage() {
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
                    Cookies.remove("sessionID");
                    Cookies.remove("username");
                    setUsername("");
                    setIsLoggedIn(false);
                } else {
                    res.json().then(() => {
                        setIsLoggedIn(true);
                    });
                }
            })
            .catch(() => {
                Cookies.remove("sessionID");
                Cookies.remove("username");
                setUsername("");
                setIsLoggedIn(false);
            })
            .finally(() => {
                setCheckingSession(false);
            });
    }, []);

    useEffect(() => {
        if (!window.api) return;
        window.electronAPI.onProtocolData((action, data) => {
            if (action === "auth") {
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
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("GitHub App", "Successfully authorized!");
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
        <Routes>
            <Route element={<Layout />}>
                <Route
                    index
                    element={
                        isLoggedIn ? (
                            <AccountDashboard username={username} />
                        ) : (
                            <Navigate to="login" />
                        )
                    }
                />
                <Route
                    path="login"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/account" />
                        ) : (
                            <LoginScreen />
                        )
                    }
                />
            </Route>
        </Routes>
    );
}
