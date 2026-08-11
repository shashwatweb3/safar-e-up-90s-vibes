const MOBILE_UA =
  "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36";

const decodeEscapes = (value: string): string =>
  value
    .replace(/\\u0026/g, "&")
    .replace(/\\u0027/g, "'")
    .replace(/\\u0022/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

function parseFeed(xml: string): { videoId: string; title: string }[] {
  const ids = [...xml.matchAll(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/g)].map(
    (m) => m[1] as string,
  );
  const titles = [...xml.matchAll(/<media:title>([^<]*)<\/media:title>/g)].map((m) =>
    decodeEscapes(m[1] as string),
  );
  return ids.map((videoId, i) => ({ videoId, title: titles[i] ?? "" }));
}

function parseMobilePage(html: string): { videoId: string; title: string }[] {
  const start = html.indexOf("ytInitialData");
  if (start === -1) return [];
  const content = html.slice(start + "ytInitialData".length);
  const open = content.indexOf("'");
  if (open === -1) return [];
  const body = content.slice(open + 1);
  const close = body.indexOf("';");
  if (close === -1) return [];
  const escaped = body.slice(0, close);
  const json = escaped.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  const data = JSON.parse(json.slice(json.indexOf("{"))) as unknown;

  const entries: { videoId: string; title: string }[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object" || node === null) return;
    const record = node as Record<string, unknown>;
    const lockup = record["lockupViewModel"] as Record<string, unknown> | undefined;
    if (lockup) {
      const rawId = typeof lockup["contentId"] === "string" ? (lockup["contentId"] as string) : "";
      const videoId = rawId.startsWith("VIDEO_ID:") ? rawId.slice("VIDEO_ID:".length) : rawId;
      if (videoId.length === 11) {
        const metadata = lockup["metadata"] as Record<string, unknown> | undefined;
        const titleModel = metadata?.["lockupMetadataViewModel"] as
          Record<string, unknown> | undefined;
        const title =
          typeof titleModel?.["title"] === "string"
            ? (titleModel["title"] as string)
            : ((titleModel?.["title"] as Record<string, unknown> | undefined)?.["content"] ?? "");
        entries.push({ videoId, title: decodeEscapes(String(title)) });
      }
    }
    Object.values(record).forEach(walk);
  };
  walk(data);
  return entries;
}

export async function fetchPlaylistVideos(
  playlistId: string,
): Promise<{ videoId: string; title: string }[]> {
  const headers = { "user-agent": MOBILE_UA };
  try {
    const res = await fetch(
      `https://m.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`,
      { headers },
    );
    if (res.ok) {
      const entries = parseMobilePage(await res.text());
      if (entries.length > 0) return entries;
    }
  } catch {
    // fall through to the RSS feed
  }
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`,
    { headers },
  );
  if (!res.ok) throw new Error(`YouTube playlist feed returned ${res.status}`);
  return parseFeed(await res.text());
}
