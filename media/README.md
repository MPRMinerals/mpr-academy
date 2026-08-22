# media

Drop the video and poster files here. `index.html` looks for these exact names.
When a file is absent the site falls back to the coded animation, so the page is
complete and correct with this folder empty.

| File | Slot | Notes |
|---|---|---|
| `hero-mine.mp4` | hero, landscape | picked when the viewport is 760 px wide or more |
| `hero-mine.webm` | hero, landscape | same cut, served first where supported |
| `hero-mine-mobile.mp4` | hero, portrait | picked below 760 px |
| `hero-mine-mobile.webm` | hero, portrait | same cut |
| `hero-poster.jpg` | hero | first frame, shown while the video loads |
| `plant.mp4` | cinematic band | landscape only |
| `plant.webm` | cinematic band | same cut |
| `plant-poster.jpg` | cinematic band | first frame |

Requirements for every clip:

- Muted, looping, no audio track at all. Strip the audio stream, do not just silence it.
- Under 1.5 MB each. Short loops of six to ten seconds cut tighter than long ones.
- Landscape cuts around 1920 by 1080. The portrait cut around 1080 by 1920, framed so
  the subject survives a hard crop.
- The hero veil darkens the left side heavily. Frame the action right of centre.

One rule on content: do not use footage or stills that a viewer would read as an MPR
site unless the footage actually shows one. Generic industrial or landscape material is
fine as atmosphere, but nothing on the page claims it depicts a specific operation, and
nothing should be added that does.

Suggested encode, audio removed and faststart enabled:

```
ffmpeg -i source.mov -an -vf "scale=1920:-2" -c:v libx264 -crf 30 -preset slow \
       -movflags +faststart -t 8 hero-mine.mp4

ffmpeg -i source.mov -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 38 -b:v 0 \
       -t 8 hero-mine.webm

ffmpeg -i source.mov -ss 2 -frames:v 1 -vf "scale=1920:-2" -q:v 4 hero-poster.jpg
```
