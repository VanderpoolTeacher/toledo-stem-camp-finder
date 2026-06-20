# Weekly Data Refresh Playbook

This is the instruction set for the **weekly automated scrub** of the Toledo STEM Camp Finder.
The scheduled agent (and any human doing a manual refresh) should follow these steps exactly.

**Guiding rule: review-then-publish.** The weekly job NEVER pushes directly to `main`. It opens a
Pull Request. A human reviews and merges → GitHub Pages republishes automatically.

## Repository
- GitHub: `VanderpoolTeacher/toledo-stem-camp-finder`
- Live site: https://vanderpoolteacher.github.io/toledo-stem-camp-finder/
- Source of truth: `data.json` (the website reads only this file)

## Steps

1. **Pull latest** `main`.
2. **Create a branch:** `refresh/YYYY-MM-DD`.
3. **Re-verify every provider in `data.json`:**
   - Fetch each provider's `sourceUrl` and each event's `registrationUrl`.
   - Confirm: the organization still exists, the program still runs, dates/cost/grades are still accurate, phone/email/website still valid.
   - Flag dead links, closed orgs, or changed dates. Correct the data where the new value is verifiable from a primary/official source.
   - If a contact or fact can't be re-verified, do NOT silently keep it — mark it (e.g. set `"verified": false`) and note it in the PR.
4. **Look for new camps/events (lightweight):** check the known providers' pages plus 2–3 fresh searches for newly announced Toledo-metro K-12 STEM camps. Add any well-sourced new entries following the existing JSON schema.
5. **Roll the calendar forward:** when summer 2026 events pass, surface upcoming 2026–2027 sessions as they're published.
6. **Update `meta.lastUpdated`** to today and adjust `meta.providerCount`.
7. **Validate:** `node -e "require('./data.json')"` must succeed; provider/event counts sane.
8. **Commit and open a PR** titled `Weekly STEM data refresh — YYYY-MM-DD` with a body that lists, in plain English:
   - What changed (dates corrected, links fixed, providers added/removed)
   - What could NOT be re-verified (needs human follow-up)
   - Any dead links found
9. **Do NOT merge.** Stop after opening the PR. Notify the owner to review.

## Data schema (one provider)
```jsonc
{
  "id": "kebab-id", "name": "", "category": "<one of meta categories>",
  "topics": ["Robotics", ...], "description": "",
  "location": { "venue": "", "city": "", "state": "OH", "zip": "" },
  "contact": { "phone": "", "email": "", "website": "", "namedContact": "" },
  "gradesAges": "", "cost": "", "free": false, "season": "",
  "verified": true, "sourceUrl": "",
  "events": [
    { "name": "", "focus": "", "topics": [], "start": "YYYY-MM-DD", "end": "YYYY-MM-DD",
      "grades": "", "format": "", "cost": "", "registrationUrl": "" }
  ]
}
```

## Accuracy bar
This data is used by parents to choose camps and by the Tech Council for outreach. A wrong phone
number or date is worse than a missing one. When unsure, mark it unverified and flag it in the PR
rather than guessing.
