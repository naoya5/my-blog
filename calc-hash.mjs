import fs from "fs";
import path from "path";
import crypto from "crypto";

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith(".html")) {
      results.push(file);
    }
  });
  return results;
}

const htmlFiles = walkDir("dist");
const uniqueHashes = new Set();

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1];
    if (content.trim()) {
      const hash = crypto
        .createHash("sha256")
        .update(content, "utf8")
        .digest("base64");
      uniqueHashes.add(`'sha256-${hash}'`);
    }
  }
});

console.log(Array.from(uniqueHashes).join(" "));
