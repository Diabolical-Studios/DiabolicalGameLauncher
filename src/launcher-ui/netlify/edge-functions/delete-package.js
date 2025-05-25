/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-undef */

export default async (request, context) => {
  try {
    const url = new URL(request.url);
    const package_id = url.pathname.split('/').pop();
    const { team_id, session_id } = await request.json();

    if (!package_id || !team_id || !session_id) {
      return new Response(
        JSON.stringify({ error: 'Package ID, team ID, and session ID are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch(
      `${Netlify.env.get('API_BASE_URL')}/rest-api/unityPackages/${package_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Netlify.env.get('API_KEY'),
        },
        body: JSON.stringify({ team_id, session_id }),
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
