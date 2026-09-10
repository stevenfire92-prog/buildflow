import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

async function getSpotifyToken() {
  const clientId = secrets.get('SPOTIFY_CLIENT_ID');
  const clientSecret = secrets.get('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const detail = await res.text();
    console.log('Spotify token error:', detail.slice(0, 300));
    throw new Error('Could not authenticate with Spotify');
  }
  const data = await res.json();
  return data.access_token;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Artist IDs are public catalog data; service role so the public
    // dashboard also works for teammates who aren't signed in.
    const records = (await base44.asServiceRole.entities.SpotifyArtist.list()) || [];

    const token = await getSpotifyToken();
    if (!token) {
      return Response.json({ not_configured: true, artists: [] });
    }

    const artists = records.filter((r) => r.artist_id).slice(0, 10);
    if (artists.length === 0) {
      return Response.json({ artists: [] });
    }

    const profileRes = await fetch(
      `https://api.spotify.com/v1/artists?ids=${artists.map((a) => a.artist_id).join(',')}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!profileRes.ok) {
      const detail = await profileRes.text();
      console.log('Spotify artists error:', detail.slice(0, 300));
      return Response.json({ error: 'Could not load artist profiles from Spotify' }, { status: 502 });
    }
    const profiles = (await profileRes.json()).artists || [];

    const result = [];
    for (const rec of artists) {
      const p = profiles.find((x) => x && x.id === rec.artist_id) || null;

      let latestRelease = null;
      if (p) {
        const albumsRes = await fetch(
          `https://api.spotify.com/v1/artists/${p.id}/albums?include_groups=album,single&limit=5&market=US`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (albumsRes.ok) {
          const albums = (await albumsRes.json()).items || [];
          const newest = albums
            .filter((al) => al && al.release_date)
            .sort((a, b) => b.release_date.localeCompare(a.release_date))[0];
          if (newest) {
            latestRelease = {
              name: newest.name,
              type: newest.album_type,
              release_date: newest.release_date,
              url: `https://open.spotify.com/album/${newest.id}`,
            };
          }
        }
      }

      result.push({
        record_id: rec.id,
        artist_id: rec.artist_id,
        name: p ? p.name : rec.name || rec.artist_id,
        image: p && p.images && p.images.length ? p.images[0].url : null,
        followers: p && p.followers ? p.followers.total : null,
        popularity: p ? p.popularity : null,
        genres: p && p.genres ? p.genres.slice(0, 3) : [],
        url: p ? `https://open.spotify.com/artist/${p.id}` : null,
        latest_release: latestRelease,
      });
    }

    return Response.json({ artists: result });
  } catch (error) {
    console.log('getSpotifyArtistStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}