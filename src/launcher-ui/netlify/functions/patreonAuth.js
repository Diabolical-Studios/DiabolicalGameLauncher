// netlify/functions/patreonAuth.js
exports.handler = async function(event, context) {
  console.log("=== Patreon Auth Function Started ===");
  
  const code = event.queryStringParameters?.code;
  const source = event.queryStringParameters?.state || "web";
  
  if (!code) {
    return {
      statusCode: 400,
      body: 'Missing code'
    };
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.PATREON_CLIENT_ID,
        client_secret: process.env.PATREON_CLIENT_SECRET,
        redirect_uri: 'https://launcher.diabolical.studio/.netlify/functions/patreonAuth'
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return {
        statusCode: 400,
        body: 'Token exchange failed'
      };
    }

    // Fetch user info
    const userRes = await fetch(
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_tiers',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const userData = await userRes.json();

    // Check if user is a patron
    const isPatron = userData.included?.some(
      (m) => m.type === 'member' && m.attributes.patron_status === 'active_patron'
    );

    // Create the redirect URL
    const redirectUrl = source === "electron"
      ? `diabolicallauncher://auth?provider=patreon&patreon=${isPatron ? "success" : "fail"}&code=${code}`
      : `https://launcher.diabolical.studio/account?provider=patreon&patreon=${isPatron ? "success" : "fail"}&code=${code}`;

    // Return HTML that will redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <title>Redirecting...</title>
        </head>
        <body style="background-color: #000;">
          <p>Redirecting to launcher...</p>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: html
    };
  } catch (error) {
    console.error("Error in Patreon auth:", error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
}; 