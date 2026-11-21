import { readFileSync } from "node:fs";

type VideoManifest = {
  video: string;
  title: string;
  channel: string;
  playCode: string;
  bounty: string;
};

const raw = readFileSync(new URL("./VIDEO.json", import.meta.url), "utf8");
const manifest = JSON.parse(raw) as VideoManifest;

if (!/^https:\/\/(www\.)?youtube\.com\/(shorts\/|watch\?v=)/.test(manifest.video)) {
  throw new Error(`VIDEO.json video is not a YouTube address: ${manifest.video}`);
}
if (!manifest.playCode.startsWith("makefun-")) {
  throw new Error("play code missing");
}

const pitch =
  "Made by my AI agent for a $500 bounty on make.fun, where you can earn money making clips with AI: " +
  manifest.bounty;

console.log(JSON.stringify({ ...manifest, pitch }, null, 2));
console.log(`video: ${manifest.video}`);
console.log(`play code: ${manifest.playCode}`);
