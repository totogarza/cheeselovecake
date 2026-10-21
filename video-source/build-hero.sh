#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

mode="${1:-all}"
if [[ "$mode" != all && "$mode" != desktop && "$mode" != mobile ]]; then
  echo "Uso: $0 [all|desktop|mobile]" >&2
  exit 2
fi

# Six stable shots over four stills: present → bite → eye → memory → eye → present.
# 0.88-second dissolves give each scene a quieter handoff without camera jitter.
if [[ "$mode" != mobile ]]; then
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -framerate 25 -t 3.04 -i video-source/adulta.png \
  -loop 1 -framerate 25 -t 2.64 -i video-source/bocado.png \
  -loop 1 -framerate 25 -t 2.16 -i video-source/rostro.png \
  -loop 1 -framerate 25 -t 3.92 -i video-source/recuerdo.png \
  -loop 1 -framerate 25 -t 2.16 -i video-source/rostro.png \
  -loop 1 -framerate 25 -t 2.4 -i video-source/adulta.png \
  -filter_complex "\
[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p[a];\
[1:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p[b];\
[2:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p[c];\
[3:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p[d];\
[4:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p[e];\
[5:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p[f];\
[a][b]xfade=transition=fade:duration=0.88:offset=2.16[ab];\
[ab][c]xfade=transition=fade:duration=0.88:offset=3.92[abc];\
[abc][d]xfade=transition=fade:duration=0.88:offset=5.2[abcd];\
[abcd][e]xfade=transition=fade:duration=0.88:offset=8.24[abcde];\
[abcde][f]xfade=transition=fade:duration=0.88:offset=9.52,format=yuv420p[out]" \
  -map '[out]' -an -r 25 -c:v libx264 -preset medium -crf 24 -movflags +faststart assets/hero-desktop-v3.mp4

ffmpeg -y -hide_banner -loglevel error -i assets/hero-desktop-v3.mp4 -an -c:v libvpx-vp9 \
  -deadline good -cpu-used 4 -crf 35 -b:v 0 assets/hero-desktop-v3.webm
fi

# Portrait edit: crop each landscape frame to 9:16 before scaling, so faces keep
# their natural proportions. Shift the memory crop from the child to her grandmother.
if [[ "$mode" != desktop ]]; then
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -framerate 25 -t 2.2 -i video-source/adulta.png \
  -loop 1 -framerate 25 -t 1.8 -i video-source/bocado.png \
  -loop 1 -framerate 25 -t 1.32 -i video-source/rostro.png \
  -loop 1 -framerate 25 -t 3 -i video-source/recuerdo.png \
  -loop 1 -framerate 25 -t 1.32 -i video-source/rostro.png \
  -loop 1 -framerate 25 -t 2 -i video-source/adulta.png \
  -filter_complex "\
[0:v]scale=-2:960,crop=540:960:x=240:y=0,scale=720:1280,setsar=1,format=yuv420p[a];\
[1:v]scale=-2:960,crop=540:960:x=300:y=0,scale=720:1280,setsar=1,format=yuv420p[b];\
[2:v]scale=-2:960,crop=540:960:x=160:y=0,scale=720:1280,setsar=1,format=yuv420p[c];\
[3:v]scale=-2:960,crop=540:960:x='90+4.4*n':y=0,scale=720:1280,setsar=1,format=yuv420p[d];\
[4:v]scale=-2:960,crop=540:960:x=160:y=0,scale=720:1280,setsar=1,format=yuv420p[e];\
[5:v]scale=-2:960,crop=540:960:x=240:y=0,scale=720:1280,setsar=1,format=yuv420p[f];\
[a][b]xfade=transition=fade:duration=0.3:offset=1.9[ab];\
[ab][c]xfade=transition=fade:duration=0.3:offset=3.4[abc];\
[abc][d]xfade=transition=fade:duration=0.3:offset=4.42[abcd];\
[abcd][e]xfade=transition=fade:duration=0.3:offset=7.12[abcde];\
[abcde][f]xfade=transition=fade:duration=0.3:offset=8.14,format=yuv420p[out]" \
  -map '[out]' -an -r 25 -c:v libx264 -preset medium -crf 25 -movflags +faststart assets/hero-mobile-v2.mp4

ffmpeg -y -hide_banner -loglevel error -i assets/hero-mobile-v2.mp4 -an -c:v libvpx-vp9 \
  -deadline good -cpu-used 4 -crf 36 -b:v 0 assets/hero-mobile-v2.webm
fi
