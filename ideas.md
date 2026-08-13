# QuickTap Design Brainstorm

## Approach 1 — Terminal Sprint
Very dark, high-contrast competitive interface with fluorescent green indicators, technical labels, and an arcade timing-grid feel. The emotional intent is urgency, focus, and shared momentum.

**Probability:** 0.07

## Approach 2 — Signal / Silence
A quieter black-and-white editorial system where neon green appears only at moments of action: the tap target, wins, and live status changes. The emotional intent is controlled anticipation followed by a sharp release.

**Probability:** 0.03

## Approach 3 — Team Relay
A kinetic, event-ready system with oversized score typography, split-screen competition cues, and broadcast-inspired team markers. The emotional intent is social energy, instant recognition, and playful rivalry.

**Probability:** 0.08

# Selected Direction — Signal / Silence

## Design Movement
Contemporary Swiss International Style fused with early digital stopwatch interfaces: strict typographic hierarchy, visible timing data, generous black space, and a fluorescent action signal.

## Core Principles
1. **Silence before signal:** Default surfaces stay matte black and restrained; green only appears when something meaningful happens.
2. **Data as atmosphere:** Milliseconds, round counts, and team states are treated as visual texture, not secondary metadata.
3. **No decorative softness:** Use crisp rules, hard edges, and compact radii so every surface feels precise and fast.
4. **Competition stays legible:** The interface should make the current action and the next decision obvious from across a meeting room.

## Color Philosophy
Black creates anticipation and focus. White is the neutral instrument panel: clear, quiet, and highly legible. Neon green is the single owned signal color, reserved for active states, the tap target, wins, and calls to action. It should feel like a start light rather than a decoration.

## Layout Paradigm
A split-stage composition: a narrow left rail for brand and session context, a dominant central game stage for the active round, and a right-side score column for team momentum. On smaller screens these collapse into a stacked sequence that keeps the action stage first.

## Signature Elements
- A lime crosshair / plus-mark used as the brand icon, target language, and progress motif.
- Monospaced timestamp numerals with oversized millisecond readouts.
- Thin hairline dividers and small uppercase status labels that create a control-room feeling.

## Interaction Philosophy
Interactions are immediate and tactile. Hover states reveal intent with a crisp border or green fill; pressed states snap down quickly. The game should never hide what is happening: pre-round anticipation, live target, false start, and result are all explicit states.

## Animation
Use short, decisive transitions under 220ms. The active target enters with a small scale-up and opacity reveal, never from zero. Score rows shift with a subtle translate and opacity transition. Avoid ambient motion while waiting; anticipation comes from the timer and status text. Respect reduced-motion preferences.

## Typography System
Display: Space Grotesk, 700–800, for brand and large action headings. Body/UI: IBM Plex Mono, 400–600, for labels, stats, and controls. Use compact uppercase labels with letter spacing, and let the millisecond readout carry the largest type scale on the page.

## Brand Essence
QuickTap is a fast, low-friction team reaction game for meetings and events that turns a few seconds of attention into friendly competition.

**Personality:** precise, electric, social.

## Brand Voice
Headlines are short, declarative, and slightly charged. CTAs sound like commands from a timing system, not marketing copy.

- “WAIT FOR THE SIGNAL.”
- “MAKE YOUR MOVE COUNT.”

## Wordmark & Logo
The mark is a bold four-arm crosshair built from two offset rectangular strokes, with a small gap at the center to suggest timing and readiness. The wordmark uses a custom-spaced uppercase QUICKTAP lockup, with the “T” visually aligned to the crosshair axis.

## Signature Brand Color
**Signal Lime — #B6FF00.** It is bright enough to read instantly on black, but more acidic and ownable than a generic green.

## Style Decisions

- Millisecond numerals and stopwatch data are the primary display artifacts; timing stats should visually compete with the main headline.
- The central setup/play panel remains an active reaction arena, using crosshair geometry, round state, and timing-grid language before it reads as a generic form.
- Lime remains reserved for active states, primary actions, the current team, and the brand mark.
