/* /.netlify/functions/patreonAuth.js */
exports.handler = async function (event) {
  console.log('=== Patreon Auth Function Started ===');
  console.log('Raw querystring:', event.queryStringParameters);

  // ─────────────────────────────────────────────────────
  // 0. Helpers
  // ─────────────────────────────────────────────────────
  const safeDate = str => (str ? new Date(str) : null);

  // ─────────────────────────────────────────────────────
  // 1. Extract query params
  // ─────────────────────────────────────────────────────
  const code = event.queryStringParameters?.code;
  if (!code) return { statusCode: 400, body: 'Missing code' };

  let source = 'web';
  let sessionId;
  try {
    if (event.queryStringParameters.state) {
      const st = JSON.parse(decodeURIComponent(event.queryStringParameters.state));
      source = st.source || 'web';
      sessionId = st.sessionID;
    }
  } catch {
    source = event.queryStringParameters.state || 'web';
  }
  console.log('Parsed state:', { source, sessionId });
  if (!sessionId) return { statusCode: 400, body: 'Missing sessionID in state' };

  // ─────────────────────────────────────────────────────
  // 2. Lookup user by session
  // ─────────────────────────────────────────────────────
  const userRes = await fetch(`${process.env.API_BASE_URL}/rest-api/users/session/${sessionId}`, {
    headers: { 'x-api-key': process.env.API_KEY },
  });
  const userInfo = await userRes.json();
  console.log('User lookup response:', userRes.status, userInfo);
  if (!userInfo?.user_id) return { statusCode: 400, body: 'Invalid session ID' };

  // ─────────────────────────────────────────────────────
  // 3. Exchange code → access_token
  // ─────────────────────────────────────────────────────
  const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.PATREON_CLIENT_ID,
      client_secret: process.env.PATREON_CLIENT_SECRET,
      redirect_uri: 'https://launcher.diabolical.studio/.netlify/functions/patreonAuth',
    }),
  });
  const tokenData = await tokenRes.json();
  console.log('Token exchange response:', tokenRes.status, tokenData);
  if (!tokenData.access_token) return { statusCode: 400, body: 'Token exchange failed' };

  // ─────────────────────────────────────────────────────
  // 4. Fetch identity + memberships (incl. vanity & full_name)
  // ─────────────────────────────────────────────────────
  const qs = new URLSearchParams({
    include: 'memberships',
    'fields[member]': [
      'patron_status',
      'currently_entitled_tiers',
      'pledge_relationship_start',
      'last_charge_date',
      'next_charge_date',
    ].join(','),
    'fields[user]': 'vanity',
  });
  const identityUrl = `https://www.patreon.com/api/oauth2/v2/identity?${qs}`;
  console.log('Fetching Patreon identity:', identityUrl);

  const patreonRes = await fetch(identityUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const patreonData = await patreonRes.json();
  console.log('Patreon identity response:', patreonRes.status, patreonData);

  if (!patreonData.data) {
    console.error('Invalid Patreon response:', patreonData);
    return { statusCode: 400, body: 'Invalid Patreon response' };
  }

  const patreonUsername = patreonData.data?.attributes?.vanity || 'blazitt';
  console.log('Patreon username:', patreonUsername);

  // ─────────────────────────────────────────────────────
  // 5. Parse membership info
  // ─────────────────────────────────────────────────────
  let planId = 0;
  let isPatron = false;
  let renewedAt = null;
  let endsAt = null;
  let externalSubId = 'patreon';

  const activeMember = (patreonData.included || []).find(
    i => i.type === 'member' && i.attributes?.patron_status === 'active_patron'
  );

  if (activeMember) {
    isPatron = true;
    externalSubId = activeMember.id;
    const tiers = activeMember.relationships?.currently_entitled_tiers?.data || [];
    if (tiers.length) {
      planId = Number(tiers[0].id) || 0;
    }
    renewedAt = safeDate(activeMember.attributes?.last_charge_date);
    endsAt = safeDate(activeMember.attributes?.next_charge_date);
  }

  console.log('Membership parsed:', { isPatron, planId, renewedAt, endsAt, externalSubId });

  // ─────────────────────────────────────────────────────
  // 6. Build & log subscription payload
  // ─────────────────────────────────────────────────────
  const subscriptionPayload = {
    user_id: userInfo.user_id,
    username: 'blazitt',
    plan_id: planId,
    status: isPatron ? 'active' : 'inactive',
    external_subscription_id: externalSubId,
    renewed_at: renewedAt,
    ends_at: endsAt,
  };
  console.log('Subscription payload →', subscriptionPayload);

  // ─────────────────────────────────────────────────────
  // 7. POST → your /subscriptions endpoint
  // ─────────────────────────────────────────────────────
  const subRes = await fetch(`${process.env.API_BASE_URL}/rest-api/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
    body: JSON.stringify(subscriptionPayload),
  });
  console.log('Subscription POST response:', subRes.status, await subRes.text());

  // ─────────────────────────────────────────────────────
  // 8. Redirect back to launcher
  // ─────────────────────────────────────────────────────
  const redirectUrl =
    source === 'electron'
      ? `diabolicallauncher://auth?provider=patreon&code=${code}`
      : `https://launcher.diabolical.studio/account?provider=patreon&code=${code}`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    body: `
      <!DOCTYPE html><html><head>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}">
        <title>Redirecting...</title>
      </head><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;">
        <p>Redirecting to launcher…</p>
        <script>window.location.replace("${redirectUrl}")</script>
      </body></html>
    `,
  };
};
