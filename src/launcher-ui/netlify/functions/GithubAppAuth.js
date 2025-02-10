const axios = require("axios");

exports.handler = async function (event) {
    const {installation_id, setup_action} = event.queryStringParameters;

    if (!installation_id) {
        return {
            statusCode: 400, body: JSON.stringify({error: 'Missing "installation_id" parameter'}),
        };
    }

    console.log(`✅ GitHub App installed! ID: ${installation_id}, Action: ${setup_action}`);

    return {
        statusCode: 200, headers: {"Content-Type": "text/html"}, body: `
            <html>
            <script>
                // Save GitHub Installation ID in localStorage
                localStorage.setItem("githubInstallationId", "${installation_id}");

                // Notify the parent window that authentication is complete
                window.opener.postMessage({ githubInstallationId: "${installation_id}" }, "*");

                // Close the popup window
                window.close();
            </script>
            <body>
                <p>GitHub App Auth Successful! Closing...</p>
            </body>
            </html>
        `,
    };
};
