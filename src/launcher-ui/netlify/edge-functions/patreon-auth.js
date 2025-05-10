// netlify/edge-functions/patreon-auth.js
export default async (request, context) => {
    console.log("=== Patreon Auth Function Started ===");

    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const source = searchParams.get('state') || "web";

    if (!code) {
        return new Response('Missing code', {
            status: 400,
            headers: {'Content-Type': 'text/plain'}
        });
    }

    try {
        // Exchange code for access token
        const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: Netlify.env.get('PATREON_CLIENT_ID'),
                client_secret: Netlify.env.get('PATREON_CLIENT_SECRET'),
                redirect_uri: 'https://launcher.diabolical.studio/.netlify/functions/patreon-auth'
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            return new Response('Token exchange failed', {
                status: 400,
                headers: {'Content-Type': 'text/plain'}
            });
        }

        // Fetch user info
        const userRes = await fetch(
            'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_tiers',
            {headers: {Authorization: `Bearer ${tokenData.access_token}`}}
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
        <body>
          <p>Redirecting to launcher...</p>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </body>
      </html>
    `;

        return new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error("Error in Patreon auth:", error);
        return new Response(`Error: ${error.message}`, {
            status: 500,
            headers: {'Content-Type': 'text/plain'}
        });
    }
};