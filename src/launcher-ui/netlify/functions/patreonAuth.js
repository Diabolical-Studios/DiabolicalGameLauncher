/*  /.netlify/functions/patreonAuth.js  */
exports.handler = async function (event) {
  console.log("=== Patreon Auth Function Started ===");
  console.log("Raw querystring:", event.queryStringParameters);

  /* ──────────────────────────────
   * 0. Helpers
   * ────────────────────────────── */
  const safeDate = (str) => (str ? new Date(str) : null);

  /* ──────────────────────────────
   * 1.  Extract query params
   * ────────────────────────────── */
  const code = event.queryStringParameters?.code;
  if (!code) return { statusCode: 400, body: "Missing code" };

  let source = "web";
  let sessionId;
  try {
    if (event.queryStringParameters?.state) {
      const stateObj = JSON.parse(
          decodeURIComponent(event.queryStringParameters.state)
      );
      source = stateObj.source || "web";
      sessionId = stateObj.sessionID;
    }
  } catch {
    source = event.queryStringParameters?.state || "web";
  }
  console.log("Parsed state:", { source, sessionId });

  if (!sessionId)
    return { statusCode: 400, body: "Missing sessionID in state" };

  /* ──────────────────────────────
   * 2.  Look up our user record
   * ────────────────────────────── */
  const userRes = await fetch(
      `${process.env.API_BASE_URL}/rest-api/users/session/${sessionId}`,
      { headers: { "x-api-key": process.env.API_KEY } }
  );
  const userInfo = await userRes.json();
  console.log("User lookup response:", userRes.status, userInfo);

  if (!userInfo?.user_id)
    return { statusCode: 400, body: "Invalid session ID" };

  /* ──────────────────────────────
   * 3.  Exchange code → access-token
   * ────────────────────────────── */
  const tokenRes = await fetch("https://www.patreon.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: process.env.PATREON_CLIENT_ID,
      client_secret: process.env.PATREON_CLIENT_SECRET,
      redirect_uri:
          "https://launcher.diabolical.studio/.netlify/functions/patreonAuth",
    }),
  });
  const tokenData = await tokenRes.json();
  console.log("Token exchange response:", tokenRes.status, tokenData);

  if (!tokenData.access_token)
    return { statusCode: 400, body: "Token exchange failed" };

  /* ────────────────────────────────────────────────────
   * 4.  Pull membership → tier + date metadata
   * ──────────────────────────────────────────────────── */
  const patreonRes = await fetch(
      "https://www.patreon.com/api/oauth2/v2/identity" +
      "?include=memberships" +
      "&fields[member]=patron_status," +
      "currently_entitled_tiers," +
      "pledge_relationship_start," +
      "last_charge_date," +
      "next_charge_date",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const patreonData = await patreonRes.json();
  console.log("Patreon identity response:", patreonRes.status);

  /* Defaults assume non-patron */
  let planId = 0;
  let isPatron = false;
  let renewedAt = null;
  let endsAt = null;
  let externalSubId = "patreon";

  const activeMember = patreonData.included?.find(
      (item) =>
          item.type === "member" &&
          item.attributes?.patron_status === "active_patron"
  );

  if (activeMember) {
    isPatron = true;
    externalSubId = activeMember.id;
    if (
        activeMember.relationships?.currently_entitled_tiers?.data?.length > 0
    ) {
      planId =
          +activeMember.relationships.currently_entitled_tiers.data[0].id || 0;
    }
    renewedAt = safeDate(activeMember.attributes?.last_charge_date);
  }

  console.log("Membership parsed:", {
    isPatron,
    planId,
    renewedAt,
    endsAt,
    externalSubId,
  });

  /* ──────────────────────────────
   * 5.  POST → /subscriptions
   * ────────────────────────────── */
  const subscriptionPayload = {
    user_id: userInfo.user_id,
    plan_id: planId,
    status: isPatron ? "active" : "inactive",
    external_subscription_id: externalSubId,
    renewed_at: renewedAt,
    ends_at: endsAt,
  };

  const subRes = await fetch(
      `${process.env.API_BASE_URL}/rest-api/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_KEY,
        },
        body: JSON.stringify(subscriptionPayload),
      }
  );
  console.log("Subscription POST response:", subRes.status);

  /* ──────────────────────────────
   * 6.  Confirm current status
   *      (kept for logging, not used in redirect)
   * ────────────────────────────── */
  const checkRes = await fetch(
      `${process.env.API_BASE_URL}/rest-api/subscriptions/check/${userInfo.user_id}`,
      { headers: { "x-api-key": process.env.API_KEY } }
  );
  const { isSubscribed } = await checkRes.json();
  console.log("Check subscription response:", checkRes.status, isSubscribed);

  /* ──────────────────────────────
   * 7.  Redirect back to launcher
   *      (only provider + code)
   * ────────────────────────────── */
  const redirectUrl =
      source === "electron"
          ? `diabolicallauncher://auth?provider=patreon&code=${code}`
          : `https://launcher.diabolical.studio/account?provider=patreon&code=${code}`;

  console.log("Redirecting to:", redirectUrl);

  const html = `
    <!DOCTYPE html><html lang="en"><head>
      <meta http-equiv="refresh" content="0;url=${redirectUrl}">
      <title>Redirecting…</title>
    </head><body style="background:#000;color:#fff">
      <p>Redirecting to launcher…</p>
      <script>window.location.replace("${redirectUrl}");</script>
    </body></html>
  `;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    body: html,
  };
};
