import React from "react";

const handleGitHubLogin = () => {
    const CLIENT_ID = "Ov23ligdn0N1TMqWtNTV";
    const redirectUri = encodeURIComponent("https://launcher.diabolical.studio/.netlify/functions/github-auth");

    const popup = window.open(
        `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`,
        "GitHubAuth",
        "width=500,height=700"
    );

    const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
            clearInterval(checkPopup);
            console.log("Popup closed.");
        }
    }, 1000);
};

const LoginScreen = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
        }}>
            <h2>Login to Sync Your Data</h2>

            <button className="game-button shimmer-button" onClick={handleGitHubLogin}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        width: "fit-content",
                    }}>
                <img alt="GitHub" style={{ aspectRatio: "1/1", width: "16px" }} src="MenuIcons/github-mark-white.png" />
                <p style={{ margin: "0px", fontSize: "14px" }}>Login With GitHub</p>
            </button>
        </div>
    );
};

export default LoginScreen;
