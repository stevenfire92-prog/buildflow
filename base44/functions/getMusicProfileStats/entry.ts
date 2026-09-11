import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const records = (await base44.asServiceRole.entities.MusicProfile.list()) || [];

    // Live stats: Deezer (public API, no credentials needed).
    // Spotify, Apple Music, SoundCloud and Amazon Music have no keyless
    // public artist API — they render as verified link cards.
    const profiles = [];
    for (const rec of records.slice(0, 20)) {
      const entry = {
        record_id: rec.id,
        platform: rec.platform,
        artist_id: rec.artist_id || null,
        url: rec.profile_url || null,
        name:
          rec.name ||
          (rec.platform === 'soundcloud' && rec.artist_id ? rec.artist_id : null),
        image: null,
        followers: null,
      };

      if (rec.platform === 'spotify' && rec.artist_id) {
        entry.url = `https://open.spotify.com/artist/${rec.artist_id}`;
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
              entry.url = d.link || entry.url;
            }
          }
        } catch (e) {
          console.log('Deezer artist error:', e.message);
        }
      }

      profiles.push(entry);
    }

    return Response.json({ profiles });
  } catch (error) {
    console.log('getMusicProfileStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}