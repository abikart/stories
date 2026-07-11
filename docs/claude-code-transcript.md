User: how much do you know about reading.com app? here is an article about an older version of the app: https://totschoolresources.com/reading-com-app-review/

---
I'll fetch that article and also look up current info on the app so I can compare.


Browsed the web, used a tool
Here's a rundown of what I know, combining background knowledge with that article and some current sources.

What Reading.com is
Reading.com is a learn-to-read app (iOS/Android/web) from Teaching.com — the same company behind Typing.com and Nitrotype. Its distinguishing trait is that it's not a hand-the-kid-a-tablet app: it's built on an adult–child "co-play" model where the parent sits alongside the child, and the app functions partly as a teaching script for the adult. Lessons are unlocked and guided by the parent, with on-screen prompts (the "white text" your article mentions) telling the adult exactly what to say and ask.

Pedagogically it's a systematic synthetic phonics program aligned with "science of reading" principles: explicit direct instruction moving from letter sounds → blending → decoding words → decodable books that only use patterns already taught. A notable design choice is that illustrations in the books stay hidden until after the child reads the text, which prevents picture-based guessing (a deliberate rejection of three-cueing).

What the article you linked describes (July 2024)
The Tot School Resources review covers the app for ages ~5–7 with 10–15 minute lessons following a fixed sequence: alphabet song, letter review with interactive sliders, new letter instruction, "sound stories," letter tracing, comprehension check, decoding practice with sight words, then a co-read book with questions. Its criticisms were that you can't skip ahead past material a child already knows, pacing can be fast for younger kids, and the tracing practice favors right-handed children.

How the current version compares
The core model is unchanged — it's still scripted co-play phonics — but current reviews describe a more built-out product:

Content: 99 structured phonics lessons, ~60 decodable digital books, plus videos, games (only four, per one review), and printable PDFs. Lessons now run more like 15–20 minutes and cover letters, blends, short/long vowels, and digraphs.
Accounts: up to 3 children per family subscription.
Pricing: around $14.99/month or $89.99/year for families, with a 7-day free trial on the monthly plan. There's also a schools/licensing side where pricing is quote-based, which one reviewer dinged for opacity.
Consistent praise: faithful structured phonics, decodables tightly aligned to taught skills, and the adult-in-the-loop design guaranteeing real feedback.
Consistent criticism: the same adult-in-the-loop design is its biggest cost — it demands significant parent time and doesn't work as independent screen time. One 2026 review even called it "an outdated digital reading tutor," arguing the format feels dated next to gamified competitors. It's generally recommended for homeschoolers and engaged parents of pre-K through 1st graders, and not for anyone wanting a self-directed app like Duolingo ABC or Khan Academy Kids.
So the article you linked is still a fair description of the lesson experience — the fundamentals haven't changed — but lesson count, book library, pricing, and multi-child support have all evolved since mid-2024.

Sources:

Tot School Resources — Reading.com App Review
The Learning Standard — Reading.com Review (2026)
Brighterly — How Much is Reading.com in 2026?
Brighterly — Reading.com Reviews 2026
Learning Reading Hub — Reading.com app review
Pictures Are For Babies — Reading.com Review
Is this research for its own sake, or are you thinking about building something in this space (given we're in your stories project)?

----

User: I am thinking about building something in this space. But something very different, the reference reading app has a storeis section, where its a story expressed in a bunch of pages, kinda like a slideshow, each page has an illustration and some prose, the kids try to the read the words directly, or tap on the prose which opens up a slider underneath the words, as the user slide through a word, the letters are highlighted and that helps them read easier. I want to build an app, in the domain "stories.sh" that I own, its basically a stories app, but with a heavy "reading" angle to it, predominantly kids targeted stories. I am thinking, each story has multiple modes, a interactive mode, where the kid slide and highlight like in the reading.com app, a read aloud mode where the stories are read aloud slowly by the app autonomously, a read aloud + interactive mode, where as the slider gets moved, stories are read aloud etc. One of the most important part of this app is the illustration, instead of static image, this will be a interactive illustration, either via videos that syncs with slider / scroll or actual interactive hand built experience that we build in code. The app will initially be web based, we could build this for mobile later. Also, since these stories can be read aloud by the app, we could post those as videos on youtube and monetize that as well. We need a AI based workflow to 1. build the app itself,  2. a framework / CMS to author these stories etc. Refernces: https://x.com/the_cyw/status/2075033876930724339 (github skill: https://github.com/oso95/scroll-world), another tweet that talks about how multiple tiny videos are orchestrated together to make this scene interactive, https://x.com/watanabeeeeee/status/2055227942058525110 (and the webpage itself: https://www.floema.com/en/about). Take these as a thought dump. What I want is to evolve this into a full set of requirements for a POC for a highly engaging, delightful and monetizable app for stories.sh first , and I will start a loop overnight to get the poc done based on this. Go over the details provided, take full creative liberty and come up with evolved app idea, feature set etc.


----

This is a great seed. Let me dig into your references and the current state of the repo before writing up the evolved concept and POC requirements.


Ran a command, browsed the web
stories.sh concept & POC requirements

Created 8 files
Docs are written. Let me save the project context to memory so future sessions (including the overnight loop) have it.


Saved 2 memories
Done — I've evolved your thought dump into a full founding doc set for stories.sh, written into the repo as README.md plus seven docs under docs/. Here's the shape of what I landed on.

The creative unlock
Your references all share one primitive: a scrub gesture driving a media timeline (reading.com's word slider, scroll-world's scroll-scrubbed AI video, floema's drag timeline). The evolved concept fuses them into a single mechanic: the reading slider and the illustration's animation timeline are the same timeline. Dragging one finger under the words highlights graphemes, speaks the sounds, and scrubs the scene — "the fox hops" makes the fox hop on that exact word. Two additions I took liberty with:

The Spark — the scrubber handle is a glowing wisp with personality. It's the mascot, the cursor, and the reading guide in one; when a page is finished it flies into the illustration.
Wake-the-world — every page starts dormant (desaturated, frozen, silent) and reading wakes it: color floods in, ambience starts, tap-surprises arm. This solves the same picture-guessing problem reading.com solves by hiding pictures, but inverts it into the reward loop — and it makes the story literally unreadable-forward without reading. Reading is the game controller.
What's in the docs
01-vision.md — the magic loop, brand (leaning into the .sh — the CMS is literally terminal + AI + git), positioning: not a curriculum like reading.com's 99 scripted lessons, but the library of living decodable stories.
02-product.md — three modes (Read it / Read to me / Read along) as three drivers of one timeline; grapheme-aware highlighting (sh lights as a unit, not two letters); tap-a-word phoneme sound-outs; monetization (freemium + YouTube funnel + future personalized "starring Maya" stories).
03-poc-requirements.md — the loop's charter: milestones M0–M8 each with a definition of done, fixed tech decisions (Next.js + TS, hand-rolled scrub engine, framework-agnostic engine core), and guardrails — notably that the whole build must succeed with zero paid API keys (TTS falls back to macOS say, frame scenes to a procedural generator), so the overnight run can't stall on credits.
04-architecture.md — the one-timeline/many-drivers model and the Scene Contract (mount/seek/cue/setAwake) that makes coded scenes and frame-scrub scenes interchangeable.
05-story-format.md — the Storyspec JSON schema with a worked example.
06-content-pipeline.md — the AI authoring workflow, whose crown jewel is a decodability linter: it enforces that every word is decodable within the story's declared phonics scope, which is what lets AI mass-produce stories that are pedagogically honest.
07-poc-stories.md — page-by-page briefs for three stories chosen to cover every engine feature: The Fox on the Box (flagship coded scene), The Ship in the Rain (frames pipeline + digraphs), Pop! Pop! Pop! (one popcorn kernel pops per word read — the tightest word→world feedback).
I couldn't fetch the two X posts directly (login wall), but the scroll-world repo and floema.com covered the techniques they showcase, and both are cited in the docs where their ideas landed.

Files are written but not committed — commit when you're happy with them. When you're ready to kick off the overnight run, something like /loop with "execute the next incomplete milestone in docs/03-poc-requirements.md, verify in browser, commit, continue" is exactly the shape that doc was written for. One thing worth a skim before you start: the three story drafts in doc 07 — the text is linter-fodder, but the scene beats define what gets built.

----

Do you have all the capabilities and accesses to autonomously  build out this POC as a loop? do you have the ability to generate images / assets needed?


---

Good question to ask before an overnight run — let me actually verify the environment instead of guessing.


Ran a command, read a file
Mostly yes — and I just verified rather than assumed. Here's the honest capability map:

What I can do autonomously ✅
Build the app end-to-end: full file/shell access, Node 24 + pnpm 10 are installed, and the whole M0–M8 plan is code I can write and run.
Verify in a real browser: I have preview tools that start the dev server, screenshot, click, dispatch input, inspect computed styles, and resize to iPad/mobile viewports — so the "verify each milestone in-browser" guardrail is genuinely executable, including testing the scrubber feel via pointer events.
Narration/TTS: macOS say is present — the zero-key fallback in the docs works.
Video render: ffmpeg 8.1 is installed. Playwright's Chromium isn't downloaded yet, but that's a one-time playwright install chromium (~150MB) during M7.
Sound effects/ambient: synthesizable (Web Audio at runtime, ffmpeg filtergraphs for files).
Self-pacing loop: the /loop machinery is available; doc 03 was written as its charter.
Asset generation — the nuanced part ⚠️
I have no AI image/video generation in this session: no image-gen MCP connected, no API keys in the environment (I checked — no OpenAI/Replicate/fal/ElevenLabs), no Higgsfield CLI. What I can generate is code-drawn art: hand-authored SVG scenes and characters, procedural Canvas frame sequences, SVG-derived stickers and covers. The docs were deliberately scoped so the POC needs exactly that and nothing more — expect a charming flat-illustration style, not painterly floema-grade art.

If you want a big quality jump overnight, drop keys into a .env before starting, in this order of impact:

ELEVENLABS_API_KEY — biggest single uplift. say narration is functional but robotic; warm narration transforms the demo, and the pipeline adapter is already specced for it.
An image key (OpenAI gpt-image, or Replicate/fal for Flux) — painterly backdrops and stickers; coded scenes can composite animated SVG characters over AI-generated backgrounds.
Higgsfield CLI + credits — the full scroll-world video-scrub pipeline; nice-to-have, not needed since the frames backend is proven procedurally.
The one real blocker: permissions 🔴
The project allowlist currently permits almost nothing (just WebSearch and one WebFetch domain). In default permission mode, an unattended overnight loop would stall on its first pnpm install prompt. Two fixes:

Run the loop session with bypass-permissions / auto-accept mode, or
Have me expand .claude/settings.local.json now with an allowlist for the build toolchain (pnpm, node, ffmpeg, say, playwright, git commit, file edits, localhost fetches).
Out of reach regardless (already out of POC scope, just confirming): deploying to stories.sh (no Vercel auth) and uploading to YouTube — both stay manual.

Want me to set up the permission allowlist now so the overnight run doesn't stall? That's the only missing piece I can fix from here.

----

User: yes, set up the permissions and I'll add my ElevenLabs key

----
Created 3 files, ran a command, used a tool
Permissions are set up and validated. Here's what's in place:

Allowlist (.claude/settings.local.json, 45 rules, JSON validated) — your two existing entries preserved, plus:

Build toolchain: pnpm, npm, npx, node, tsx, tsc, git, cd
Media pipeline: ffmpeg, ffprobe, afconvert, say, sips, playwright
File/shell utilities: mkdir, cp, mv, rm, sed, find, jq, lsof, curl, and friends — plus blanket Edit/Write so file changes never prompt
Web: localhost fetches (dev-server checks), Next.js/MDN docs, and the ElevenLabs domains
Deny rules as guardrails: git push (the loop commits locally per milestone but never publishes — remove this line whenever you want to push) and sudo.

Two honest caveats: rm and curl are broadly allowed because a permission prompt at 3am means the loop stalls until morning — that's the trade for unattended operation. If that's too loose for your comfort, delete those two lines and the loop will just pause on those rare cases.

For your ElevenLabs key: I also created .gitignore (secrets, node_modules, build output — and .claude/settings.local.json itself) and .env.example. Put your key in .env at the repo root:

ELEVENLABS_API_KEY=sk_...
It's gitignored, so milestone commits will never pick it up, and the narrate script is specced to read it from process.env with the say fallback when absent.

Everything's ready for the overnight run. Start it with something like:

/loop execute the next incomplete milestone in docs/03-poc-requirements.md — verify in browser, check acceptance criteria, commit, then continue to the next milestone
Since these docs and settings are uncommitted, you may want a git add -A && git commit of the founding docs first (or just let the loop's M0 commit sweep them in — either works).


----

User: I have added elevenlabs key, lets skip the image key and higgsfield CLI for now, make do with what you have now. For the design system of the app, follow something close to the design system here: https://board.fun. if you do a quick check if you have everything you need. I will run the loop



----
I'll do the final readiness check: verify the ElevenLabs key actually authenticates, capture board.fun's design language into a doc the loop can follow (the loop runs as a fresh session — it only knows what's in the repo), and confirm nothing else is missing.


Ran 5 commands, browsed the web, created a file
Now wiring it into the existing docs so the loop can't miss it:


Edited 2 files

Saved a memory
All set — full readiness check passed. Here's the final state:

ElevenLabs ✅ — Your key works. One subtlety worth knowing: it's a scoped key (TTS permissions only), so account endpoints return 401 — my first check hit that and looked like a failure. The two endpoints the pipeline actually needs both verified with real calls: plain text-to-speech returned a valid MP3, and /with-timestamps returned per-character alignment (that's what drives karaoke highlighting and word-slice audio). I noted the scoping in docs/03-poc-requirements.md so the loop doesn't misdiagnose a 401 as a broken key, plus an instruction to cache generated audio so re-runs don't burn quota.

Design system ✅ — I pulled board.fun's actual tokens from their live CSS rather than eyeballing screenshots: warm cream paper #fffef1, off-black ink #272831, their exact candy accent palette (green/blue/purple/orange/yellow), their radius scale, and their type pairing (ITC Kabel display + grotesque body). That's now docs/08-design-system.md — "Warm paper & candy" — adapted for early readers: free font equivalents (Quicksand for display, Inter for UI, Lexend for the reading prose — it doubles as the dyslexia-friendly choice), grapheme highlight states, dormant-scene treatment, per-story accent colors, and component recipes for the scrubber, Spark, and buttons. Doc 03 now instructs the loop to bake these tokens in at M0, not retrofit at M8.

No image keys ✅ — Doc 03 now says explicitly: all art is code-drawn, don't attempt AI image/video APIs. The three stories were already designed for that.

Complete readiness picture: toolchain verified (node/pnpm/ffmpeg/say/git), permissions allowlisted with git push and sudo denied, secrets gitignored, ElevenLabs live, design system specced, charter docs 01–08 in place, and the memory file updated so any session knows the context.

You're clear to launch. From a fresh session in this repo:

/loop execute the next incomplete milestone in docs/03-poc-requirements.md — verify in browser against the acceptance criteria, commit, then continue
Good night — you should wake up to a fox on a box. 🦊


/loop
  execute the next incomplete milestone in docs/03-poc-requirements.md — verify in browser against the acceptance criteria, commit, then continue.

No interval given, so I'm in self-paced dynamic mode: I'll execute the next milestone now (that's M0 — Scaffold & schema, since the repo has no code yet), verify in-browser, commit, then schedule the next iteration to continue with M1.

Checked repo state before scaffolding
Fresh repo, no commits — M0's commit will include the founding docs. Scaffolding now:


Created 5 files
Config in place. Kicking off pnpm install in the background while I write the source files:


Ran a command, created 2 files
Background shell completed
Install dependencies
Dependencies installed cleanly. Now the app shell with the design tokens from doc 08, and the story data:


Created 7 files
All source files written. Starting the dev server and verifying in the browser:

Used Claude Browser: preview start
Port 3000 is occupied by another process on your machine — our app doesn't need a specific port, so I'll let the preview assign one:


Edited a file, used 3 tools
Prose renders from data with per-grapheme spans and whole sight words — exactly the M0 contract. Quick visual + console check:


Ran a command, created 4 files, used 5 tools
Engine core done. Now the React binding layer — measurement, painter, prose, scrubber, reader:


Created 4 files, edited a file
Now wiring the read route to the Reader and adding the digraph test page:


Created 2 files
Verifying in the browser — navigating to the reader and driving the scrubber with real pointer events:


Edited a file, used 5 tools
Page is healthy — the eval tool likely can't await a long-running promise. Splitting into fire-then-poll:


Used 5 tools
Both still pending — something's throttling timers or rAF. Checking visibility state, which gates both:


Edited 4 files, ran 2 commands, created 4 files, used 11 tools
Now verifying M2's acceptance criteria in the browser — page 6's jump-on-"hops" and the wake:


Used 4 tools
End state confirmed: filter fully lifts (none), dusk overlay at 0.16, fireflies active. Capturing the woken scene, then the dormant contrast:


Edited 3 files, ran 2 commands, created 2 files, used 8 tools
Background shell completed
Generate ElevenLabs narration + word timestamps for story 1
Narration generated — story.json now carries narration entries (the reformatting is the script's own JSON rewrite). Checking the output and files:


Ran a command, created 4 files, edited 3 files, used 3 tools
Route, guard, decode, and slice-RMS all pass — "fox" has real speech (RMS 0.069) exactly in its timestamped window. Now the in-app behavior:


Edited 2 files, used 23 tools
Orange accent with white text — the stale-HMR theory confirmed. Checking fit at the iPad viewport specifically:


Edited a file, ran a command, created 3 files, used 4 tools
Now updating the Reader to the lifted-mode contract:


Created 2 files, edited 2 files
Adding the shelf stats to the library, then verifying the full flow:


Created a file, edited a file, ran a command
Typecheck clean. Now the end-to-end verification — start screen through celebration:


Used 6 tools
Auto-advance works. Library shelf check:


Edited a file, ran a command, created a file, used 4 tools
Now the procedural frame generator — a pure-JS shader-style renderer piped through ffmpeg to WebP sequences (no new dependencies):

Created
gen-frames.ts
+318
-0
Fixing a garbled expression I introduced in the pixel loop (it accidentally computes the right value, but it's nonsense):


Edited 2 files, ran 2 commands, created a file
EPIPE means ffmpeg died early — checking its stderr at the top of the log:


Ran 2 commands
No libwebp in this ffmpeg build. Checking encoders and whether macOS sips can write WebP as a second step:


Ran 2 commands, edited 3 files
While frames render, wiring the scene loader and ship sticker:


Edited 2 files, read a file
Background shell completed
Render ship frames (PNG) then narrate
Frames and narration generated. Finishing the wiring:


Edited 3 files, ran a command
All assets generated. Verifying story 2 end-to-end in the browser:


Edited 2 files, ran a command, used 13 tools
Fixed. Logging decisions and committing M5:


Edited a file, ran a command, created 2 files, used a tool
Now the linter — the pipeline's gatekeeper — and the scaffolder:


Created 2 files, edited a file
Now the pipeline dry run: scaffold story 3, lint the two existing stories as a baseline:

Scaffold story 3 and lint all stories
The linter works: both existing stories pass clean, and the scaffold fails with actionable next-step messages. Writing the real story-3 pages — tokens without segmentations, so the segmenter earns its keep:


Created a file, ran 2 commands
Segmenter filled all 20 tokens with correct case preservation ("Pip" → ["P","i","p"]) — the M5 lesson is enforced. Narrating in the background while I build the popcorn scene:


Ran a command, created a file
Background shell completed
Narrate story 3 via ElevenLabs
Narration done. Registering the scene, adding tap forwarding, Pip's sticker, and the README authoring section:


Edited 2 files
The tap handler needs the scene held in a ref — wiring that:


Edited 6 files, ran 3 commands, used 9 tools
Background shell completed
Add Playwright and download Chromium
Playwright is in. Now the RenderStage — chrome-free 16:9 with the deterministic seek API:


Created 2 files
Now the capture script and the render-stage type overrides:


Created a file, edited 3 files, ran 3 commands, used 4 tools
Are you done? there seems to be one running task stuck?


Ran 3 commands, edited a file
The fixed render is running now (previous stuck run killed and cleaned up). To answer your question directly:

Status: 7 of 9 milestones done, two in flight. Committed so far — M0 scaffold, M1 Spark scrubber, M2 Scene Contract + fox scene with wake-the-world, M3 ElevenLabs narration + three reading modes, M4 full story player with celebrations/stickers/ambient, M5 frames backend + procedural "Ship in the Rain", M6 decodability linter + content pipeline + "Pop! Pop! Pop!". All three stories pass the linter and play end-to-end in all modes.

What stuck: M7's video capture. I'd used Chromium's CDP virtual-time API to make animation timing frame-exact, and it deadlocked page.screenshot() at frame 60/943 — paused virtual time starves the compositor of BeginFrames. I've removed virtual time (capture runs near-realtime at ~35fps ≥ the 30fps playback rate, so animation beats land at approximately correct speed — the honest trade, logged for DECISIONS.md) and the render is re-running in the background now.

Remaining after this: verify the MP4 (streams, duration, frame extraction, audio levels), commit M7, then M8 — the stories.sh landing page and the whole-app polish pass. The loop's fallback wakeup is still armed; the render's completion notification will wake me sooner, and I'll continue automatically.

Background shell completed
Re-run render without virtual time
Render completed. Verifying the MP4 thoroughly:


Ran 4 commands, read 2 files, edited a file
While it renders, verifying the fix live on the preview's render route:


Used 3 tools
Background shell completed
Re-render with Spark rail-width fix

Ran a command, read a file
The Spark now rides mid-rail directly under the active word. M7's acceptance bar is met — a watchable 31.4s 1080p MP4 with synced karaoke. Committing:


Edited a file, ran a command, used a tool
The final milestone: M8 — landing page & polish. Doc 03 explicitly says to run the interface-polish skill for this pass, so loading it first to inform the work:


Created 3 files, edited a file, used a tool
Applying the remaining skill fixes — press scale, hit areas, tabular numbers — and putting the settings into the story header:


Edited 3 files, ran a command
Verifying the landing at both required viewports:


Used 2 tools
The hero and live demo render beautifully. Now the required viewport checks plus toggle/demo verification:


Used 3 tools
All toggles and the live demo pass at 1366×1024. Full-page visual of the library and modes sections:


Ran a command, used 2 tools

Saved a memory
Used ScheduleWakeup
The loop is stopped — no monitors were armed, so nothing left to clean up. The full POC summary is above; everything is committed on main and the dev server is still running in the preview pane whenever you want to play.

This is good. Can we also support the same formats, but with video instead of svg animation? Like if you come up with a storyline, and the infra to sync sliders / read along audio with prompts to generate videos, i can generate the videos in grok imagine and give it to you? that way, we can have visuals in many different styles compared to this plain looking interaction? like for example water color art style, or studio gibli style etc?

Absolutely — and this is exactly what the architecture was built for. The scene system is backend-agnostic, so video slots in behind the same contract: your Grok Imagine clips get ingested into scrub-able sequences, and all the existing sync (slider → graphemes → audio → scene) works unchanged. The one hard requirement is on the generation side: clips must be single continuous shots with slow, monotonic motion (a slider scrubs them — a cut or a loop would feel broken), and the prompt pack I generate will bake those constraints in.

Here's what I'm building this turn: an ingest script (video → frames via ffmpeg, story.json rewired automatically), a prompt-pack generator, and a brand-new story written for this workflow — "The Boat in the Mist", a Ghibli-watercolor piece with a singing fish, fully tokenized, linted, and narrated, waiting only for your videos.


Edited 2 files
Now the two pipeline scripts — video ingestion and the prompt-pack generator:


Created 3 files, edited a file, ran 3 commands
Ingest works — 72 frames at 12/sec, scene rewired, cues preserved. The underscore in the test id would trip the content route's id regex, so renaming for the browser check:

Renamed test story for route-compatible id
Background shell completed
Narrate boat story via ElevenLabs

Used 3 tools
That probe hit a static green region of the test pattern — resampling with a whole-frame hash:

Used Claude Browser: preview eval
The ingested video scrubs — three distinct frame hashes at t=0/0.5/0.95. Pipeline proven. Cleaning up the test story and finishing the docs + sticker:


Ran a command, edited 3 files, created a file
Final browser check — the boat story on the landing and playable pre-video:


Ran 2 commands, edited a file, used 3 tools

Saved a memory
Done and committed (d872af0) — video-backed stories are now a first-class path, and there's a story waiting for your clips.

How it works from your side
Open content/the-boat-in-the-mist/VIDEO-PROMPTS.md — five ready-to-paste Grok Imagine prompts for a new story I wrote for exactly this: The Boat in the Mist (a lantern-lit rowboat and a friendly singing fish in dawn fog, soft Ghibli-watercolor). Each prompt repeats the same style block, world, and character sheet so the pages stay visually continuous.
Generate the five clips, save them as content/the-boat-in-the-mist/video-drops/p1.mp4 … p5.mp4.
Run pnpm ingest-video the-boat-in-the-mist — ffmpeg explodes each clip into a scrub-able frame sequence (12 samples/sec, 1280×720) and rewires the story to the frames backend automatically, cues preserved. Then it just plays: slider scrubs your watercolor footage, graphemes highlight, narration slices speak (already ElevenLabs-narrated and lint-clean), and pnpm render will make the YouTube MP4 of it too.
The whole loop is proven — I ran a synthetic clip through ingest and verified the frames scrub in the browser before deleting the test.

The one thing that matters when generating
The prompts bake this in, but it's worth knowing why: each clip must be a single continuous shot with slow, strictly-forward motion that ends settled — no cuts, no loops, no camera shake, no on-screen text. A child's finger scrubs the clip back and forth; monotonic motion always feels causal under a slider, while a loop or cut reads as broken. Aim for 5–8 seconds, 16:9, 720p+.

Restyling the existing stories
pnpm video-prompts fox-on-the-box --style ghibli (or watercolor, claymation, paper-cutout, or any freeform style text) works today — pages without an authored shot list get derived drafts marked TODO; add a videoBrief to their story.json for prompts as tight as the boat's. And to spin up more video-first stories: pnpm new-story → write pages + videoBrief → segment → lint:stories → narrate → video-prompts → generate → ingest-video.

One honest note, logged in docs/09-video-scenes.md: clips become frame sequences rather than <video> elements (guaranteed-smooth scrubbing everywhere, ~5–10MB/page); a native video backend for long ambient shots is the listed next step if we want worlds that keep moving while the slider rests. Go make the fish sing 🎣


----

User: I have created the videos at /Users/xzo/Downloads , named p1 to p5