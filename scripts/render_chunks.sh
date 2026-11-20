#!/usr/bin/env bash
# Memory-safe 1080p render of a long, layer-heavy composition: video in chunks
# (fresh browser per chunk, lower concurrency), audio separately, then muxed.
# Usage: bash scripts/render_chunks.sh <CompositionId> <output.mp4> [chunk] [concurrency]
set -euo pipefail
COMP="$1"; OUTFILE="$2"; CHUNK="${3:-450}"; CONC="${4:-3}"
BROWSER="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
WORK="out/chunks_${COMP}"; mkdir -p "$WORK"
TOTAL="${TOTAL:-1800}"
: > "$WORK/list.txt"
for ((s=0; s<TOTAL; s+=CHUNK)); do
  e=$((s+CHUNK-1)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  part="$WORK/part_$(printf %04d $s).mp4"
  if [ ! -s "$part" ]; then
    echo "== frames $s-$e"
    npx remotion render src/index.ts "$COMP" "$part" --frames=$s-$e --muted --codec=h264 --crf=15 --pixel-format=yuv420p \
      --concurrency=$CONC --browser-executable="$BROWSER" --log=error
  fi
  echo "file '$(basename "$part")'" >> "$WORK/list.txt"
done
echo "== audio"
npx remotion render src/index.ts "$COMP" "$WORK/audio.wav" --codec=wav --browser-executable="$BROWSER" --log=error
echo "== mux"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/list.txt" -i "$WORK/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest "$OUTFILE"
ffprobe -v error -count_frames -show_entries stream=codec_name,nb_read_frames -show_entries format=duration -of compact "$OUTFILE"
