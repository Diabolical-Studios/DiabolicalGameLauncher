const axios = require("axios");

exports.handler = async function (event) {
    const {installation_id, setup_action} = event.queryStringParameters;

    console.log("📥 GitHub Callback Received:", {installation_id, setup_action});

    if (!installation_id) {
        console.error("❌ Missing installation_id in GitHub redirect");
        return {
            statusCode: 400, body: JSON.stringify({error: 'Missing "installation_id" parameter'}),
        };
    }

    return {
        statusCode: 200, headers: {"Content-Type": "text/html"}, body: `
            <html>
            <script>
                console.log("📥 Sending postMessage to opener:", "${installation_id}");

                if (window.opener) {
                    window.opener.postMessage(
                        { githubInstallationId: "${installation_id}" }, 
                        "*"
                    );
                    console.log("✅ postMessage sent:", "${installation_id}");
                } else {
                    console.error("❌ window.opener is NULL. Cannot send postMessage.");
                }

                // Close the popup after sending the message
                setTimeout(() => {
                    console.log("🚪 Closing popup after postMessage...");
                    window.close();
                }, 1000);
            </script>
            <body>
                <p>GitHub App Auth Successful! Redirecting...</p>
            </body>
            </html>
        `,
    };
};

