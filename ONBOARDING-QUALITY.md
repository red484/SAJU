# Onboarding media quality

Restored the matching higher-resolution edited sources, retaining their exact shot order, duration and ping-pong loops. MP4 streams are copied without re-encoding and moved to fast-start layout. This is a source restoration, not AI upscaling or 4K reconstruction. Matching background stills also use original 1920px files.

| Element | Previous | Restored | Duration | Edited source |
|---|---|---|---|---|
| c-v1 | 1000×544 | 1440×784 | 1.600s | c-clip1.mp4 |
| c-v2 | 1000×544 | 1440×784 | 5.767s | c-clip2.mp4 |
| d-wide | 1000×522 | 1440×752 | 10.042s | d-clip.mp4 |
| e-v1 | 1000×494 | 1440×712 | 3.042s | e-clip1.mp4 |
| e-v2 | 1000×494 | 1440×712 | 1.333s | e-clip2.mp4 |
| e-v3 | 1000×494 | 1440×712 | 3.292s | e-clip3.mp4 |
| f-v1 | 1000×564 | 1440×812 | 4.875s | f-clip1.mp4 |
| f-v2 | 1000×564 | 1440×812 | 5.708s | f-clip2.mp4 |
| g-v1 | 1000×564 | 1440×812 | 2.458s | g-clip1.mp4 |
| g-v2 | 1000×564 | 1440×812 | 5.042s | g-clip2.mp4 |
| g-v3 | 1000×564 | 1440×812 | 4.750s | g-clip2-hold.mp4 |
| h-v2 | 1000×564 | 1440×812 | 10.042s | h-clip2.mp4 |
| r-v1 | 1000×564 | 1916×1080 | 2.417s | r-clip1.mp4 |
| r-v3 | 1000×564 | 1916×1080 | 10.042s | r-clip3.mp4 |
| seaVid | 1280×722 | 1916×1080 | 10.042s | r-sea.mp4 |
| fxDust | 1000×562 | 1280×720 | 6.000s | fx-dust.mp4 |
| fxBurst | 1000×562 | 1280×720 | 5.005s | fx-burst.mp4 |

Playback and interaction fixes:
- Avoid repeated scene writes and media seeks while awaiting an answer; pause off-screen clips.
- Preserve final native video loops when skipping a transition and re-render when media finishes loading.
- Provide matching result/sea poster frames so loading never places dark text on black.
- Use a non-scrolling stage to prevent focused controls moving the fixed composition.
- Keep inactive question groups inert and ignore scene shortcuts while interacting with controls.
- Preserve all question order, existing visual direction, timestamps and result links.

Validation: 17 H.264/yuv420p fast-start files, exact edited durations, existing route/calendar/personal/result/scroll checks and focused playback regression checks. Browser QA at mobile size covered all onboarding questions, normal and skipped transitions, final cover and sea reveal, result-to-home, reading filters and dialog, library placeholder, calendar month/today/recommended day; no browser error logs were observed. Sample birth answers were not submitted to the result handoff.
