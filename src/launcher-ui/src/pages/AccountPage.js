import React, {useEffect, useMemo, useState} from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";

const saveInstallationPair = (installationId, accessToken) => {
    // Find the next available number
    let count = 1;
    while (Cookies.get(`githubInstallationId${count}`)) {
        count++;
    }

    // Save the new pair
    Cookies.set(`githubInstallationId${count}`, installationId, {
        secure: true,
        sameSite: "Strict",
        expires: 7
    });
    Cookies.set(`githubAccessToken${count}`, accessToken, {
        secure: true,
        sameSite: "Strict",
        expires: 7
    });
};

export const getAllInstallationPairs = () => {
    const pairs = [];
    let count = 1;
    
    while (true) {
        const installationId = Cookies.get(`githubInstallationId${count}`);
        const accessToken = Cookies.get(`githubAccessToken${count}`);
        
        if (!installationId || !accessToken) break;
        
        pairs.push({ installationId, accessToken });
        count++;
    }
    
    return pairs;
};

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
        const githubIdParam = params.get("githubID");

        if (sessionIDParam && usernameParam && githubIdParam) {
            Cookies.set("sessionID", sessionIDParam, cookieOptions);
            Cookies.set("username", usernameParam, cookieOptions);
            Cookies.set("githubID", githubIdParam, cookieOptions);

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
                    Cookies.remove("githubID");
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
                Cookies.remove("githubID");
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
                        window.electronAPI.showCustomNotification("GitHub OAuth", "Success! You are logged in");
                    }
                    Cookies.set("sessionID", data.sessionID, cookieOptions);
                    Cookies.set("username", data.username, cookieOptions);
                    Cookies.set("githubID", data.githubID, cookieOptions);
                    setUsername(data.username);
                    setIsLoggedIn(true);
                }
                if (action === "github-app") {
                    if (window.electronAPI) {
                        window.electronAPI.showCustomNotification("GitHub App", "Successfully authorized!");
                    }
                    // Find if this installation exists and update it
                    let found = false;
                    let count = 1;
                    while (Cookies.get(`githubInstallationId${count}`)) {
                        if (Cookies.get(`githubInstallationId${count}`) === data.githubInstallationId) {
                            // Update existing installation with new token
                            Cookies.set(`githubAccessToken${count}`, data.githubAccessToken, {
                                secure: true,
                                sameSite: "Strict",
                                expires: 7
                            });
                            found = true;
                            break;
                        }
                        count++;
                    }

                    // If not found, save as new installation
                    if (!found) {
                        saveInstallationPair(data.githubInstallationId, data.githubAccessToken);
                    }
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
