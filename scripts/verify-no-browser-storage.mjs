import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const forbidden = [
  "session" + "Storage",
  "local" + "Storage",
  "indexed" + "DB",
];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return nested.flat();
}

const sourceRoot = fileURLToPath(new URL("../app/src", import.meta.url));
const files = (await filesUnder(sourceRoot)).filter((path) =>
  [".ts", ".tsx", ".js", ".jsx"].includes(extname(path)),
);

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const token of forbidden) {
    assert.equal(source.includes(token), false, `${file} contains ${token}`);
  }
}
