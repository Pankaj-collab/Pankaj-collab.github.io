# Family Quest

A lightweight, static, gamified task tracker for families or small teams. No backend required — data is stored in the browser via LocalStorage.

## Features

- Dashboard per user with five default quests
- Mark quests complete and earn XP
- Leaderboard sorted by cycle XP
- Admin panel to manage members, reset cycles, and configure default quests

## Getting started

1. Clone or create a new repo and copy these files into the root.
2. Commit and push to GitHub.
3. Enable GitHub Pages:
   - Settings → Pages → Source: `Deploy from a branch`
   - Branch: `main` (or `master`) and folder: `/root`
4. Visit your site: `https://pankaj-collab.github.io/`

## Data model

- LocalStorage key: `FQ_v1`
- State fields:
  - `members`: array of `{ id, name, avatarSeed }`
  - `defaultQuests`: array of `{ id, title, desc, xp }` (five default entries provided)
  - `userQuests`: per-member array mirroring `defaultQuests` with `{ completed, completedAt }`
  - `xpTotals`: per-member XP total for current cycle
  - `currentUserId`: user selected in UI

## Notes

- To change the default five quests, use the Admin panel.
- To assign updated defaults to members, click "Assign default quests" per member.
- Cycle reset sets all quests to incomplete and XP to zero for all members.
