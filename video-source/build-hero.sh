#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Six quiet camera moves over four stills: present → bite → eye → memory → eye → present.
# The 0.3-second dissolves yield a 10.1-second loop at 25 fps.
ffmpeg -y -hide_banner -loglevel error \
  -i video-source/adulta.png -i video-source/bocado.png -i video-source/rostro.png \
  -i video-source/recuerdo.png -i video-source/rostro.png -i video-source/adulta.png \
  -filter_complex "\
[0:v]zoompan=z='min(zoom+0.00055,1.06)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=55:s=1280x720:fps=25,setsar=1,format=yuv420p[a];\
[1:v]zoompan=z='min(zoom+0.0008,1.08)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=45:s=1280x720:fps=25,setsar=1,format=yuv420p[b];\
[2:v]zoompan=z='min(zoom+0.0014,1.09)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=33:s=1280x720:fps=25,setsar=1,format=yuv420p[c];\
[3:v]zoompan=z='min(zoom+0.00045,1.08)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=75:s=1280x720:fps=25,setsar=1,format=yuv420p[d];\
[4:v]zoompan=z='max(1.08-0.0012*on,1.0)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=33:s=1280x720:fps=25,setsar=1,format=yuv420p[e];\
[5:v]zoompan=z='max(1.06-0.0008*on,1.0)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=50:s=1280x720:fps=25,setsar=1,format=yuv420p[f];\
[a][b]xfade=transition=fade:duration=0.3:offset=1.9[ab];\
[ab][c]xfade=transition=fade:duration=0.3:offset=3.4[abc];\
[abc][d]xfade=transition=fade:duration=0.3:offset=4.42[abcd];\
[abcd][e]xfade=transition=fade:duration=0.3:offset=7.12[abcde];\
[abcde][f]xfade=transition=fade:duration=0.3:offset=8.14,format=yuv420p[out]" \
  -map '[out]' -an -r 25 -c:v libx264 -preset medium -crf 24 -movflags +faststart assets/hero.mp4

ffmpeg -y -hide_banner -loglevel error -i assets/hero.mp4 -an -c:v libvpx-vp9 \
  -deadline good -cpu-used 4 -crf 35 -b:v 0 assets/hero.webm

# Portrait edit: crop each landscape frame to 9:16 before scaling, so faces keep
# their natural proportions. Shift the memory crop from the child to her grandmother.
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
