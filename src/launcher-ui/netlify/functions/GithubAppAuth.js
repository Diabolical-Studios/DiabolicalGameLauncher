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
                console.log("📥 Before setting localStorage:", localStorage);

                try {
                    // Save GitHub Installation ID in localStorage
                    localStorage.setItem("githubInstallationId", "${installation_id}");
                    console.log("✅ Stored installation_id:", localStorage.getItem("githubInstallationId"));

                    // Send postMessage to launcher
                    window.opener.postMessage({ githubInstallationId: "${installation_id}" }, "*");
                } catch (err) {
                    console.error("❌ Error setting localStorage:", err);
                }
            </script>
            <body>
                <p>GitHub App Auth Successful! Closing...</p>
            </body>
            </html>
        `,
    };
};

