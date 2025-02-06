import React, { useEffect } from "react";

const AccountPage = () => {
    useEffect(() => {
        window.addEventListener("message", (event) => {
            if (event.data && event.data.username) {
                console.log("Received auth data from popup:", event.data);
                // Here you can update the UI with user info
                localStorage.setItem("sessionID", event.data.sessionID);
                localStorage.setItem("username", event.data.username);
            }
        });

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener("message", () => {});
        };
    }, []);

    const handleGitHubLogin = () => {
        const CLIENT_ID = "Ov23ligdn0N1TMqWtNTV";
        const redirectUri = encodeURIComponent("https://launcher.diabolical.studio/.netlify/functions/github-auth");

        // Open GitHub login in a popup window
        const popup = window.open(
            `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`,
            "GitHubAuth",
            "width=500,height=700"
        );

        // Poll the popup window to check if it's closed
        const interval = setInterval(() => {
            if (popup.closed) {
                clearInterval(interval);
                console.log("Popup closed. Checking authentication status...");
            }
        }, 1000);
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Account</h1>
            <p>Login to sync your data</p>

            {/* GitHub Login Button */}
            <button
                onClick={handleGitHubLogin}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#24292e",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                     alt="GitHub"
                     width="20px"
                     height="20px"
                     style={{ backgroundColor: "white", borderRadius: "50%" }}
                />
                Login with GitHub
            </button>
        </div>
    );
};

export default AccountPage;
