exports.handler = async function(event, context) {
  console.log("=== Patreon Auth Function Started ===");

  const code = event.queryStringParameters?.code;

  // Parse state for source and sessionID
  let source = "web";
  let sessionId = undefined;
  try {
    if (event.queryStringParameters?.state) {
      const stateObj = JSON.parse(decodeURIComponent(event.queryStringParameters.state));
      source = stateObj.source || "web";
      sessionId = stateObj.sessionID;
    }
  } catch (e) {
    source = event.queryStringParameters?.state || "web";
  }

  if (!code) {
    return {
      statusCode: 400,
      body: 'Missing code'
    };
  }

  if (!sessionId) {
    return {
      statusCode: 400,
      body: 'Missing sessionID in state'
    };
  }

  try {
    // Get our user ID from session ID
    const userRes = await fetch(`${process.env.API_BASE_URL}/rest-api/users/session/${sessionId}`, {
      headers: { 'x-api-key': process.env.API_KEY }
    });
    const userInfo = await userRes.json();

    if (!userInfo || !userInfo.user_id) {
      return {
        statusCode: 400,
        body: 'Invalid session ID'
      };
    }

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

    // Fetch user info from Patreon
    const patreonRes = await fetch(
        'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_tiers',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const patreonData = await patreonRes.json();

    // Check if user is a patron
    const isPatron = patreonData.included?.some(
        (m) => m.type === 'member' && m.attributes.patron_status === 'active_patron'
    );

    // Update user subscription in our API using our system's user ID
    const subscriptionData = {
      user_id: userInfo.user_id,
      status: isPatron ? 'active' : 'inactive',
      external_subscription_id: 'patreon',
      //updated_at: new Date().toISOString()
    };

    // Update subscription status
    await fetch(`${process.env.API_BASE_URL}/rest-api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY
      },
      body: JSON.stringify(subscriptionData)
    });

    // Check if user is subscribed using our API
    const checkRes = await fetch(`${process.env.API_BASE_URL}/rest-api/subscriptions/check/${userInfo.user_id}`, {
      headers: { 'x-api-key': process.env.API_KEY }
    });
    const { isSubscribed } = await checkRes.json();

    // Create the redirect URL
    const redirectUrl = source === "electron"
        ? `diabolicallauncher://auth?provider=patreon&patreon=${isSubscribed ? "success" : "fail"}&code=${code}`
        : `https://launcher.diabolical.studio/account?provider=patreon&patreon=${isSubscribed ? "success" : "fail"}&code=${code}`;

    // Return HTML that will redirect
    const html = `
      <!DOCTYPE html>
      <html lang="en">
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