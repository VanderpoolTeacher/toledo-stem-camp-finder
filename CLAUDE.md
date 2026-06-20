# Tech Council — Education Project (Toledo STEM Camp Finder)

## What this is
This folder is a **git repo** (`VanderpoolTeacher/toledo-stem-camp-finder`) that powers a public
website helping families find **K-12 STEM camps & programs** in the **Toledo, Ohio metro**, and
serves as the Tech Council Education group's **partnership-outreach** dataset.

- **Live site:** https://vanderpoolteacher.github.io/toledo-stem-camp-finder/
- **Hosting:** GitHub Pages (auto-deploys from `main`)

## Geographic scope
Toledo + Lucas County and nearby suburbs: Sylvania, Maumee, Perrysburg, Bowling Green, Oregon,
Holland, Waterville.

## Files
- `data.json` — **source of truth.** 25 providers with nested events. The website reads ONLY this file.
- `index.html` / `styles.css` / `app.js` — the camp-finder site (vanilla JS, no build step). Parent-facing: search + filters (topic, category, month, free), by-date and by-organization views.
- `Toledo-STEM-Providers-Master-Directory-2026-2027.md` — full human-readable provider directory (contacts, sources, verification flags).
- `Toledo-STEM-Events-List-2026.md` — events list / calendar with registration links.
- `REFRESH-PLAYBOOK.md` — instructions for the weekly data refresh.

## Weekly auto-refresh (review-then-publish)
A local scheduled task (`toledo-stem-weekly-refresh`, Mondays ~7 AM) re-verifies every provider/event,
flags dead links and stale data, hunts new camps, and **opens a Pull Request** — it never merges.
Review the PR and merge to publish. The task runs when this Claude app is open (or on next launch).

## Conventions
- `data.json` is canonical; keep the two `.md` files roughly in sync when adding providers.
- Cite a **source URL** for every provider/event. Prefer primary/official pages.
- Flag any contact that can't be verified (`"verified": false`) rather than presenting it as confirmed.
- Preview locally before publishing (static server over the folder, e.g. `python3 -m http.server`).

## Still-unconfirmed leads (worth follow-up)
TTLMakerspace "Junior Worldbuilders", T.E.A.C.H. & LEAP homeschool co-ops, Mathnasium, Engineering
for Kids, Mad Science, Metroparks Toledo, Girl Scouts of Western Ohio, CoderDojo/Girls Who Code.
