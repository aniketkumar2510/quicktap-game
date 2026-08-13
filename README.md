# QuickTap

**QuickTap** is a high-contrast team reaction game designed to energize meetings, workshops, team events, and informal competitions. Players choose a nickname, configure a session length, wait for an unpredictable visual signal, and react as quickly as possible by clicking or pressing the spacebar. Every completed round is recorded in milliseconds and contributes to persistent player statistics, session history, leaderboards, and head-to-head comparisons.

The project is designed around a focused **Signal / Silence** visual language: a dark, instrument-like interface, bright action accents, minimal distractions, and clear feedback during the high-pressure reaction moment.

> **Live application:** [quicktapgame-dsreyier.manus.space](https://quicktapgame-dsreyier.manus.space)

## Table of contents

- [Why QuickTap](#why-quicktap)
- [How the game works](#how-the-game-works)
- [Feature overview](#feature-overview)
- [Persistence and synchronization](#persistence-and-synchronization)
- [Technical architecture](#technical-architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Database setup](#database-setup)
- [Testing and validation](#testing-and-validation)
- [Interaction and accessibility](#interaction-and-accessibility)
- [Design system](#design-system)
- [Data model](#data-model)
- [Known implementation notes](#known-implementation-notes)
- [Future improvements](#future-improvements)
- [License](#license)
- [References](#references)

## Why QuickTap

QuickTap turns a simple reaction-time test into a repeatable team activity. The setup is intentionally short: choose an existing player or create a new nickname, select the number of rounds, and arm the session. The waiting period is deliberately unpredictable, which prevents players from relying on a fixed rhythm. The application then measures the elapsed time between the signal and the player’s response using browser performance timing.

The game is useful for short icebreakers because the result is immediately understandable. A lower reaction time means a faster response, and the leaderboard makes it easy to compare players across multiple sessions without requiring a separate spreadsheet or scorekeeper.

## How the game works

### 1. Choose a player

The setup panel includes a nickname selector populated from the shared QuickTap workspace. Existing players can be selected directly. Choosing **New nickname** reveals the editable nickname field so a new player can be entered without displaying an unnecessary input for existing-player selections.

Nicknames are treated as player identities throughout the application. The current implementation permits case variants such as `Lewis` and `lewis` to coexist as separate names, while deletion targets the exact selected nickname rather than a case-insensitive approximation.

### 2. Configure the session

Players can choose a session length from the available round options. The selected round count is reflected in the round context, setup panel, active session state, and final summary.

### 3. Arm the round

Selecting **Arm the round**, clicking the arena, or pressing the spacebar begins the waiting state. QuickTap plays a warning cue and starts a randomized delay between approximately **1.35 and 3.55 seconds**.

### 4. Wait for the signal

During the armed state, the player must wait. The signal is represented visually by the high-contrast arena state and accompanied by a sharp sound cue. The interface also displays a prominent reaction prompt so the player can clearly understand when the response window is active.

### 5. React

Once the signal appears, the player can click the arena or press the spacebar. QuickTap records the elapsed time in milliseconds. Successful responses receive a success chime and are added to the current round list, the player’s persistent score, and the session archive.

### 6. Handle false starts

If the player reacts before the signal, the round is marked as a false start. The arena provides shake feedback and an error sound. The waiting timer is cancelled, and the player can restart the round.

### 7. Review the result

The result state shows the reaction time and confirms the nickname under which the result was logged. At the end of the configured session, the summary view presents the player’s best and average times together with the saved leaderboard.

## Feature overview

| Area | Current behavior |
| --- | --- |
| Reaction game | Randomized signal delay, millisecond precision, visual signal state, click input, and spacebar input. |
| Session setup | Existing-player dropdown, conditional New nickname input, configurable round count, and nickname validation. |
| Nickname management | Existing-player selection, conditional New nickname input, exact nickname persistence, and support for case-variant names as separate player identities. |
| Feedback | Warning beep while waiting, signal cue, success chime, false-start sound, arena shake, and toast notifications. |
| Leaderboard | Persistent best-time ranking for valid nicknames, with average values shown alongside players. |
| Session history | Cross-session archive grouped by nickname, ascending round context, trend chart, average reference line, and fastest-entry highlighting. |
| H2H comparison | Two saved-player selectors, overlaid reaction trends, exact chart tooltips, averages, best times, worst times, and faster-average trophy highlighting. |
| Data safety | Custom confirmation dialogs for reset and player deletion, plus a browser confirmation before clearing a player’s session history. |
| Themes | Persistent dark and light modes with smooth transitions; dark mode uses neon yellow accents and light mode uses neon purple accents. |
| Responsive layout | Desktop sidebar layout with a mobile navigation drawer for Play, Session history, and H2H. |
| Synchronization | Shared database workspace persistence across desktop, mobile, and published sessions, with visible `DB SYNCED`, `SAVING…`, `SYNCING…`, and `LOCAL COPY` states. |
| Invalid legacy data | Unknown and unnamed player labels are excluded from Session history, H2H, player selectors, saved-player lists, and leaderboard-derived views. |

## Persistence and synchronization

QuickTap uses two persistence layers for resilience:

1. **Shared database persistence.** The application stores the current QuickTap workspace in the `quicktap_states` table using the shared workspace key `quicktap-shared-workspace-v1`. This allows the published site, desktop browsers, and mobile browsers to resolve the same roster, scores, and session history.
2. **Local browser fallback.** The browser also keeps a local copy of relevant state, including theme, sound preference, current nickname, round count, sessions, scores, and active session metadata. This fallback allows the interface to continue operating when the database is temporarily unavailable.

The top bar exposes the current persistence state. A successful database hydration is shown as **DB SYNCED**. During a save or initial load, QuickTap shows **SAVING…** or **SYNCING…**. If the database query or save fails, the interface falls back to **LOCAL COPY** rather than blocking the game.

The current persisted state includes:

```ts
type QuickTapState = {
  sessions: Session[];
  playerScores: Record<string, PlayerScore>;
  playerName: string;
  totalRounds: number;
  activeSessionId: string;
};
```

The shared persistence model is intentionally compact. Session records and player aggregates are serialized into the `payload` column, while the database row tracks the workspace key and update timestamps.

## Technical architecture

QuickTap is a full-stack TypeScript application with a React client and an Express-powered server. The client communicates with the backend through typed tRPC procedures. Drizzle ORM defines the MySQL-compatible database schema and migration contract.

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React 19 | Game state, setup controls, responsive layout, charts, dialogs, and navigation. |
| Styling | Tailwind CSS 4 and project CSS tokens | Signal / Silence visual system, dark/light themes, responsive behavior, and animations. |
| Icons | Lucide React | Navigation, state indicators, trophies, controls, and feedback icons. |
| API contract | tRPC 11 | Typed client-server procedures for loading and saving QuickTap state. |
| Server | Express 4 with the Manus server runtime | HTTP serving, API integration, authentication plumbing, and production entrypoint. |
| Database access | Drizzle ORM and MySQL2 | Schema definitions, typed queries, and database persistence. |
| Database | MySQL-compatible database / TiDB | Shared QuickTap state and framework user records. |
| Validation | Zod | Runtime validation of structured persistence payloads and procedure inputs. |
| Charts | SVG rendered by React | Session history and H2H trend lines, markers, labels, and tooltips. |
| Sound | Browser `AudioContext` | Generated warning, signal, success, and error tones without bundled audio files. |
| Build tooling | Vite and esbuild | Frontend bundling and server production bundling. |
| Tests | Vitest | Persistence procedure and authentication behavior tests. |

The main game logic lives in `client/src/pages/Home.tsx`. The QuickTap router is defined in `server/routers.ts`, database helpers are in `server/db.ts`, and the database schema is in `drizzle/schema.ts`.

## Project structure

```text
quicktap-game/
├── client/
│   ├── index.html
│   └── src/
│       ├── components/          # Shared UI and shadcn-style primitives
│       ├── contexts/            # Theme and application contexts
│       ├── hooks/               # Reusable React hooks
│       ├── lib/trpc.ts          # Typed tRPC client binding
│       ├── pages/Home.tsx       # QuickTap game, history, H2H, and layout logic
│       ├── App.tsx              # Application routing and providers
│       ├── index.css            # Theme tokens, layout styles, and animations
│       └── main.tsx             # React and tRPC application bootstrap
├── drizzle/
│   ├── schema.ts                # MySQL/TiDB schema definitions
│   ├── relations.ts             # Drizzle relations
│   └── *.sql                    # Generated migration SQL
├── server/
│   ├── db.ts                    # Database query helpers
│   ├── routers.ts               # tRPC procedures
│   ├── storage.ts               # Storage helpers
│   ├── index.ts                 # Server entrypoint compatibility layer
│   └── *.test.ts                # Vitest coverage
├── shared/                      # Shared types and constants
├── package.json                 # Scripts and dependencies
├── vite.config.ts               # Vite and Manus runtime configuration
├── drizzle.config.ts            # Drizzle Kit configuration
├── vitest.config.ts             # Vitest configuration
└── todo.md                      # Project feature checklist and implementation history
```

## Getting started

### Prerequisites

Install the following before starting local development:

- Node.js 22 or a compatible current Node.js release.
- pnpm 10 or a compatible pnpm release.
- A MySQL-compatible database connection for full database persistence.
- The environment variables required by the Manus full-stack template, including `DATABASE_URL` and the server authentication variables.

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

The server expects environment values supplied by the deployment or local environment. At minimum, the full-stack template requires a database connection and the authentication/runtime variables used by the Manus server layer.

Do not commit `.env` files or credentials to GitHub. For a local environment, use the project’s supported secret-management workflow or a local ignored environment file.

### Start the development server

```bash
pnpm dev
```

The development command starts the TypeScript server runtime with file watching. The server hosts the Vite-powered client and the tRPC API under the same application origin.

### Open the app

Open the local URL printed by the development server. The exact port should be taken from the server output rather than hardcoded in scripts, because the managed runtime may select an available port.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Starts the development server with TypeScript watch mode and Vite integration. |
| `pnpm build` | Builds the client with Vite and bundles the server with esbuild into `dist/`. |
| `pnpm start` | Starts the production server from `dist/index.js`. |
| `pnpm check` | Runs TypeScript without emitting files. |
| `pnpm test` | Runs the Vitest test suite once. |
| `pnpm format` | Formats the project with Prettier. |
| `pnpm db:push` | Generates Drizzle migrations and applies them through the configured database workflow. |

A typical local verification sequence is:

```bash
pnpm check
pnpm test
pnpm build
```

## Database setup

The database schema contains the framework `users` table and the QuickTap `quicktap_states` table. The QuickTap table uses a unique `ownerKey` so a workspace can be loaded and saved deterministically.

```ts
quicktap_states {
  id: number;
  ownerKey: string; // unique shared workspace identifier
  payload: string;  // serialized structured QuickTap state
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

When the schema changes, follow the project’s schema-first workflow:

1. Update `drizzle/schema.ts`.
2. Generate a migration with Drizzle Kit.
3. Review the generated SQL.
4. Apply the migration to the configured database.
5. Verify the resulting table and application behavior.
6. Run the TypeScript checks, tests, and production build.

Avoid destructive database operations unless the data impact is understood. QuickTap’s game records are user-facing history, so a schema change should preserve existing payloads whenever possible.

## Testing and validation

The project includes Vitest coverage for the persistence contract and authentication behavior. The persistence tests verify that the QuickTap state procedures accept structured state data and reject invalid payload shapes according to the server contract.

Run the tests with:

```bash
pnpm test
```

For a production-oriented check, run:

```bash
pnpm check && pnpm test && pnpm build
```

Browser validation should also cover the critical user flows:

| Flow | Expected result |
| --- | --- |
| Select an existing nickname | The editable nickname field disappears and the selected player becomes active. |
| Select New nickname | The editable nickname field appears and accepts a new name. |
| Start a round | A warning cue plays, the signal arrives after a random delay, and the arena becomes actionable. |
| Tap before the signal | The round enters false-start feedback with an error cue and shake animation. |
| React after the signal | The time is displayed in milliseconds and logged under the active nickname. |
| Open Session history | Valid entries are listed in round order with trend information. |
| Open H2H | Only valid saved nicknames appear in the two comparison selectors. |
| Refresh or open on another device | Shared database state rehydrates the same roster, scores, and history when the database is available. |
| Reset or delete a player | A custom confirmation dialog appears before saved stats or a selected player’s data is removed. |

## Interaction and accessibility

QuickTap supports both pointer and keyboard play. The spacebar can arm a round from the idle state and submit a reaction once the signal appears. The interface exposes accessible labels for major controls, including the sound toggle, theme toggle, persistence status, navigation controls, and dialog close actions.

The mobile navigation is implemented as a responsive drawer. It provides access to Play, Session history, and H2H without requiring the desktop sidebar width. Custom dialogs use modal semantics and separate cancellation from destructive actions for reset and player deletion. Clearing Session history currently uses the browser’s native confirmation prompt.

Nicknames are entered through the New nickname field or selected from the existing-player dropdown. The current implementation does not block duplicate names globally; exact names are persisted as entered, and case variants such as `Lewis` and `lewis` remain distinct identities. Empty nickname submissions are rejected before a round can start.

## Design system

QuickTap’s interface is intentionally minimal and high contrast. The main visual distinction is between **Silence**, the subdued waiting state, and **Signal**, the bright action state.

| Theme | Primary accent | Intended role |
| --- | --- | --- |
| Dark | Neon yellow | Action buttons, active borders, signal states, score emphasis, and success highlights. |
| Light | Neon purple | The same action hierarchy adapted for a brighter background. |

The app includes a smooth transition between themes. Sound can be muted independently of the visual theme, and both preferences persist in the browser.

The interface avoids seeded team identities and fabricated social proof. Leaderboards and histories are derived from actual saved player data and completed rounds.

## Data model

A completed round is represented by a session record similar to:

```ts
type Session = {
  sessionId: string;
  date: string;
  players: number;
  best: number;
  winner: string;
  round?: number;
};
```

Per-player aggregates use:

```ts
type PlayerScore = {
  best: number;
  total: number;
  rounds: number;
};
```

From these values, QuickTap derives:

- The player’s best reaction time.
- The player’s average reaction time.
- The ranked leaderboard order.
- The session history trend values.
- The fastest entry highlight.
- H2H best, worst, and average values.
- The faster-average H2H winner.

Unknown or unnamed labels are treated as invalid display identities. They are filtered from derived player lists so Session history and H2H present only usable nicknames.

## Known implementation notes

The application keeps a local browser copy as a resilience mechanism, but the shared database is the source used for cross-device rehydration. If the database is unavailable, the game can continue against the local copy and clearly reports the degraded persistence state.

The current game implementation keeps the primary page logic in one feature page. This makes the game flow easy to follow while the project is evolving, although a future refactor could split the setup panel, arena, leaderboard, history dialog, and H2H dialog into smaller feature components.

The server uses the managed full-stack runtime and should not be modified to assume a fixed production port. Production deployment should use the project’s managed hosting configuration or another environment that supplies the required server variables and database connection.

## Test It Out! :

https://quicktapgame-dsreyier.manus.space/



## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/). See the `LICENSE` file when included in the repository.

## References

[1]: https://react.dev/ "React documentation"

[2]: https://trpc.io/docs "tRPC documentation"

[3]: https://orm.drizzle.team/docs/overview "Drizzle ORM documentation"

[4]: https://vite.dev/guide/ "Vite documentation"

[5]: https://vitest.dev/guide/ "Vitest documentation"

[6]: https://tailwindcss.com/docs "Tailwind CSS documentation"

[7]: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext "MDN AudioContext documentation"
