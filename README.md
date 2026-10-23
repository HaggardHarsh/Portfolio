# SIDEQUEST

An ASCII portfolio prototype: explore a procedurally drawn text island, visit four portfolio locations, earn discovery XP, find two secrets, and use a working command line. Plain HTML, CSS, JavaScript, and Canvas. No build step.

## Run

`npm start` serves `dist/` at http://localhost:4173. `npm test` checks discovery awards, saved-state validation, movement, reachability, and terminal commands.

## Customize

- `dist/app.js`: the four portfolio sections, sample projects, contact details, and terminal interactions.
- `dist/style.css`: green and amber palettes, responsive layouts, dialog styles.
- `dist/game.js`: island boundary, locations, movement, progress, and terminal parser.
- `dist/index.html`: page copy, navigation, map landmarks, quest log.

Portfolio content is illustrative, with no invented personal claims. Replace the example email, projects, toolkit, and résumé template before a real launch. The prototype deliberately uses `noindex` until the personal content is ready. Exploration is stored only in the visitor's browser; it works when browser storage is unavailable. The only external asset request is optional Google Fonts; system monospace fonts provide the fallback.

## Controls

Focus the world, then use WASD or arrow keys to move; E or Enter visits a nearby place. Clicking any place or quest opens it directly. Mobile movement controls are below the map. The terminal supports `help`, `about`, `projects`, `skills`, `contact`, `ls`, `whoami`, `map`, `theme`, `sound`, `clear`, and `cat README.md`. History uses Up/Down; unique command prefixes complete with Tab. Reduced-motion preferences stop ambient animation and walking animations.

Two secrets: investigate the map's `?`, or run `sudo make coffee`.

The Site identity is retained in `.openai/hosting.json` for future revisions.
