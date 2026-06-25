import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { blockToMarkdown } from "../../scripts/notion-sync.mjs";

function createTempImageRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "notion-sync-images-"));
}

test("image block downloads an external image and emits a public Markdown path", async () => {
  const previousFetch = globalThis.fetch;
  const imageRootDir = createTempImageRoot();
  const imageBytes = Buffer.from([1, 2, 3, 4]);
  const blockId = "9f8c1c62-9f1a-4bbf-9f22-39df2f8d9634";

  globalThis.fetch = async () =>
    new Response(imageBytes, {
      headers: { "Content-Type": "image/png" },
      status: 200,
    });

  try {
    const markdown = await blockToMarkdown(
      {
        id: blockId,
        type: "image",
        image: {
          external: { url: "https://example.com/notion-image" },
          caption: [{ plain_text: "Diagram ] with caption" }],
        },
      },
      {
        imageContext: {
          imageRootDir,
          slug: "notion-image-sync",
          title: "Fallback title",
        },
      },
    );

    const filename = `${blockId}.png`;
    assert.equal(
      markdown,
      `![Diagram \\] with caption](/images/blog/notion-image-sync/${filename})`,
    );
    assert.deepEqual(
      fs.readFileSync(path.join(imageRootDir, "notion-image-sync", filename)),
      imageBytes,
    );
  } finally {
    globalThis.fetch = previousFetch;
    fs.rmSync(imageRootDir, { force: true, recursive: true });
  }
});

test("dry-run image block does not fetch or write files", async () => {
  const previousFetch = globalThis.fetch;
  const imageRootDir = createTempImageRoot();
  const blockId = "3d39f862-266b-40f0-bc62-e2f972547d08";

  globalThis.fetch = async () => {
    throw new Error("dry-run should not fetch image URLs");
  };

  try {
    const markdown = await blockToMarkdown(
      {
        id: blockId,
        type: "image",
        image: {
          file: { url: "https://example.com/download/photo.webp?expires=1" },
          caption: [],
        },
      },
      {
        imageContext: {
          dryRun: true,
          imageRootDir,
          slug: "dry-run-post",
          title: "Dry Run Title",
        },
      },
    );

    assert.equal(
      markdown,
      `![Dry Run Title](/images/blog/dry-run-post/${blockId}.webp)`,
    );
    assert.equal(fs.existsSync(path.join(imageRootDir, "dry-run-post")), false);
  } finally {
    globalThis.fetch = previousFetch;
    fs.rmSync(imageRootDir, { force: true, recursive: true });
  }
});
