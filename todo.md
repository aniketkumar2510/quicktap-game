# QuickTap Feature Tasks

- [x] Add a pre-game setup panel for the player's nickname.
- [x] Add configurable round-count controls before starting a session.
- [x] Connect nickname and round settings to the active session header and progress copy.
- [x] Preserve existing reaction states, leaderboard, and session history behavior.
- [x] Run type checks, production build, and preview verification.
- [x] Save an updated project checkpoint.
- [x] Upgrade QuickTap to a database-backed full-stack project.
- [x] Persist player scores and session history through typed server procedures.
- [x] Migrate the UI from local-only persistence with a safe fallback.
- [x] Validate database persistence and production readiness.
- [x] Add a mobile menu control for the left navigation.
- [x] Make mobile navigation items selectable and dismissible.
- [x] Validate mobile navigation at narrow viewport sizes.
- [x] Add exact-value and date hover tooltips to Session history chart points.
- [x] Add exact-value and date hover tooltips to H2H chart points.
- [x] Validate chart tooltip behavior in both themes.
- [x] Make Session history chart lines and reference lines visible in light mode.
- [x] Make H2H chart lines, grid lines, and labels visible in light mode.
- [x] Validate both chart views in light mode.
- [x] Allow case-variant nicknames such as Lewis and lewis to coexist.
- [x] Remove duplicate nickname blocking for case variants.
- [x] Delete only the exact selected nickname with case-sensitive matching.
- [x] Validate Lewis and lewis deletion isolation.
- [x] Keep dark-mode warning and suggestion accents neon yellow.
- [x] Delete only the exact selected nickname, including similar names such as AK and akk.
- [x] Switch to another existing player after deleting the active player.
- [x] Validate multi-player deletion and accent behavior.
- [x] Restore high-contrast nickname warning and suggestion options in both themes.
- [x] Replace the user-delete browser prompt with a themed in-app dialog.
- [x] Prevent deleting a player from creating or switching to Alex.
- [x] Validate nickname visibility and safe deletion behavior.
- [x] Add shake animation and red border for taken nickname submissions.
- [x] Add arrow-key and Enter navigation for nickname suggestions.
- [x] Add confirmed per-user deletion inside Session history.
- [x] Validate all new nickname and deletion flows.
- [x] Fix taken-nickname warning text visibility in both themes.
- [x] Fix available-nickname suggestion button visibility in both themes.
- [x] Validate the nickname warning state from the provided screenshot scenario.
- [x] Make nickname and player-name option lists readable in dark mode.
- [x] Make nickname and player-name option lists readable in light mode.
- [x] Validate option list visibility across themes.
- [x] Improve option and select visibility in both themes.
- [x] Strengthen light-mode H2H selector, chart, legend, and metric contrast.
- [x] Validate controls and H2H readability in both themes.
- [x] Prevent starting a session with an already-used nickname.
- [x] Show a taken-nickname message with contextual available suggestions.
- [x] Validate duplicate-name blocking and suggestion selection.
- [x] Add a smooth dark/light mode transition.
- [x] Rename TEAM LEADERBOARD to LEADERBOARD.
- [x] Rename Room momentum to TOP SCORES.
- [x] Validate theme switching and updated leaderboard copy.
- [x] Keep light-mode Session history and H2H text readable on hover.
- [x] Validate sidebar hover contrast in light mode.
- [x] Make the light-mode live arena fill neon purple.
- [x] Remove the centered spacebar prompt from the live arena.
- [x] Validate the live arena appearance in both themes.
- [x] Make only the light-mode Play sidebar item white.
- [x] Return other light-mode sidebar labels to black.
- [x] Add a prominent visible spacebar prompt during the live reaction state.
- [x] Validate sidebar contrast and live reaction visibility.
- [x] Make light-mode sidebar navigation labels white for overlap contrast.
- [x] Validate sidebar label readability in light mode.
- [x] Replace duplicate H2H chart point keys with stable unique keys.
- [x] Validate the H2H chart no longer emits duplicate-key warnings.
- [x] Change light-mode accent items from neon yellow to neon purple.
- [x] Keep dark-mode accents neon yellow.
- [x] Validate both theme accent palettes.
- [x] Add a persistent dark/light theme toggle.
- [x] Remove the Live multiplayer toggle from the bottom panel.
- [x] Validate both themes and the simplified bottom panel.
- [x] Add a confirmation dialog before Reset Stats clears saved score data.
- [x] Validate cancel and confirm Reset Stats flows.
- [x] Move the Session history average readout to the chart top-right.
- [x] Highlight the lowest reaction time entry instead of the first entry.
- [x] Validate the updated chart and history list hierarchy.

- [x] Add hover tooltips with exact H2H reaction time and round details.
- [x] Remove the LIVE ROOM section while preserving round naming context.
- [x] Remove the Live multiplayer top-bar control.
- [x] Validate hover behavior and simplified controls.

- [x] Add a trophy to the faster-average H2H winner, with ties showing no winner.
- [x] Remove the LOWER IS FASTER label from H2H.
- [x] Remove Product Crew from persisted and displayed player data.
- [x] Validate winner highlighting and cleaned player lists.

- [x] Move H2H average values into a bottom legend.
- [x] Add best, worst, and average summary metrics for both players.
- [x] Validate the H2H table and legend with two saved players.

- [x] Rename Invite team navigation and section to H2H.
- [x] Add two saved-player selectors for head-to-head comparison.
- [x] Overlay both players’ reaction trends and averages on one chart.
- [x] Validate player switching and comparison states.

- [x] Add a player dropdown to Session history.
- [x] Render the selected player’s cross-session archive and trend.
- [x] Validate switching between multiple player archives.

- [x] Accumulate all sessions for the active nickname in one history archive.
- [x] Aggregate the active nickname’s trend across session boundaries.
- [x] Validate multiple sessions under one nickname and Clear Session History.

- [x] Restore all logged entries in the active-session history dialog.
- [x] Keep the current-player trend chart and Clear Session History behavior intact.
- [x] Validate full history rendering and clear-history behavior.

- [x] Add a confirmation-protected Clear Session History action.
- [x] Delete active-session history from persisted storage and refresh chart state.
- [x] Validate deletion and the empty history state.

- [x] Replace duplicate history render keys with stable unique keys.
- [x] Validate the page console no longer reports duplicate-key warnings.

- [x] Order active-session history entries from Round 1 onward.
- [x] Add a dashed average reaction-time line to the trend chart.
- [x] Validate chart and list share the same round order.

- [x] Map active-player session entries into round trend points.
- [x] Add a visual reaction-time summary chart to Session history.
- [x] Validate populated and empty chart states.

- [x] Add an arena shake animation for early taps.
- [x] Add a muted-by-toggle error sound for false starts.
- [x] Validate the early-tap feedback state in the browser.

- [x] Add waiting warning, signal, and success reaction sound cues.
- [x] Add a persistent mute/unmute control with accessible labels.
- [x] Validate sound triggers across the main game states.

- [x] Aggregate best saved times for every nickname across sessions.
- [x] Render all ranked players in the live and final leaderboards.
- [x] Validate AK and Lewis appear together with their best times.

- [x] Repair Session history access and view state.
- [x] Add a reliable empty history state after reset.
- [x] Validate history navigation in the browser.

- [x] Remove TEAM RANK from the interface and session summary.
- [x] Limit the final leaderboard to the active player only.
- [x] Add a reset-stats control for the active player.
- [x] Validate reset persistence and updated summary behavior.

- [x] Make Session history open a complete active-session history view.
- [x] Remove seeded team leaderboard entries and display only logged player data.
- [x] Validate empty states and navigation behavior.

- [x] Persist session history in local storage and hydrate it on load.
- [x] Persist player best/average/rank data for leaderboard display.
- [x] Validate persistence after refresh.

- [x] Log each completed round under the entered nickname.
- [x] Update YOUR BEST and TEAM RANK from live session performance.
- [x] Add a final leaderboard summary at session completion.

- [x] Reproduce and diagnose the missing signal transition.
- [x] Fix and validate reliable Signal Lime timing.
- [x] Add explicit database load/save error handling and visible sync status with retry behavior.
- [x] Validate the persistence contract with structured state data instead of opaque JSON.
- [x] Validate browser-level save and rehydration behavior after refresh.
- [x] Use a shared QuickTap database workspace key across devices instead of browser-specific owner keys.
- [x] Add an existing-player nickname dropdown while preserving free-text new-player entry.
- [x] Validate published/mobile data rehydration and new-player creation behavior.
