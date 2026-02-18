import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("deploy script must include pagefind generation path", () => {
  const pkg = JSON.parse(
    fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
  );
  const deploy = pkg.scripts?.deploy ?? "";
  assert.match(
    deploy,
    /pnpm build|pagefind --site dist/,
    "deploy must run pnpm build (or pagefind explicitly) before wrangler deploy",
  );
});
