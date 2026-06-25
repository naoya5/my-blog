import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { downloadImage } from "../../scripts/notion-sync.mjs";

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "notion-sync-download-"));
}

test("downloadImage skips rewriting an unchanged file", async () => {
  const previousFetch = globalThis.fetch;
  const tempDir = createTempDir();
  const destination = path.join(tempDir, "image.jpg");
  const imageBytes = Buffer.from("same image bytes");

  fs.writeFileSync(destination, imageBytes);
  const before = fs.statSync(destination).mtimeMs;

  globalThis.fetch = async () =>
    new Response(imageBytes, {
      headers: { "Content-Type": "image/jpeg" },
      status: 200,
    });

  try {
    const result = await downloadImage("https://example.com/image.jpg", destination);

    assert.equal(result.path, destination);
    assert.equal(result.written, false);
    assert.equal(fs.statSync(destination).mtimeMs, before);
  } finally {
    globalThis.fetch = previousFetch;
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
});

test("downloadImage allows generic binary image responses", async () => {
  const previousFetch = globalThis.fetch;
  const tempDir = createTempDir();
  const destination = path.join(tempDir, "image.webp");
  const imageBytes = Buffer.from("webp bytes");

  globalThis.fetch = async () =>
    new Response(imageBytes, {
      headers: { "Content-Type": "application/octet-stream" },
      status: 200,
    });

  try {
    const result = await downloadImage("https://example.com/image.webp", destination);

    assert.equal(result.path, destination);
    assert.equal(result.written, true);
    assert.deepEqual(fs.readFileSync(destination), imageBytes);
  } finally {
    globalThis.fetch = previousFetch;
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
});

test("downloadImage fails on HTTP errors", async () => {
  const previousFetch = globalThis.fetch;
  const tempDir = createTempDir();

  globalThis.fetch = async () =>
    new Response("not found", {
      status: 404,
    });

  try {
    await assert.rejects(
      downloadImage("https://example.com/missing.jpg", path.join(tempDir, "missing.jpg")),
      /HTTP 404/,
    );
  } finally {
    globalThis.fetch = previousFetch;
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
});
