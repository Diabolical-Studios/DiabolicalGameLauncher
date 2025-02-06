import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";  // Wraps UI for consistency
import AccountDashboard from "../components/account/AccountDashboard";
import LoginScreen from "../components/account/LoginScreen";

const AccountPage = () => {
    const [username, setUsername] = useState(localStorage.getItem("username"));

    useEffect(() => {
        // Function to handle messages from login popup
        const handleAuthMessage = (event) => {
            if (event.origin !== "https://launcher.diabolical.studio") return;

            if (event.data && event.data.username) {
                console.log("Auth success! Updating username:", event.data.username);

                // Store user data
                localStorage.setItem("sessionID", event.data.sessionID);
                localStorage.setItem("username", event.data.username);

                // Update state dynamically
                setUsername(event.data.username);
            }
        };

        // Function to handle storage changes (e.g., logout)
        const handleStorageChange = () => {
            setUsername(localStorage.getItem("username"));
        };

        window.addEventListener("message", handleAuthMessage);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("message", handleAuthMessage);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <Layout>
            <h1 style={{ margin: 0 }}>Account</h1>
            {username ? <AccountDashboard username={username} /> : <LoginScreen />}
        </Layout>
    );
};

export default AccountPage;
