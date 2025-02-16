import React, {useEffect, useMemo, useState} from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";
import {Routes, Route, Navigate, useLocation, useNavigate} from "react-router-dom";

export default function AccountPage() {
    const [username, setUsername] = useState(Cookies.get("username") || "");
    const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get("sessionID"));
    const [checkingSession, setCheckingSession] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const cookieOptions = useMemo(() => ({expires: 7, secure: true, sameSite: "Strict"}), []);
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sessionIDParam = params.get("sessionID");
        const usernameParam = params.get("username");
        if (sessionIDParam && usernameParam) {
            Cookies.set("sessionID", sessionIDParam, cookieOptions);
            Cookies.set("username", usernameParam, cookieOptions);
            setUsername(usernameParam);
            setIsLoggedIn(true);
            navigate(location.pathname, {replace: true});
        }
    }, [location.search, location.pathname, navigate, cookieOptions]);

    useEffect(() => {
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            setCheckingSession(false);
            setIsLoggedIn(false);
            return;
        }
        fetch("/verify-session", {
            method: "GET", headers: {sessionID},
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
        if (window.api && window.electronAPI && typeof window.electronAPI.onProtocolData === "function") {
            window.electronAPI.onProtocolData((action, data) => {
                if (action === "auth") {
                    if (window.electronAPI) {
                        window.electronAPI.showCustomNotification("GitHub OAuth", "Success! Logging user in...");
                    }
                    Cookies.set("sessionID", data.sessionID, cookieOptions);
                    Cookies.set("username", data.username, cookieOptions);
                    setUsername(data.username);
                    setIsLoggedIn(true);
                }
                if (action === "github-app") {
                    if (window.electronAPI) {
                        window.electronAPI.showCustomNotification("GitHub App", "Successfully authorized!");
                    }
                    Cookies.set("githubInstallationId", data.githubInstallationId, cookieOptions);
                    Cookies.set("githubAccessToken", data.githubAccessToken, cookieOptions);
                }
            });
        }
    }, [cookieOptions]);

    if (checkingSession) {
        return (<Layout>
            <div>Loading...</div>
        </Layout>);
    }

    return (<Routes>
        <Route element={<Layout/>}>
            <Route
                index
                element={isLoggedIn ? <Navigate to="/account/dashboard"/> : <Navigate to="/account/login"/>}
            />
            <Route
                path="login"
                element={isLoggedIn ? <Navigate to="/account/dashboard"/> : <LoginScreen/>}
            />
            <Route
                path="dashboard/*"
                element={isLoggedIn ? <AccountDashboard username={username}/> : <Navigate to="/account/login"/>}
            />
        </Route>
    </Routes>);
}
