// clipper-fix-1 — entry program for make.fun bounty gta6-clipper-01.
// Node 22+, standard library only. It follows the kit starter's shape:
// copy VIDEO.json from MAKEFUN_BOT_DIR (the repository, /bot in the
// grader) to MAKEFUN_OUTPUT_DIR/VIDEO.json (/output in the grader),
// creating the output directory first, and exit 1 on any failure.
// If MAKEFUN_BOT_DIR holds no VIDEO.json, the copy beside this file
// is used instead, so a local run without the env var still works.
// The previous entry only printed the video address and never wrote the
// file, so the scorer saw no video and scored 0.
//
// Two checks the starter does not have, added here because the gate is
// strict about them (RULES.txt lines 20 and 32): VIDEO.json must carry
// the video address under the key 'url' — the old file used 'video' and
// the gate reads no other key — and that url must be a YouTube address
// with an 11-character id. The copy itself moves raw bytes, never
// re-serialised, and is re-read and hash-compared before success is
// reported, so the file the gate reads is identical to the one here.
//
// Local run (the kit's documented shape):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const DEST_PATH = join(OUTPUT_DIR, "VIDEO.json");

// The starter reads VIDEO.json from MAKEFUN_BOT_DIR (/bot in the
// grader). If that file is not there — a local run without the env var,
// for example — fall back to the copy sitting beside this file, which
// in the grader is the same /bot directory.
const ENTRY_DIR = dirname(fileURLToPath(import.meta.url));
const BOT_PATH = join(BOT_DIR, "VIDEO.json");
const SOURCE_PATH = existsSync(BOT_PATH)
  ? BOT_PATH
  : join(ENTRY_DIR, "VIDEO.json");

const VIDEO_ID_PATTERN =
  /(?:\/shorts\/|[?&]v=|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/;
const PLAY_CODE_PATTERN = /^makefun-[a-z]+-[a-z]+-[a-z]+$/;

function fail(message: string): never {
  console.error(`clipper-fix-1: ${message}`);
  process.exit(1);
}

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readOrFail(path: string, what: string): Buffer {
  try {
    return readFileSync(path);
  } catch (err) {
    fail(`${what} cannot be read at ${path}: ${(err as Error).message}`);
  }
}

// 1. Read the raw bytes once; the same buffer is validated and hashed,
//    and the copy below moves those exact bytes, unparsed and untouched.
const raw = readOrFail(SOURCE_PATH, "VIDEO.json");

let entry: unknown;
try {
  entry = JSON.parse(raw.toString("utf8"));
} catch {
  fail(`${SOURCE_PATH} is not valid JSON`);
}

if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
  fail(`${SOURCE_PATH} must hold a JSON object`);
}

const record = entry as Record<string, unknown>;

// The gate reads the 'url' key and no other (RULES.txt lines 20, 32):
// a file that only has 'video' is invalid and scores 0 views.
const videoUrl = record.url;
if (typeof videoUrl !== "string") {
  if (typeof record.video === "string") {
    fail(
      "VIDEO.json uses the key 'video' — the gate reads 'url' only, " +
        "so rename that key to 'url'",
    );
  }
  fail("VIDEO.json needs a 'url' value holding the video address");
}
if (!videoUrl.startsWith("https://")) {
  fail("VIDEO.json 'url' must start with https://");
}
const idMatch = videoUrl.match(VIDEO_ID_PATTERN);
if (idMatch === null) {
  fail(`video address has no 11-character YouTube id: ${videoUrl}`);
}
const videoId = idMatch[1];

if (
  typeof record.bounty === "string" &&
  !record.bounty.startsWith("https://")
) {
  fail("VIDEO.json 'bounty' must start with https:// when present");
}
const playCode = record.playCode;
if (typeof playCode !== "string" || !PLAY_CODE_PATTERN.test(playCode)) {
  fail("VIDEO.json 'playCode' must look like makefun-word-word-word");
}

// 2. Make the output directory, then copy the raw bytes as-is.
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(SOURCE_PATH, DEST_PATH);
} catch (err) {
  fail(`VIDEO.json could not be copied from ${SOURCE_PATH}: ${(err as Error).message}`);
}

// 3. Prove the copy: re-read it and compare length and hash with the source.
const copied = readOrFail(DEST_PATH, "copied VIDEO.json");
const sourceHash = sha256Hex(raw);
if (copied.length !== raw.length || sha256Hex(copied) !== sourceHash) {
  fail(`${DEST_PATH} differs from ${SOURCE_PATH} after copying`);
}

console.log(`video: ${videoUrl}`);
console.log(`videoId: ${videoId}`);
console.log(`playCode: ${playCode}`);
console.log(
  `copied: ${SOURCE_PATH} -> ${DEST_PATH} (${copied.length} bytes, sha256 ${sourceHash})`,
);
