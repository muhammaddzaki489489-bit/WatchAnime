import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://nontonanimex.com';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.104 Mobile Safari/537.36',
];

let uaIndex = 0;

function getHeaders(ref?: string) {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  const isMobile = ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android');
  const platform = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : 'Linux';
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': ref || `${BASE_URL}/`,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Sec-Ch-Ua-Mobile': isMobile ? '?1' : '?0',
    'Sec-Ch-Ua-Platform': `"${platform}"`,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
  };
}

function randomDelay(min = 300, max = 800) {
  return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

async function fetchHtml(url: string, retries = 3, ref?: string): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      await randomDelay();
      const res = await axios({
        url,
        method: 'GET',
        headers: getHeaders(ref || url),
        timeout: 20000,
        httpsAgent,
        maxRedirects: 5,
        decompress: true,
        validateStatus: (s) => s >= 200 && s < 400,
      });
      return res.data as string;
    } catch (e: any) {
      if (e.response && e.response.status >= 300 && e.response.status < 400) return e.response.data;
      if (i < retries - 1) await randomDelay(1000, 2500);
      else throw e;
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

function decodeToken(tok: string): string | null {
  try {
    const r = tok.split('').reverse().join('');
    let d = '';
    for (let i = 0; i < r.length; i += 2) {
      const c = parseInt(r.substr(i, 2), 36) - ((i / 2) % 7 + 5);
      d += String.fromCharCode(c);
    }
    return decodeURIComponent(d);
  } catch { return null; }
}

function toEmbed(u: string): string {
  if (u.includes('mega.nz/file/')) return u.replace('mega.nz/file/', 'mega.nz/embed/');
  if (u.includes('mega.nz/#!')) return u.replace('mega.nz/#!', 'mega.nz/embed/#!');
  const a = u.match(/acefile\.co\/f\/(\d+)/);
  if (a) return `https://acefile.co/player/${a[1]}`;
  const k = u.match(/krakenfiles\.com\/view\/([^/]+)/);
  if (k) return `https://krakenfiles.com/embed-video/${k[1]}`;
  return u;
}

function isEmbedHost(name: string): boolean {
  const x = name.toLowerCase();
  return x === 'acefile' || x === 'mega' || x === 'kfiles';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnimeItem {
  title: string;
  link: string;
  slug: string;
  poster: string | null;
  status: string | null;
  type: string | null;
  episode: string | null;
  sub: string | null;
}

export interface AnimeListResponse {
  items: AnimeItem[];
  currentPage: number;
  hasNext: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract slug from a nontonanimex URL, e.g. https://nontonanimex.com/one-piece/ → one-piece */
function slugFromUrl(url: string): string {
  return url.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
}

function parseListHtml(html: string): AnimeItem[] {
  const $ = cheerio.load(html);
  const items: AnimeItem[] = [];
  $('div.xrelated').each((_, el) => {
    const href = $(el).find('a.rt').attr('href') || $(el).find('a').first().attr('href') || '';
    const img = $(el).find('img').attr('src') || null;
    const title = $(el).find('div.titlelist').text().trim();
    const eps = $(el).find('div.eplist').text().trim() || null;
    const score = $(el).find('div.starlist').text().replace('★', '').trim() || null;
    if (title && href) {
      const fullLink = href.startsWith('http') ? href : BASE_URL + href;
      items.push({
        title,
        link: fullLink,
        slug: slugFromUrl(fullLink),
        poster: img,
        status: null,
        type: null,
        episode: eps,
        sub: score,
      });
    }
  });
  return items;
}

function parsePagination(html: string, currentUrl: string): { currentPage: number; hasNext: boolean } {
  const $ = cheerio.load(html);
  let currentPage = 1;
  let hasNext = false;

  const cur = $('.pagination span.bg-gdark').first().text().trim();
  if (/^\d+$/.test(cur)) currentPage = parseInt(cur);
  else {
    const m = currentUrl.match(/\/page\/(\d+)/);
    if (m) currentPage = parseInt(m[1]);
  }

  const total: number[] = [];
  $('.pagination a').each((_, el) => {
    const t = $(el).text().trim();
    if (/^\d+$/.test(t)) total.push(parseInt(t));
  });

  const maxPage = total.length ? Math.max(...total) : currentPage;
  if (maxPage > currentPage) hasNext = true;

  // also check next arrow
  const hasNextArrow = $('.pagination a').filter((_, el) => {
    const t = $(el).text().trim();
    return t === '»' || t === '>' || t.toLowerCase().includes('next');
  }).length > 0;

  if (hasNextArrow) hasNext = true;

  return { currentPage, hasNext };
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export async function getHome(page = 1): Promise<AnimeListResponse> {
  const url = page === 1 ? `${BASE_URL}/` : `${BASE_URL}/page/${page}/`;
  try {
    const html = await fetchHtml(url);
    const items = parseListHtml(html);
    const { currentPage, hasNext } = parsePagination(html, url);
    return { items, currentPage, hasNext };
  } catch {
    return { items: [], currentPage: page, hasNext: false };
  }
}

export async function getNew(page = 1): Promise<AnimeListResponse> {
  const url = page === 1 ? `${BASE_URL}/terbaru` : `${BASE_URL}/terbaru/page/${page}`;
  const html = await fetchHtml(url);
  const items = parseListHtml(html);
  const { currentPage, hasNext } = parsePagination(html, url);
  return { items, currentPage, hasNext };
}

export async function getOngoing(page = 1): Promise<AnimeListResponse> {
  const url = page === 1 ? `${BASE_URL}/ongoing` : `${BASE_URL}/ongoing/page/${page}`;
  const html = await fetchHtml(url);
  const items = parseListHtml(html);
  const { currentPage, hasNext } = parsePagination(html, url);
  return { items, currentPage, hasNext };
}

export async function getComplete(page = 1): Promise<AnimeListResponse> {
  const url = page === 1 ? `${BASE_URL}/complete` : `${BASE_URL}/complete/page/${page}`;
  const html = await fetchHtml(url);
  const items = parseListHtml(html);
  const { currentPage, hasNext } = parsePagination(html, url);
  return { items, currentPage, hasNext };
}

// Aliases so existing imports that use getTop / getPopular / etc. don't break
export const getTop = getOngoing;
export const getPopular = getComplete;
export const getUpcoming = (page = 1) => getNew(page);
export const getMovies = (page = 1) => getComplete(page);
export const getAction = (page = 1) => getGenre('action', page);
export const getRomance = (page = 1) => getGenre('romance', page);
export const getComedy = (page = 1) => getGenre('comedy', page);
export const getAdventure = (page = 1) => getGenre('adventure', page);
export const getSciFi = (page = 1) => getGenre('sci-fi', page);
export const getFantasy = (page = 1) => getGenre('fantasy', page);

export async function getSearch(query: string, page = 1): Promise<AnimeListResponse> {
  const url =
    page === 1
      ? `${BASE_URL}/search/?q=${encodeURIComponent(query)}`
      : `${BASE_URL}/search/page/${page}/?q=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  const items = parseListHtml(html);
  const { currentPage, hasNext } = parsePagination(html, url);
  return { items, currentPage, hasNext };
}

export async function getGenresList(): Promise<{ name: string; count: number | null; slug: string }[]> {
  // nontonanimex doesn't have a dedicated genres list page, return common ones
  const genres = [
    'action','adventure','comedy','drama','ecchi','fantasy','game','harem',
    'historical','horror','josei','kids','magic','martial-arts','mecha',
    'military','music','mystery','parody','police','psychological','romance',
    'samurai','school','sci-fi','seinen','shoujo','shounen','slice-of-life',
    'space','sports','super-power','supernatural','thriller','vampire',
  ];
  return genres.map(g => ({
    name: g.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: null,
    slug: g,
  }));
}

export async function getGenre(slug: string, page = 1): Promise<AnimeListResponse> {
  const url =
    page === 1
      ? `${BASE_URL}/genre/${slug}/`
      : `${BASE_URL}/genre/${slug}/page/${page}`;
  const html = await fetchHtml(url);
  const items = parseListHtml(html);
  const { currentPage, hasNext } = parsePagination(html, url);
  return { items, currentPage, hasNext };
}

export async function getSchedule(day: string): Promise<(AnimeItem & { time: string })[]> {
  const url = `${BASE_URL}/jadwal-rilis`;
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const dayMap: Record<string, string> = {
      senin: 'senin', selasa: 'selasa', rabu: 'rabu',
      kamis: 'kamis', jumat: 'jumat', sabtu: 'sabtu', minggu: 'minggu',
    };
    const targetDay = dayMap[day.toLowerCase()] || day.toLowerCase();

    const results: (AnimeItem & { time: string })[] = [];

    $('.jdlist div').each((_, el) => {
      const dayHeading = $(el).find('h2').text().trim().toLowerCase();
      if (!dayHeading.includes(targetDay)) return;

      $(el).find('ul li a').each((__, a) => {
        const title = $(a).text().trim();
        const href = $(a).attr('href') || '';
        if (!title || !href) return;
        const fullLink = href.startsWith('http') ? href : BASE_URL + href;
        results.push({
          title,
          link: fullLink,
          slug: slugFromUrl(fullLink),
          poster: null,
          status: 'Ongoing',
          type: 'TV',
          episode: null,
          sub: 'Sub Indo',
          time: 'TBA',
        });
      });
    });

    return results;
  } catch {
    return [];
  }
}

export async function getDetail(slug: string) {
  const url = `${BASE_URL}/${slug}/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title = $('div.htitle h1').text().trim() || $('h1').first().text().trim() || 'Unknown';
  const rating = $('div.htitle span').text().trim() || null;

  // poster: try og:image first, then xrelated img
  const poster =
    $('meta[property="og:image"]').attr('content') ||
    $('img.attachment-post-thumbnail').attr('src') ||
    $('div.thumbimg img').attr('src') ||
    null;

  const info: Record<string, string> = {};
  $('ul.infol li').each((_, el) => {
    const txt = $(el).text().trim();
    const parts = txt.split(':');
    if (parts.length >= 2) {
      info[parts[0].trim()] = parts.slice(1).join(':').trim();
    }
  });

  const synopsis =
    $('div.synops p').text().trim() ||
    $('div.sinopc').text().trim() ||
    null;

  const genres: { name: string; slug: string }[] = [];
  $('ul.infol li').each((_, el) => {
    const label = $(el).find('b, strong').text().trim().toLowerCase();
    if (label.includes('genre')) {
      $(el).find('a').each((__, a) => {
        const name = $(a).text().trim();
        const href = $(a).attr('href') || '';
        const gSlug = href.replace(`${BASE_URL}/genre/`, '').replace(/\//g, '');
        if (name) genres.push({ name, slug: gSlug });
      });
    }
  });

  const episodes: { number: string; title: string; slug: string; date: string | null }[] = [];
  $('#ctlist li').each((_, el) => {
    const a = $(el).find('a');
    const href = a.attr('href') || '';
    const epTitle = a.text().trim();
    const date = $(el).find('span').last().text().trim() || null;
    if (href) {
      const numMatch = href.match(/episode-(\d+)-/);
      const num = numMatch ? numMatch[1] : null;
      const fullHref = href.startsWith('http') ? href : BASE_URL + href;
      // slug for episode page: strip base URL and slashes
      const epSlug = slugFromUrl(fullHref).replace(/^episode\//, '');
      episodes.push({
        number: num || '?',
        title: epTitle || `Episode ${num}`,
        slug: epSlug,
        date,
      });
    }
  });

  return {
    slug,
    title,
    poster,
    rating,
    status: info['Status'] || info['status'] || null,
    studio: info['Studio'] || info['studio'] || null,
    released: info['Tayang'] || info['Released'] || info['released'] || null,
    duration: info['Durasi'] || info['Duration'] || info['duration'] || null,
    type: info['Tipe'] || info['Type'] || info['type'] || null,
    totalEps: info['Episode'] || info['Total Episode'] || null,
    genres,
    synopsis,
    episodes,
  };
}

export async function getEpisode(slug: string) {
  // slug format: slug-episode-N (e.g. "one-piece-episode-1100-sub-indo" or "one-piece-episode-1100")
  // Normalise: strip trailing -sub-indo if present, extract anime slug + ep number
  const cleanSlug = slug.replace(/-sub-indo$/, '');
  const epMatch = cleanSlug.match(/^(.+)-episode-(\d+)$/);

  if (!epMatch) {
    return {
      title: null,
      iframeUrl: null,
      videoUrl: null,
      prevEpisode: null,
      nextEpisode: null,
      allEpisodesSlug: null,
      episodeList: [],
    };
  }

  const animeSlug = epMatch[1];
  const epNum = parseInt(epMatch[2]);
  const url = `${BASE_URL}/episode/${cleanSlug}-sub-indo/`;

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $('.tlpost').text().trim() || $('h1').first().text().trim() || `Episode ${epNum}`;
    const defaultPlayer = $('#mediaplayer').attr('src') || null;

    // Build embed map from .dlist
    const embedMap: Record<string, Record<string, string>> = {};
    $('.dlist ul li').each((_, el) => {
      const quality = $(el).find('strong').text().trim();
      if (!quality) return;
      const emb: Record<string, string> = {};
      $(el).find('a').each((__, a) => {
        const name = $(a).text().trim();
        const href = $(a).attr('href') || '';
        const token = href.split('/go/')[1];
        if (token) {
          const decoded = decodeToken(token);
          if (decoded && isEmbedHost(name)) {
            emb[name] = toEmbed(decoded);
          }
        }
      });
      if (Object.keys(emb).length) embedMap[quality] = emb;
    });

    // Pick best iframeUrl: defaultPlayer first, then first embed value found
    let iframeUrl: string | null = defaultPlayer;
    if (!iframeUrl) {
      outer: for (const q of Object.keys(embedMap)) {
        for (const v of Object.values(embedMap[q])) {
          iframeUrl = v;
          break outer;
        }
      }
    }

    // Prev / Next
    const pLink = $('#prev a').attr('href') || null;
    const nLink = $('#next a').attr('href') || null;

    const toEpSlug = (href: string) => {
      const full = href.startsWith('http') ? href : BASE_URL + href;
      return slugFromUrl(full).replace(/^episode\//, '').replace(/-sub-indo$/, '');
    };

    const prevEpisode = pLink ? toEpSlug(pLink) : epNum > 1 ? `${animeSlug}-episode-${epNum - 1}` : null;
    const nextEpisode = nLink ? toEpSlug(nLink) : null;

    // Episode list from detail page
    let episodeList: { title: string; slug: string; info: string }[] = [];
    try {
      const detailHtml = await fetchHtml(`${BASE_URL}/${animeSlug}/`);
      const $d = cheerio.load(detailHtml);
      $d('#ctlist li').each((_, el) => {
        const a = $d(el).find('a');
        const href = a.attr('href') || '';
        const epTitle = a.text().trim();
        const date = $d(el).find('span').last().text().trim();
        if (href) {
          const full = href.startsWith('http') ? href : BASE_URL + href;
          const epSlug = slugFromUrl(full).replace(/^episode\//, '').replace(/-sub-indo$/, '');
          episodeList.push({ title: epTitle, slug: epSlug, info: date });
        }
      });
      // ctlist is usually newest-first, sort ascending
      episodeList = episodeList.reverse();
    } catch { /* skip */ }

    return {
      title,
      iframeUrl,
      videoUrl: null,
      prevEpisode,
      nextEpisode,
      allEpisodesSlug: animeSlug,
      episodeList,
    };
  } catch {
    return {
      title: null,
      iframeUrl: null,
      videoUrl: null,
      prevEpisode: null,
      nextEpisode: null,
      allEpisodesSlug: animeSlug,
      episodeList: [],
    };
  }
}
