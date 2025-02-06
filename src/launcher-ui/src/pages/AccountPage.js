import React from "react";

const AccountPage = () => {
    const handleGitHubLogin = () => {
        const CLIENT_ID = "Ov23ligdn0N1TMqWtNTV";
        const redirectUri = encodeURIComponent("https://launcher.diabolical.studio/.netlify/functions/github-auth");
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
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
