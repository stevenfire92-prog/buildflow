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
    console.log('Spotify token error:', (await res.text()).slice(0, 300));
    return null;
  }
  const data = await res.json();
  return data.access_token;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const records = (await base44.asServiceRole.entities.MusicProfile.list()) || [];

    // Live stats: Spotify (needs app keys) and Deezer (public API).
    // Apple Music, SoundCloud and Amazon Music have no public artist API — link cards only.
    const spotifyIds = records
      .filter((r) => r.platform === 'spotify' && r.artist_id)
      .map((r) => r.artist_id)
      .slice(0, 10);
    const token = spotifyIds.length > 0 ? await getSpotifyToken() : null;

    const spotifyProfiles = [];
    const spotifyReleases = {};
    if (token && spotifyIds.length > 0) {
      const artistsRes = await fetch(
        `https://api.spotify.com/v1/artists?ids=${spotifyIds.join(',')}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (artistsRes.ok) {
        const artistData = await artistsRes.json();
        spotifyProfiles.push(...(artistData.artists || []));
        for (const p of spotifyProfiles) {
          const albumsRes = await fetch(
            `https://api.spotify.com/v1/artists/${p.id}/albums?include_groups=album,single&limit=5&market=US`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (!albumsRes.ok) continue;
          const albums = (await albumsRes.json()).items || [];
          const newest = albums
            .filter((al) => al && al.release_date)
            .sort((a, b) => b.release_date.localeCompare(a.release_date))[0];
          if (newest) {
            spotifyReleases[p.id] = {
              name: newest.name,
              release_date: newest.release_date,
              url: `https://open.spotify.com/album/${newest.id}`,
            };
          }
        }
      } else {
        console.log('Spotify artists error:', (await artistsRes.text()).slice(0, 300));
      }
    }

    const profiles = [];
    for (const rec of records.slice(0, 20)) {
      const entry = {
        record_id: rec.id,
        platform: rec.platform,
        artist_id: rec.artist_id || null,
        url: rec.profile_url || null,
        name: rec.name || (rec.platform === 'soundcloud' && rec.artist_id ? rec.artist_id : null),
        image: null,
        followers: null,
        albums: null,
        latest_release: null,
      };

      if (rec.platform === 'spotify' && rec.artist_id) {
        entry.url = `https://open.spotify.com/artist/${rec.artist_id}`;
        const p = spotifyProfiles.find((x) => x && x.id === rec.artist_id);
        if (p) {
          entry.name = p.name;
          entry.image = p.images && p.images.length ? p.images[0].url : null;
          entry.followers = p.followers ? p.followers.total : null;
          entry.latest_release = spotifyReleases[p.id] || null;
        }
      } else if (rec.platform === 'deezer' && rec.artist_id) {
        entry.url = `https://www.deezer.com/artist/${rec.artist_id}`;
        try {
          const res = await fetch(`https://api.deezer.com/artist/${rec.artist_id}`);
          if (res.ok) {
            const d = await res.json();
            if (!d.error) {
              entry.name = d.name;
              entry.image = d.picture_xl || d.picture_big || null;
              entry.followers = d.nb_fan || null;
              entry.albums = d.nb_album || null;
              entry.url = d.link || entry.url;
            }
          }
        } catch (e) {
          console.log('Deezer artist error:', e.message);
        }
      }

      profiles.push(entry);
    }

    return Response.json({
      profiles,
      spotify_not_configured: spotifyIds.length > 0 && !token,
    });
  } catch (error) {
    console.log('getMusicProfileStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}