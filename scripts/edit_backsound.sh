#!/usr/bin/env bash
# Edit the supplied backsound ("bumper opening lighting show.mp3", 78.9 s) to
# exactly 60 s. One musical cut on a downbeat (~111 BPM): music 39.75 s jumps to
# 59.19 s (exactly 9 bars), so the second drop lands at video 41.26 s (final
# branding) and the closing hit at 53.76 s (final hold). 40 ms crossfade.
#
# Video time = music time            (t < 39.75)
# Video time = music time - 19.44    (t >= 39.75)
set -euo pipefail
SRC="public/audio/source/bumper opening lighting show.mp3"
OUT="public/audio/backsound_60s.wav"
CUT_A=39.79   # end of first part (includes 40 ms crossfade overlap)
CUT_B=59.19   # resume point in the source
ffmpeg -v error -y -i "$SRC" -filter_complex \
  "[0:a]atrim=0:${CUT_A},asetpts=PTS-STARTPTS[a];[0:a]atrim=start=${CUT_B},asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=0.04:c1=tri:c2=tri,afade=t=out:st=58.6:d=0.82,apad=whole_dur=60,atrim=0:60" \
  -ar 48000 -ac 2 "$OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$OUT"
