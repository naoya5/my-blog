#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const NOTION_API_VERSION = "2026-03-11";
const NOTION_LEGACY_DATABASE_API_VERSION = "2022-06-28";
const NOTION_API_BASE = "https://api.notion.com/v1";
const CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");

class NotionApiError extends Error {
  constructor({ status, code, message, detail, endpoint }) {
    super(message);
    this.name = "NotionApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.endpoint = endpoint;
  }
}

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function envAny(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  throw new Error(`Missing required env: one of ${names.join(" / ")}`);
}

function toJstNow(baseDate = new Date()) {
  const utcMs = baseDate.getTime() + baseDate.getTimezoneOffset() * 60 * 1000;
  const jstMs = utcMs + 9 * 60 * 60 * 1000;
  return new Date(jstMs);
}

function toDateOnly(value) {
  const y = value.getFullYear();
  const m = `${value.getMonth() + 1}`.padStart(2, "0");
  const d = `${value.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function notionFetch(token, endpoint, init = {}) {
  const notionVersion = init.notionVersion || NOTION_API_VERSION;
  const { notionVersion: _ignored, ...requestInit } = init;

  const res = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    ...requestInit,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": notionVersion,
      "Content-Type": "application/json",
      ...(requestInit.headers || {}),
    },
  });

  if (!res.ok) {
    const detailText = await res.text();

    try {
      const detail = detailText ? JSON.parse(detailText) : null;
      const code = detail?.code;
      const message = detail?.message || detailText || "Unknown Notion API error";

      throw new NotionApiError({
        status: res.status,
        code,
        detail,
        endpoint,
        message: `Notion API error ${res.status}${code ? ` (${code})` : ""}: ${message}`,
      });
    } catch (parseErr) {
      if (parseErr instanceof NotionApiError) throw parseErr;
      throw new Error(`Notion API error ${res.status}: ${detailText}`);
    }
  }

  return res.json();
}

function normalizeNotionId(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  const candidates = [raw];
  try {
    const url = new URL(raw);
    candidates.push(url.pathname, decodeURIComponent(url.pathname));
  } catch {
    // plain id/string
  }

  const idRegex = /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

  for (const candidate of candidates) {
    const match = candidate.match(idRegex);
    if (match?.[1]) return match[1].toLowerCase();
  }

  return raw;
}

function isNotionNotFoundError(err) {
  return err instanceof NotionApiError && err.status === 404 && err.code === "object_not_found";
}

async function resolveDataSourceId(token, databaseOrDataSourceIdRaw) {
  const id = normalizeNotionId(databaseOrDataSourceIdRaw);
  if (!id) {
    throw new Error("NOTION_DATABASE_ID / NOTION_DATA_SOURCE_ID is empty or invalid.");
  }

  try {
    await notionFetch(token, `/data_sources/${id}`);
    return id;
  } catch (err) {
    if (!isNotionNotFoundError(err)) throw err;
  }

  try {
    const database = await notionFetch(
      token,
      `/databases/${id}`,
      { notionVersion: NOTION_LEGACY_DATABASE_API_VERSION },
    );

    const dataSourceId = database?.data_sources?.[0]?.id;
    if (!dataSourceId) {
      throw new Error(
        `Database ${id} was found, but no data source is available for querying. Check your Notion database setup.`,
      );
    }

    return dataSourceId;
  } catch (err) {
    if (!isNotionNotFoundError(err)) throw err;

    throw new Error(
      [
        `Could not resolve Notion database/data source from: ${databaseOrDataSourceIdRaw}`,
        "Check that your ID is correct and the database is shared with your integration.",
        "Tip: you can set NOTION_DATA_SOURCE_ID directly for newer Notion setups.",
      ].join(" "),
    );
  }
}

function richTextToString(arr = []) {
  return arr.map((item) => item.plain_text || "").join("").trim();
}

function escapeYamlSingleQuoted(str) {
  return String(str ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\\n")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''");
}

function extractPageFields(page) {
  const props = page.properties || {};

  const title = richTextToString(props.Title?.title);
  const slugRaw = richTextToString(props.Slug?.rich_text);
  const description = richTextToString(props.Description?.rich_text);
  const tags = (props.Tags?.multi_select || []).map((tag) => tag.name).filter(Boolean);
  const heroImage = props.HeroImage?.url || "";
  const status = props.Status?.select?.name || "";
  const draft = props.Draft?.checkbox ?? false;
  const publishAt = props.PublishAt?.date?.start || "";

  const slug = slugRaw ? slugify(slugRaw) : slugify(title);

  return { title, slug, description, tags, heroImage, status, draft, publishAt };
}

function notionAnnotationsToMd(text, ann) {
  let out = text;
  if (ann.code) out = `\`${out}\``;
  if (ann.bold) out = `**${out}**`;
  if (ann.italic) out = `*${out}*`;
  if (ann.strikethrough) out = `~~${out}~~`;
  return out;
}

function notionRichTextToMd(arr = []) {
  return arr
    .map((item) => {
      const text = item.plain_text || "";
      if (!text) return "";
      const md = notionAnnotationsToMd(text, item.annotations || {});
      const href = item.href || item.text?.link?.url;
      return href ? `[${md}](${href})` : md;
    })
    .join("")
    .trim();
}

function blockToMarkdown(block, depth = 0) {
  const type = block.type;
  const data = block[type];
  if (!data) return "";

  if (type === "paragraph") return notionRichTextToMd(data.rich_text);
  if (type === "heading_1") return `# ${notionRichTextToMd(data.rich_text)}`;
  if (type === "heading_2") return `## ${notionRichTextToMd(data.rich_text)}`;
  if (type === "heading_3") return `### ${notionRichTextToMd(data.rich_text)}`;
  if (type === "bulleted_list_item") return `${"  ".repeat(depth)}- ${notionRichTextToMd(data.rich_text)}`;
  if (type === "numbered_list_item") return `${"  ".repeat(depth)}1. ${notionRichTextToMd(data.rich_text)}`;
  if (type === "quote") return `> ${notionRichTextToMd(data.rich_text)}`;
  if (type === "code") {
    const language = data.language === "plain text" ? "" : data.language || "";
    const body = notionRichTextToMd(data.rich_text);
    return `\n\`\`\`${language}\n${body}\n\`\`\`\n`;
  }
  if (type === "divider") return "---";

  return "";
}

function normalizeMarkdown(text) {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchAllBlocks(token, blockId) {
  let cursor;
  const all = [];
  do {
    const query = cursor ? `?start_cursor=${encodeURIComponent(cursor)}` : "";
    const data = await notionFetch(token, `/blocks/${blockId}/children${query}`);
    all.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return all;
}

async function fetchAllDataSourcePages(token, dataSourceId, queryBody) {
  let cursor;
  const all = [];

  do {
    const data = await notionFetch(token, `/data_sources/${dataSourceId}/query`, {
      method: "POST",
      body: JSON.stringify({
        ...queryBody,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });
    all.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return all;
}

async function blocksToMarkdown(token, blockId, depth = 0) {
  const blocks = await fetchAllBlocks(token, blockId);
  const lines = [];

  for (const block of blocks) {
    const line = blockToMarkdown(block, depth);
    if (line) lines.push(line);

    if (block.has_children && ["bulleted_list_item", "numbered_list_item"].includes(block.type)) {
      const childText = await blocksToMarkdown(token, block.id, depth + 1);
      if (childText) lines.push(childText);
    }
  }

  return lines.join("\n\n");
}

function shouldPublish(fields, now) {
  if (fields.status !== "Scheduled") return false;
  if (!fields.publishAt) return false;
  const scheduled = new Date(fields.publishAt);
  if (Number.isNaN(scheduled.getTime())) return false;
  return scheduled <= now;
}

async function writePostFile({ slug, frontmatter, body, dryRun }) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const content = `---\n${frontmatter}\n---\n\n${body}\n`;

  if (dryRun) {
    console.log(`[dry-run] Would write: ${filePath}`);
    return;
  }

  let previous = "";
  try {
    previous = await readFile(filePath, "utf8");
  } catch {
    // initial creation
  }

  if (previous === content) {
    console.log(`No change: ${filePath}`);
    return;
  }

  await writeFile(filePath, content, "utf8");
  console.log(`Written: ${filePath}`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const notionToken = env("NOTION_TOKEN");
  const notionSourceIdRaw = envAny(["NOTION_DATA_SOURCE_ID", "NOTION_DATABASE_ID"]);
  const notionDataSourceId = await resolveDataSourceId(notionToken, notionSourceIdRaw);

  await mkdir(CONTENT_DIR, { recursive: true });

  const now = new Date();
  const nowJst = toJstNow(now);
  const pages = await fetchAllDataSourcePages(notionToken, notionDataSourceId, {
    page_size: 100,
    filter: {
      and: [
        { property: "Status", select: { equals: "Scheduled" } },
        { property: "PublishAt", date: { on_or_before: now.toISOString() } },
      ],
    },
    sorts: [{ property: "PublishAt", direction: "ascending" }],
  });

  const targets = pages
    .map((page) => ({ page, fields: extractPageFields(page) }))
    .filter(({ fields }) => fields.title && fields.slug && shouldPublish(fields, now));

  if (targets.length === 0) {
    console.log("No publishable pages found.");
    return;
  }

  for (const { page, fields } of targets) {
    const bodyRaw = await blocksToMarkdown(notionToken, page.id);
    const body = normalizeMarkdown(bodyRaw || "(本文なし)");

    const pubDate = toDateOnly(new Date(fields.publishAt));
    const updatedDate = toDateOnly(nowJst);

    const frontmatterLines = [
      `title: '${escapeYamlSingleQuoted(fields.title)}'`,
      `description: '${escapeYamlSingleQuoted(fields.description || fields.title)}'`,
      `pubDate: ${pubDate}`,
      `updatedDate: ${updatedDate}`,
      `tags: [${fields.tags.map((tag) => `'${escapeYamlSingleQuoted(tag)}'`).join(", ")}]`,
      `draft: ${Boolean(fields.draft)}`,
    ];

    if (fields.heroImage) {
      frontmatterLines.splice(4, 0, `heroImage: '${escapeYamlSingleQuoted(fields.heroImage)}'`);
    }

    await writePostFile({
      slug: fields.slug,
      frontmatter: frontmatterLines.join("\n"),
      body,
      dryRun,
    });
  }

  console.log(`Done. Processed ${targets.length} page(s).`);
}

main().catch((err) => {
  if (isNotionNotFoundError(err)) {
    console.error(err.message || err);
    console.error(
      "Hint: confirm NOTION_DATABASE_ID / NOTION_DATA_SOURCE_ID and share the database with your integration.",
    );
    process.exit(1);
  }

  console.error(err.message || err);
  process.exit(1);
});
