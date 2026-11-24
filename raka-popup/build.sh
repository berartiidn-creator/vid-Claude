#!/bin/sh
# One command: picture, sound events, mix, master. Needs the Lemo-Opuscar library (core + music tiers, HDRIs, vcsl + vsco2ce samples).
set -e
LIB=${LIB:-/home/user/lemomo-ai/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
[ -f "$HERE/audio/voiceover.mp3" ] || { echo "put the voice-over at audio/voiceover.mp3"; exit 1; }
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --workers 3 --size 1080x1920 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/the-courage-to-speak-popup.mp4" 30 1
node "$HERE/make_srt.mjs"
