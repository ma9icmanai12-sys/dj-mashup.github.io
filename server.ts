import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Normalize common DJ typos
function cleanQuery(query: string): string {
  let q = query.trim();
  q = q.replace(/\b(insturmntal|instumental|instrumntal|instuemtal|insturmental|instru)\b/gi, 'instrumental');
  q = q.replace(/\b(accapella|acappella|acapela|acapell|vocals?)\b/gi, 'acapella');
  return q;
}

// 1. YouTube InnerTube API (Direct JSON POST - No redirects, fast and reliable)
async function searchYouTubeInnerTube(query: string, limit = 15) {
  const q = cleanQuery(query);

  try {
    const resp = await fetch('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240401.00.00',
          },
        },
        query: q,
      }),
    });

    if (!resp.ok) return [];
    const data: any = await resp.json();
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents;

    const results: any[] = [];
    if (Array.isArray(contents)) {
      for (const sec of contents) {
        const items = sec?.itemSectionRenderer?.contents;
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item?.videoRenderer) {
              const vr = item.videoRenderer;
              const videoId = vr.videoId;
              if (!videoId || videoId.length !== 11) continue;

              const title =
                vr.title?.runs?.map((r: any) => r.text).join('') ||
                vr.title?.simpleText ||
                'Unknown Video';
              const artist =
                vr.ownerText?.runs?.[0]?.text ||
                vr.shortBylineText?.runs?.[0]?.text ||
                'YouTube Channel';
              const durationFormatted = vr.lengthText?.simpleText || '3:30';
              const parts = durationFormatted
                .split(':')
                .map((p: string) => parseInt(p, 10));
              let durationSec = 210;
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                durationSec = parts[0] * 60 + parts[1];
              } else if (
                parts.length === 3 &&
                !isNaN(parts[0]) &&
                !isNaN(parts[1]) &&
                !isNaN(parts[2])
              ) {
                durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
              }

              const thumbs = vr.thumbnail?.thumbnails;
              const thumbnailUrl =
                thumbs && thumbs.length > 0
                  ? thumbs[thumbs.length - 1].url
                  : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

              const hash = videoId
                .split('')
                .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
              const estimatedBpm = 118 + (hash % 16) * 2;
              const keys = [
                '8A / Am',
                '4A / F#m',
                '7A / Dm',
                '2A / Ebm',
                '9A / Em',
                '11B / A Maj',
                '5A / Cm',
                '6A / Gm',
                '10B / B Maj',
              ];
              const estimatedKey = keys[hash % keys.length];

              results.push({
                id: `yt-${videoId}`,
                videoId,
                title,
                artist,
                thumbnailUrl,
                duration: durationSec,
                durationFormatted,
                bpm: estimatedBpm,
                key: estimatedKey,
                genre: 'YouTube Search',
                suggestedCue: 10,
              });

              if (results.length >= limit) break;
            }
          }
        }
        if (results.length >= limit) break;
      }
    }

    return results;
  } catch (e) {
    console.warn('searchYouTubeInnerTube error', e);
    return [];
  }
}

// 2. YouTube HTML scrape fallback with consent cookies and redirect manual handling
async function searchYouTubeScrapeFallback(query: string, limit = 15) {
  const q = cleanQuery(query);
  const encoded = encodeURIComponent(q).replace(/%20/g, '+');
  const url = `https://www.youtube.com/results?search_query=${encoded}&sp=EgIQAQ%253D%253D`;
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    Cookie: 'CONSENT=YES+cb.20210328-17-p0.en+FX+478; SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg',
  };

  try {
    const resp = await fetch(url, { headers, redirect: 'manual' });
    if (!resp.ok && resp.status !== 200) return [];
    const html = await resp.text();

    let initialData: any = null;
    const scriptRegex =
      /(?:var\s+ytInitialData|window\["ytInitialData"\]|ytInitialData)\s*=\s*({.+?});(?:\s*var\s+|\s*<\/script>)/s;
    const match = html.match(scriptRegex);
    if (match && match[1]) {
      try {
        initialData = JSON.parse(match[1]);
      } catch {}
    }

    if (!initialData) {
      const marker = 'ytInitialData = ';
      const startIdx = html.indexOf(marker);
      if (startIdx !== -1) {
        const sliceStart = startIdx + marker.length;
        const endIdx = html.indexOf(';</script>', sliceStart);
        if (endIdx !== -1) {
          try {
            initialData = JSON.parse(html.slice(sliceStart, endIdx));
          } catch {}
        }
      }
    }

    const results: any[] = [];
    if (initialData) {
      try {
        const contents =
          initialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents
            ?.sectionListRenderer?.contents;
        if (Array.isArray(contents)) {
          for (const sec of contents) {
            const items = sec?.itemSectionRenderer?.contents;
            if (Array.isArray(items)) {
              for (const item of items) {
                if (item?.videoRenderer) {
                  const vr = item.videoRenderer;
                  const videoId = vr.videoId;
                  if (!videoId || videoId.length !== 11) continue;

                  const title =
                    vr.title?.runs?.map((r: any) => r.text).join('') ||
                    vr.title?.simpleText ||
                    'Unknown Video';
                  const artist =
                    vr.ownerText?.runs?.[0]?.text ||
                    vr.shortBylineText?.runs?.[0]?.text ||
                    'YouTube Channel';
                  const durationFormatted = vr.lengthText?.simpleText || '3:30';
                  const parts = durationFormatted
                    .split(':')
                    .map((p: string) => parseInt(p, 10));
                  let durationSec = 210;
                  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    durationSec = parts[0] * 60 + parts[1];
                  } else if (
                    parts.length === 3 &&
                    !isNaN(parts[0]) &&
                    !isNaN(parts[1]) &&
                    !isNaN(parts[2])
                  ) {
                    durationSec =
                      parts[0] * 3600 + parts[1] * 60 + parts[2];
                  }

                  const thumbs = vr.thumbnail?.thumbnails;
                  const thumbnailUrl =
                    thumbs && thumbs.length > 0
                      ? thumbs[thumbs.length - 1].url
                      : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                  const hash = videoId
                    .split('')
                    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
                  const estimatedBpm = 118 + (hash % 16) * 2;
                  const keys = [
                    '8A / Am',
                    '4A / F#m',
                    '7A / Dm',
                    '2A / Ebm',
                    '9A / Em',
                    '11B / A Maj',
                    '5A / Cm',
                    '6A / Gm',
                    '10B / B Maj',
                  ];
                  const estimatedKey = keys[hash % keys.length];

                  results.push({
                    id: `yt-${videoId}`,
                    videoId,
                    title,
                    artist,
                    thumbnailUrl,
                    duration: durationSec,
                    durationFormatted,
                    bpm: estimatedBpm,
                    key: estimatedKey,
                    genre: 'YouTube Search',
                    suggestedCue: 10,
                  });

                  if (results.length >= limit) break;
                }
              }
            }
            if (results.length >= limit) break;
          }
        }
      } catch (e) {
        console.warn('ytInitialData parse error', e);
      }
    }

    return results;
  } catch {
    return [];
  }
}

// Master search executor: uses InnerTube first, falls back to scrape
async function executeYouTubeSearch(query: string, limit = 15) {
  let results = await searchYouTubeInnerTube(query, limit);
  if (results && results.length > 0) return results;

  results = await searchYouTubeScrapeFallback(query, limit);
  return results || [];
}

app.use(express.json());

// API route for YouTube Search
app.get('/api/search', async (req, res) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q) {
      return res.json({ results: [], query: '' });
    }

    // Direct 11-char ID check or URL
    const idMatch = q.match(
      /(?:youtu\.be\/|watch\?v=|embed\/|shorts\/|^)([a-zA-Z0-9_-]{11})(?:[&?]|$)/
    );
    if (idMatch && idMatch[1]) {
      const vidId = idMatch[1];
      return res.json({
        results: [
          {
            id: `yt-${vidId}`,
            videoId: vidId,
            title: `YouTube Video (${vidId})`,
            artist: 'Direct Link',
            thumbnailUrl: `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
            duration: 240,
            durationFormatted: '4:00',
            bpm: 124,
            key: '8A / Am',
            genre: 'YouTube URL',
            suggestedCue: 0,
          },
        ],
        query: q,
      });
    }

    const results = await executeYouTubeSearch(q, 15);
    return res.json({ results: results || [], query: q });
  } catch (err: any) {
    console.warn('Search route error', err?.message);
    return res.json({ results: [], query: '', error: 'Search temporarily unavailable' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
