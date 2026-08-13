/* QuickTap style: Signal / Silence — matte black stage, white instrument text, Signal Lime only for action states. */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Crown,
  History,
  Keyboard,
  Menu,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

type GameState = "idle" | "armed" | "live" | "result" | "false-start" | "summary";

type Session = { sessionId: string; date: string; players: number; best: number; winner: string };
type PlayerScore = { best: number; total: number; rounds: number };

const STORAGE_KEYS = {
  sessions: "quicktap.sessions.v1",
  playerScores: "quicktap.player-scores.v1",
  playerName: "quicktap.player-name.v1",
  totalRounds: "quicktap.total-rounds.v1",
  activeSession: "quicktap.active-session.v1",
};

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

const initialSessions: Session[] = [];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [playerName, setPlayerName] = useState(() => readStored(STORAGE_KEYS.playerName, "Alex"));
  const [totalRounds, setTotalRounds] = useState(() => readStored(STORAGE_KEYS.totalRounds, 5));
  const [activeSessionId, setActiveSessionId] = useState(() => readStored(STORAGE_KEYS.activeSession, `session-${Date.now()}`));
  const [sessions, setSessions] = useState<Session[]>(() => readStored<Session[]>(STORAGE_KEYS.sessions, initialSessions).filter((session) => session.winner !== "Green Team" && session.winner !== "Night Shift").map((session) => ({ ...session, sessionId: session.sessionId ?? activeSessionId })));
  const [playerScores, setPlayerScores] = useState<Record<string, PlayerScore>>(() => Object.fromEntries(Object.entries(readStored<Record<string, PlayerScore>>(STORAGE_KEYS.playerScores, {})).filter(([name]) => name !== "Green Team" && name !== "Night Shift")));
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const signalAt = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();
      if (gameState === "idle") armRound();
      else handleArenaClick();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activeSession, JSON.stringify(activeSessionId));
  }, [activeSessionId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.playerScores, JSON.stringify(playerScores));
  }, [playerScores]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.playerName, JSON.stringify(playerName));
  }, [playerName]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.totalRounds, JSON.stringify(totalRounds));
  }, [totalRounds]);

  const armRound = () => {
    window.clearTimeout(timerRef.current);
    setReactionTime(null);
    setGameState("armed");
    timerRef.current = window.setTimeout(() => {
      signalAt.current = performance.now();
      setGameState("live");
    }, 1350 + Math.floor(Math.random() * 2200));
  };

  const handleArenaClick = () => {
    if (gameState === "armed") {
      window.clearTimeout(timerRef.current);
      setGameState("false-start");
      toast.error("False start", { description: "Wait for the green signal." });
      return;
    }
    if (gameState !== "live") return;
    const result = Math.max(1, Math.round(performance.now() - signalAt.current));
    setReactionTime(result);
    setRoundTimes((current) => [...current, result]);
    setGameState("result");
    const playerKey = playerName.trim() || "Unnamed player";
    const nextSession: Session = { sessionId: activeSessionId, date: "Just now", players: isLiveMode ? 8 : 1, best: result, winner: playerKey };
    setSessions((current) => [nextSession, ...current].slice(0, 20));
    setPlayerScores((current) => {
      const previous = current[playerKey];
      return {
        ...current,
        [playerKey]: {
          best: previous ? Math.min(previous.best, result) : result,
          total: (previous?.total ?? 0) + result,
          rounds: (previous?.rounds ?? 0) + 1,
        },
      };
    });
  };

  const startNext = () => {
    if (round >= totalRounds) {
      setGameState("summary");
      return;
    }
    setRound((value) => value + 1);
    armRound();
  };

  const reset = () => {
    window.clearTimeout(timerRef.current);
    setReactionTime(null);
    setGameState("idle");
    setRound(1);
    setRoundTimes([]);
    setActiveSessionId(`session-${Date.now()}`);
  };

  const resetStats = () => {
    const playerKey = playerName.trim() || "Unnamed player";
    setPlayerScores((current) => {
      const next = { ...current };
      delete next[playerKey];
      return next;
    });
    setSessions((current) => current.filter((session) => session.winner !== playerKey));
    setRoundTimes([]);
    setReactionTime(null);
    setRound(1);
    setGameState("idle");
    toast.success("Stats reset", { description: `${playerKey}'s saved best and active-session entries were cleared.` });
  };

  const activeSessions = sessions.filter((session) => session.sessionId === activeSessionId);
  const playerLeaderboard = Object.entries(playerScores).map(([name, score]) => ({ name, score: score.best, avg: Math.round(score.total / score.rounds) })).sort((a, b) => a.score - b.score).map((player, index) => ({ ...player, rank: index + 1 }));
  const activePlayerName = playerName.trim() || "Unnamed player";
  const savedPlayer = playerScores[activePlayerName];
  const bestTime = roundTimes.length ? Math.min(...roundTimes) : savedPlayer?.best ?? null;
  const sessionAverage = roundTimes.length ? Math.round(roundTimes.reduce((sum, time) => sum + time, 0) / roundTimes.length) : savedPlayer ? Math.round(savedPlayer.total / savedPlayer.rounds) : null;

  const stateCopy = {
    idle: { kicker: "SET YOUR SESSION", title: "Choose your line-up.", sub: "Enter a nickname and choose how many rounds your team will play.", button: "Arm the round" },
    armed: { kicker: "WAIT FOR THE SIGNAL", title: "Stay sharp.", sub: "No tap yet. The green signal can land at any moment.", button: "Listening…" },
    live: { kicker: "TAP NOW", title: "GO.", sub: "Your reaction clock is running.", button: "Tap the signal" },
    result: { kicker: "ROUND COMPLETE", title: `${reactionTime ?? 0} ms`, sub: reactionTime && reactionTime < 220 ? "That was quick. Keep the momentum." : "Solid run. One more can be faster.", button: "Next round" },
    "false-start": { kicker: "FALSE START", title: "Too early.", sub: "Wait for Signal Lime. Anticipation is part of the game.", button: "Try again" },
    summary: { kicker: "SESSION COMPLETE", title: "You made your mark.", sub: "Your rounds are logged below. Ready for another run?", button: "New session" },
  }[gameState];

  const copyCode = () => {
    navigator.clipboard?.writeText("QT-4821");
    toast.success("Session code copied", { description: "Share it with your team." });
  };

  return (
    <main className="quicktap-shell">
      <aside className="left-rail">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div><div className="brand-name">QUICK<span>TAP</span></div><div className="brand-caption">REACTION / TEAM MODE</div></div>
        </div>
        <nav className="rail-nav" aria-label="Primary">
          <button className="rail-link active"><Zap size={15} /> Play</button>
          <button className="rail-link" onClick={() => setShowHistory(true)}><History size={15} /> Session history</button>
          <button className="rail-link" onClick={() => toast("Invite link ready", { description: "Share QT-4821 with the room." })}><Users size={15} /> Invite team</button>
        </nav>
        <div className="rail-bottom">
          <div className="room-label"><span className="status-dot" /> LIVE ROOM</div>
          <div className="room-code-row"><span>QT-4821</span><button aria-label="Copy room code" onClick={copyCode}><Copy size={14} /></button></div>
          <div className="room-note">8 players connected<br />{playerName} · Round {round} of {totalRounds}</div>
        </div>
      </aside>

      <section className="main-stage">
        <header className="topbar">
          <div className="mobile-menu"><Menu size={20} /></div>
          <div className="breadcrumb"><span>MEETING ROOM</span><ArrowRight size={13} /><strong>QUICKTAP</strong></div>
          <div className="topbar-actions"><div className="live-pill"><span className="status-dot" /> Live multiplayer</div><button className="icon-button" onClick={reset} aria-label="Reset session"><RotateCcw size={16} /></button></div>
        </header>

        <div className="stage-content">
          <div className="stage-heading">
            <div><div className="eyebrow"><span className="lime-dash" /> ROUND {String(round).padStart(2, "0")} / {String(totalRounds).padStart(2, "0")}</div><h1>Make your move<br /><em>count.</em></h1></div>
            <div className="stage-heading-right"><div className="mini-stat"><span>YOUR BEST</span><strong>{bestTime ?? "—"} <small>{bestTime ? "ms" : "waiting"}</small></strong></div><button className="stats-reset" onClick={resetStats}><RotateCcw size={13} /> Reset stats</button></div>
          </div>

          <div className={`reaction-arena state-${gameState}`} onClick={handleArenaClick} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleArenaClick()} aria-label="Reaction game arena">
            <div className="arena-grid" />
            <div className="arena-corner corner-tl">WAIT TIME<br /><span>1.35 — 3.55 SEC</span></div>
            <div className="arena-corner corner-tr">INPUT<br /><span>POINTER / SPACE</span></div>
            <div className="arena-center">
              {gameState === "live" ? <div className="tap-target"><div className="target-cross"><span /></div><div className="target-label">TAP</div></div> : gameState === "result" ? <div className="result-readout"><div className="result-label">REACTION TIME</div><div className="result-number">{reactionTime}<small>ms</small></div><div className="result-badge"><Check size={13} /> Logged for {playerName}</div></div> : gameState === "summary" ? <div className="summary-readout"><div className="result-label">FINAL LEADERBOARD</div><div className="summary-title">{playerName || "Unnamed player"}</div><div className="summary-metrics"><div><span>BEST</span><strong>{bestTime ?? "—"}<small>ms</small></strong></div><div><span>AVG</span><strong>{sessionAverage ?? "—"}<small>ms</small></strong></div></div><div className="summary-list">{playerLeaderboard.length ? playerLeaderboard.map((player) => <div className={`summary-row ${player.name === activePlayerName ? "highlight" : ""}`} key={player.name}><span>{String(player.rank).padStart(2, "0")}</span><strong>{player.name}</strong><b>{player.score}<small>ms</small></b></div>) : <div className="summary-row highlight"><span>01</span><strong>{activePlayerName}</strong><b>—<small>ms</small></b></div>}</div></div> : gameState === "idle" ? <div className="setup-panel" onClick={(event) => event.stopPropagation()}><div className="wait-icon"><Users size={25} /></div><div className="wait-kicker">{stateCopy.kicker}</div><div className="wait-title">{stateCopy.title}</div><div className="setup-fields"><label><span>PLAYER NICKNAME</span><input value={playerName} maxLength={18} onChange={(event) => setPlayerName(event.target.value)} placeholder="Your nickname" /></label><label><span>ROUNDS</span><select value={totalRounds} onChange={(event) => setTotalRounds(Number(event.target.value))}><option value={3}>03 rounds</option><option value={5}>05 rounds</option><option value={7}>07 rounds</option><option value={10}>10 rounds</option></select></label></div><div className="wait-sub">{stateCopy.sub}</div></div> : <div className="wait-readout"><div className="wait-icon">{gameState === "false-start" ? <RotateCcw size={26} /> : <Activity size={26} />}</div><div className="wait-kicker">{stateCopy.kicker}</div><div className="wait-title">{stateCopy.title}</div><div className="wait-sub">{stateCopy.sub}</div></div>}
            </div>
            <div className="arena-corner corner-bl">SESSION<br /><span>TEAM / {String(totalRounds).padStart(2, "0")} ROUNDS</span></div>
            <div className="arena-corner corner-br"><Keyboard size={13} /> SPACEBAR ENABLED</div>
          </div>

          <div className="stage-controls"><button className={`primary-button ${gameState === "armed" ? "loading" : ""}`} onClick={(event) => { event.stopPropagation(); gameState === "result" || gameState === "false-start" ? startNext() : gameState === "summary" ? reset() : gameState === "idle" ? armRound() : undefined; }} disabled={gameState === "armed" || gameState === "live"}><span className="button-icon">{gameState === "idle" ? <Play size={15} fill="currentColor" /> : gameState === "result" || gameState === "false-start" ? <RotateCcw size={15} /> : gameState === "summary" ? <RotateCcw size={15} /> : <Radio size={15} />}</span>{stateCopy.button}<ArrowRight size={15} /></button><div className="control-hint"><span className="keycap">SPACE</span> to tap <span className="dot-separator">·</span> <button onClick={() => toast.info("The target appears once per round after a random 1.35–3.55 second delay.")}>How it works <ChevronDown size={13} /></button></div></div>
        </div>
      </section>

      <aside className="score-panel">
        <div className="score-panel-header"><div><div className="eyebrow">TEAM LEADERBOARD</div><h2>Room momentum</h2></div><Crown size={18} className="crown" /></div>
        <div className="leaderboard-list">{playerLeaderboard.length ? playerLeaderboard.map((player) => <div className={`leader-row ${player.name === activePlayerName ? "leader" : ""}`} key={player.name}><div className="rank">{String(player.rank).padStart(2, "0")}</div><div className="team-symbol">{player.rank === 1 ? <Sparkles size={14} /> : <ShieldCheck size={14} />}</div><div className="team-details"><strong>{player.name}</strong><span>AVG {player.avg} MS</span></div><div className="team-score">{player.score.toLocaleString()}</div></div>) : <div className="leaderboard-empty"><ShieldCheck size={15} /><span>No logged stats yet.<small>Complete a round to enter your board.</small></span></div>}</div>
        <div className="score-divider" />
        <div className="panel-subhead"><span>SESSION HISTORY</span><button onClick={() => setShowHistory(!showHistory)}>{showHistory ? "Hide" : "View all"} <ArrowRight size={13} /></button></div>
        {(showHistory ? activeSessions : activeSessions.slice(0, 2)).map((session) => <div className="history-row" key={`${session.date}-${session.best}`}><div className="history-icon"><Clock3 size={14} /></div><div className="history-details"><strong>{session.winner}</strong><span>{session.date} · {session.players} players</span></div><div className="history-best">{session.best}<small>ms</small></div></div>)}
        <div className="panel-footer"><div className="live-mode-toggle"><button className={isLiveMode ? "toggle-on" : ""} onClick={() => setIsLiveMode(!isLiveMode)}><span /></button><div><strong>Live multiplayer</strong><small>{isLiveMode ? "On · results sync live" : "Off · solo practice"}</small></div></div><div className="footer-activity"><div className="activity-bars"><i /><i /><i /><i /><i /></div><span>ACTIVE</span></div></div>
      </aside>
      {showHistory && <div className="history-overlay" role="dialog" aria-modal="true" aria-labelledby="history-title"><div className="history-dialog"><div className="history-dialog-head"><div><div className="eyebrow">SESSION ARCHIVE</div><h2 id="history-title">{activePlayerName} / full history</h2><p>All reaction entries saved for the current session.</p></div><button className="history-close" onClick={() => setShowHistory(false)} aria-label="Close session history">Close</button></div><div className="history-dialog-list">{activeSessions.length ? activeSessions.map((session, index) => <div className="history-dialog-row" key={`${session.sessionId}-${session.date}-${session.best}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{session.winner}</strong><small>{session.date} · {session.players} players</small></div><b>{session.best}<em>ms</em></b></div>) : <div className="history-dialog-empty"><Clock3 size={18} /><strong>No saved entries for this session.</strong><span>Complete a round and it will appear here.</span></div>}</div><button className="history-dialog-action" onClick={() => setShowHistory(false)}>Back to play <ArrowRight size={14} /></button></div></div>}
    </main>
  );
}
