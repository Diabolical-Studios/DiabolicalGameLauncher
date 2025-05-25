/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-undef */

export default async (request, context) => {
  try {
    const { team_id, session_id } = await request.json();

    if (!team_id || !session_id) {
      return new Response(JSON.stringify({ error: 'Team ID and session ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(
      `${Netlify.env.get('API_BASE_URL')}/rest-api/unityPackages?team_id=${encodeURIComponent(team_id)}&session_id=${encodeURIComponent(session_id)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Netlify.env.get('API_KEY'),
        },
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-all-packages:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
