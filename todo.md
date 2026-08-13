# QuickTap Feature Tasks

- [x] Add a pre-game setup panel for the player's nickname.
- [x] Add configurable round-count controls before starting a session.
- [x] Connect nickname and round settings to the active session header and progress copy.
- [x] Preserve existing reaction states, leaderboard, and session history behavior.
- [x] Run type checks, production build, and preview verification.
- [ ] Save an updated project checkpoint.
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
