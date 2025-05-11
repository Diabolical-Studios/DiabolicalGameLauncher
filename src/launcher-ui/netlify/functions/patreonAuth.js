// /.netlify/functions/patreonAuth.js

const axios = require('axios');
const qs = require('querystring');

exports.handler = async function (event) {
  console.log('=== Patreon Auth Function Started ===');

  // 1. Parse query params
  const params = event.queryStringParameters || {};
  const code = params.code;
  const rawState = params.state;

  // 2. If no code, kick off the OAuth flow
  if (!code) {
    const CLIENT_ID = process.env.PATREON_CLIENT_ID;
    const REDIRECT_URI = encodeURIComponent(
      'https://launcher.diabolical.studio/.netlify/functions/patreonAuth'
    );
    const STATE = encodeURIComponent(
      JSON.stringify({
        source: params.source || 'web',
        sessionID: params.sessionID || '',
      })
    );
    const SCOPE = encodeURIComponent('identity identity[email] identity.memberships');

    const authorizeUrl = [
      'https://www.patreon.com/oauth2/authorize?',
      `response_type=code`,
      `&client_id=${CLIENT_ID}`,
      `&redirect_uri=${REDIRECT_URI}`,
      `&scope=${SCOPE}`,
      `&state=${STATE}`,
    ].join('');

    return {
      statusCode: 302,
      headers: { Location: authorizeUrl },
    };
  }

  // 3. Decode & validate state
  let source = 'web',
    sessionID;
  try {
    const parsed = JSON.parse(decodeURIComponent(rawState));
    source = parsed.source || source;
    sessionID = parsed.sessionID;
  } catch {
    // fallback if state was just a raw sessionID
    sessionID = rawState;
  }
  if (!sessionID) {
    console.error('Missing sessionID in state');
    return { statusCode: 400, body: 'Missing sessionID' };
  }

  // 4. Lookup your internal user by session
  let userId;
  try {
    const userRes = await axios.get(
      `${process.env.API_BASE_URL}/rest-api/users/session/${sessionID}`,
      { headers: { 'x-api-key': process.env.API_KEY } }
    );
    userId = userRes.data.user_id;
    if (!userId) throw new Error('No user_id');
  } catch (err) {
    console.error('Session lookup failed:', err.message);
    return { statusCode: 400, body: 'Invalid session ID' };
  }

  // 5. Exchange code for access token
  let accessToken;
  try {
    const tokenRes = await axios.post(
      'https://www.patreon.com/api/oauth2/token',
      qs.stringify({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.PATREON_CLIENT_ID,
        client_secret: process.env.PATREON_CLIENT_SECRET,
        redirect_uri: 'https://launcher.diabolical.studio/.netlify/functions/patreonAuth',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error('No access_token returned');
  } catch (err) {
    console.error('Token exchange failed:', err.message);
    return { statusCode: 400, body: 'Token exchange failed' };
  }

  // 6. Fetch Patreon identity & membership
  const patreonAPI = axios.create({
    baseURL: 'https://www.patreon.com/api/oauth2/v2',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'User-Agent': 'DiabolicalLauncher/1.0 (+https://diabolical.studio)',
    },
  });

  // helper to safely parse dates
  const safeDate = d => (d ? new Date(d).toISOString() : null);

  let vanity = 'unknown';
  let isPatron = false;
  let planId = 0;
  let renewedAt = null;
  let endsAt = null;
  let externalSubId = 'patreon';

  try {
    const meRes = await patreonAPI.get('/identity', {
      params: {
        include: 'memberships.currently_entitled_tiers',
        'fields[user]': 'vanity',
        'fields[member]': 'patron_status,last_charge_date,next_charge_date',
      },
    });

    // username / vanity
    const userData = meRes.data.data;
    vanity = userData.attributes.vanity || vanity;

    // find active member record
    const member = (meRes.data.included || []).find(
      inc => inc.type === 'member' && inc.attributes.patron_status === 'active_patron'
    );

    if (member) {
      isPatron = true;
      externalSubId = member.id;
      const tiers = member.relationships.currently_entitled_tiers.data || [];
      if (tiers.length) planId = Number(tiers[0].id) || 0;
      renewedAt = safeDate(member.attributes.last_charge_date);
      endsAt = safeDate(member.attributes.next_charge_date);
    }
  } catch (err) {
    console.warn('Failed to fetch Patreon identity/memberships:', err.message);
  }

  // 7. POST to your subscriptions endpoint
  try {
    await axios.post(
      `${process.env.API_BASE_URL}/rest-api/subscriptions`,
      {
        user_id: userId,
        username: vanity,
        plan_id: planId,
        status: isPatron ? 'active' : 'inactive',
        external_subscription_id: externalSubId,
        renewed_at: renewedAt,
        ends_at: endsAt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY,
        },
      }
    );
  } catch (err) {
    console.error('Failed to save subscription:', err.message);
    // but continue to redirect even if this fails
  }

  // 8. Redirect back to your launcher or web dashboard
  const redirectUrl =
    source === 'electron'
      ? `diabolicallauncher://auth?provider=patreon&code=${encodeURIComponent(code)}`
      : `https://launcher.diabolical.studio/account?provider=patreon&code=${encodeURIComponent(code)}`;

  return {
    statusCode: 302,
    headers: { Location: redirectUrl },
  };
};
