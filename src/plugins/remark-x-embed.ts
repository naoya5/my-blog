import type { Html, Paragraph } from 'mdast';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

interface OEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
}

interface XEmbedData {
  url: string;
  authorName: string;
  authorHandle: string;
  authorUrl: string;
  text: string;
  dateText: string;
}

const X_URL_REGEX = /^https?:\/\/(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)(?:[\?#].*)?$/;

function isStandaloneXUrl(node: Paragraph): string | null {
  if (node.children.length !== 1) return null;
  const child = node.children[0];
  if (child.type !== 'link') return null;
  if (child.children.length !== 1 || child.children[0].type !== 'text') return null;
  const textNode = child.children[0];
  if (textNode.value !== child.url) return null;
  return X_URL_REGEX.test(child.url) ? child.url : null;
}

function getCachePath(url: string): string {
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
  return `.cache/remark-x-embed/${hash}.json`;
}

async function loadFromCache(url: string): Promise<OEmbedResponse | null> {
  const path = getCachePath(url);
  try {
    const raw = await readFile(path, 'utf-8');
    const data = JSON.parse(raw);
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof data.url === 'string' &&
      typeof data.author_name === 'string' &&
      typeof data.author_url === 'string' &&
      typeof data.html === 'string'
    ) {
      return data as OEmbedResponse;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveToCache(url: string, data: OEmbedResponse): Promise<void> {
  const path = getCachePath(url);
  await mkdir('.cache/remark-x-embed', { recursive: true });
  await writeFile(path, JSON.stringify(data));
}

async function fetchOEmbed(url: string): Promise<OEmbedResponse | null> {
  const cached = await loadFromCache(url);
  if (cached) return cached;

  const apiUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as OEmbedResponse;
    await saveToCache(url, data);
    return data;
  } catch {
    return null;
  }
}

function parseOEmbed(data: unknown): XEmbedData | null {
  if (typeof data !== 'object' || data === null) return null;
  const { url, author_name: authorName, author_url: authorUrl, html } = data as OEmbedResponse;
  if (typeof url !== 'string' || typeof authorName !== 'string' || typeof authorUrl !== 'string' || typeof html !== 'string') {
    return null;
  }

  const authorUrlMatch = authorUrl.match(/https?:\/\/(?:x\.com|twitter\.com)\/([^/]+)\/?$/);
  const handle = authorUrlMatch?.[1] ?? '';
  const textMatch = html.match(/<p[^>]*>(.*?)<\/p>/is);
  const text = textMatch?.[1] ?? '';
  const dateMatch = html.match(/<\/p>.*?<a[^>]*href="[^"]*"[^>]*>(.*?)<\/a>/is);
  const dateText = dateMatch?.[1] ?? '';

  if (!handle || !text || !dateText) return null;
  if (!url.match(/^https?:\/\//)) return null;

  return {
    url,
    authorName,
    authorHandle: handle,
    authorUrl,
    text,
    dateText,
  };
}

function sanitizeTweetHtml(html: string): string {
  return html.replace(/<([\/]?)([a-zA-Z0-9]+)(\s[^>]*)?>/g, (match, _slash, tag, attrs) => {
    const normalizedTag = tag.toLowerCase();
    if (normalizedTag === 'br') return '<br>';
    if (normalizedTag === 'a') {
      const hrefMatch = attrs?.match(/href=["']([^"']*)["']/);
      const rawHref = hrefMatch ? hrefMatch[1] : '';
      const decodedHref = rawHref ? decodeHtmlEntities(rawHref) : '';
      if (!decodedHref.match(/^https?:\/\//)) {
        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      if (_slash) return match;
      const safeHref = escapeHtml(decodedHref);
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
    }
    return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCard(data: XEmbedData): string {
  return [
    '<figure class="x-embed-card">',
    '  <figcaption class="x-embed-header">',
    `    <span class="x-embed-author">${escapeHtml(data.authorName)}</span>`,
    `    <span class="x-embed-handle">@${escapeHtml(data.authorHandle)}</span>`,
    '  </figcaption>',
    `  <blockquote class="x-embed-body" cite="${escapeHtml(data.url)}">`,
    `    <p>${sanitizeTweetHtml(data.text)}</p>`,
    '  </blockquote>',
    '  <footer class="x-embed-footer">',
    `    <a href="${escapeHtml(data.url)}" target="_blank" rel="noopener noreferrer">`,
    `      <time>${escapeHtml(data.dateText)}</time> · Xで見る`,
    '    </a>',
    '  </footer>',
    '</figure>',
  ].join('\n');
}

function renderFallback(url: string): string {
  return [
    '<figure class="x-embed-card x-embed-card-fallback">',
    '  <blockquote class="x-embed-body">',
    `    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Xの投稿を見る</a>`,
    '  </blockquote>',
    '</figure>',
  ].join('\n');
}

export default function remarkXEmbed() {
  return async (tree: Node) => {
    const targets: { parent: Parent; index: number; url: string }[] = [];

    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      const url = isStandaloneXUrl(node);
      if (url && parent && typeof index === 'number') {
        targets.push({ parent, index, url });
      }
    });

    await Promise.all(
      targets.map(async ({ parent, index, url }) => {
        const oembed = await fetchOEmbed(url);
        const data = oembed ? parseOEmbed(oembed) : null;
        const html = data ? renderCard(data) : renderFallback(url);
        const htmlNode: Html = { type: 'html', value: html };
        parent.children[index] = htmlNode;
      }),
    );
  };
}
