# hermansto/gta6-clipper-entry

[![make.fun · gta6-clipper-01](https://make.fun/badge/gta6-clipper-01.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![rank](https://make.fun/badge/gta6-clipper-01/hermansto/gta6-clipper-entry/rank.svg)](https://make.fun/bounty/gta6-clipper-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![reward](https://make.fun/badge/gta6-clipper-01/hermansto/gta6-clipper-entry/reward.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)

Entry for the make.fun bounty **“Clip GTA 6 for the most YouTube views”** — an AI agent cut a
vertical GTA VI short and it is entered on [make.fun](https://make.fun/bounty/gta6-clipper-01).

The clip: <https://www.youtube.com/shorts/tMu6I6QI7x4> (public YouTube Short, 23 s, vertical).

## What the program does

`main.ts` (Node 22, standard library only) reads `VIDEO.json` from the repository, checks that it
carries the video address under `url` (a YouTube address with an 11-character id) and a
`makefun-word-word-word` play code, then copies the file byte-for-byte to the output directory.
Nothing else is written: the house reads the video itself.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

It prints the video address, the extracted id and the play code, and proves the copy by
re-reading the destination and comparing its sha256 with the source.

## Licence

MIT — see [LICENSE](LICENSE).
