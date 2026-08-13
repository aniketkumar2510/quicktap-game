/* QuickTap style: Signal / Silence — matte black stage, white instrument text, Signal Lime only for action states. */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
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
  Moon,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

type GameState = "idle" | "armed" | "live" | "result" | "false-start" | "summary";

type Session = { sessionId: string; date: string; players: number; best: number; winner: string; round?: number };
type PlayerScore = { best: number; total: number; rounds: number };

const STORAGE_KEYS = {
  sessions: "quicktap.sessions.v1",
  playerScores: "quicktap.player-scores.v1",
  playerName: "quicktap.player-name.v1",
  totalRounds: "quicktap.total-rounds.v1",
  activeSession: "quicktap.active-session.v1",
  soundEnabled: "quicktap.sound-enabled.v1",
  theme: "quicktap.theme.v1",
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
const OWNER_KEY_STORAGE = "quicktap.db-owner.v1";

function getOwnerKey() {
  if (typeof window === "undefined") return "server-render-owner-key";
  const existing = window.localStorage.getItem(OWNER_KEY_STORAGE);
  if (existing) return existing;
  const created = `qt-${crypto.randomUUID()}`;
  window.localStorage.setItem(OWNER_KEY_STORAGE, created);
  return created;
}

const sessionOrder = (session: Session) => Number(session.sessionId.replace("session-", "")) || 0;

export default function Home() {
  const [ownerKey] = useState(getOwnerKey);
  const persistedStateQuery = trpc.quicktap.getState.useQuery({ ownerKey }, { staleTime: Infinity, retry: 1 });
  const savePersistedState = trpc.quicktap.saveState.useMutation();
  const databaseHydrated = useRef(false);
  const persistenceStatus = persistedStateQuery.isLoading ? "SYNCING…" : persistedStateQuery.isError || savePersistedState.isError ? "LOCAL COPY" : savePersistedState.isPending ? "SAVING…" : "DB SYNCED";
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [playerName, setPlayerName] = useState(() => readStored(STORAGE_KEYS.playerName, "Alex"));
  const [sessionNickname, setSessionNickname] = useState(() => readStored(STORAGE_KEYS.playerName, "Alex"));
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSuggestions, setNicknameSuggestions] = useState<string[]>([]);
  const [selectedNicknameSuggestion, setSelectedNicknameSuggestion] = useState(0);
  const [totalRounds, setTotalRounds] = useState(() => readStored(STORAGE_KEYS.totalRounds, 5));
  const [activeSessionId, setActiveSessionId] = useState(() => readStored(STORAGE_KEYS.activeSession, `session-${Date.now()}`));
  const [sessions, setSessions] = useState<Session[]>(() => readStored<Session[]>(STORAGE_KEYS.sessions, initialSessions).filter((session) => session.winner !== "Green Team" && session.winner !== "Night Shift" && session.winner !== "Product Crew").map((session) => ({ ...session, sessionId: session.sessionId ?? activeSessionId })));
  const [playerScores, setPlayerScores] = useState<Record<string, PlayerScore>>(() => Object.fromEntries(Object.entries(readStored<Record<string, PlayerScore>>(STORAGE_KEYS.playerScores, {})).filter(([name]) => name !== "Green Team" && name !== "Night Shift" && name !== "Product Crew")));
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">(() => readStored(STORAGE_KEYS.theme, "dark"));
  const [showHistory, setShowHistory] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [historyPlayer, setHistoryPlayer] = useState("");
  const [showH2H, setShowH2H] = useState(false);
  const [showResetStatsDialog, setShowResetStatsDialog] = useState(false);
  const [deleteHistoryPlayerDialog, setDeleteHistoryPlayerDialog] = useState<string | null>(null);
  const [h2hPlayerA, setH2hPlayerA] = useState("");
  const [h2hPlayerB, setH2hPlayerB] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => readStored(STORAGE_KEYS.soundEnabled, true));
  const signalAt = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const getAudioContext = () => {
    if (!soundEnabled || typeof window === "undefined") return null;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioContextClass();
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playTone = (frequency: number, duration: number, type: OscillatorType = "sine", delay = 0, volume = 0.045) => {
    const context = getAudioContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  const playWarning = () => {
    playTone(740, 0.09, "square", 0, 0.028);
    playTone(740, 0.09, "square", 0.2, 0.028);
  };

  const playSignal = () => playTone(1680, 0.14, "triangle", 0, 0.07);
  const playSuccess = () => {
    playTone(520, 0.12, "sine", 0, 0.05);
    playTone(780, 0.18, "sine", 0.11, 0.05);
  };

  const playError = () => {
    playTone(180, 0.16, "sawtooth", 0, 0.055);
    playTone(120, 0.2, "square", 0.09, 0.04);
  };

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
    if (!persistedStateQuery.isSuccess) return;
    if (persistedStateQuery.data?.state) {
      try {
        const persisted = persistedStateQuery.data.state;
        if (Array.isArray(persisted.sessions)) setSessions(persisted.sessions);
        if (persisted.playerScores && typeof persisted.playerScores === "object") setPlayerScores(persisted.playerScores);
        if (typeof persisted.playerName === "string") {
          setPlayerName(persisted.playerName);
          setSessionNickname(persisted.playerName);
        }
        if (typeof persisted.totalRounds === "number") setTotalRounds(persisted.totalRounds);
        if (typeof persisted.activeSessionId === "string") setActiveSessionId(persisted.activeSessionId);
      } catch {
        toast.error("Saved game data could not be read", { description: "QuickTap will continue with the local copy." });
      }
    }
    databaseHydrated.current = true;
  }, [persistedStateQuery.data, persistedStateQuery.isSuccess]);

  useEffect(() => {
    if (!databaseHydrated.current) return;
    savePersistedState.mutate({ ownerKey, state: { sessions, playerScores, playerName, totalRounds, activeSessionId } });
  }, [sessions, playerScores, playerName, totalRounds, activeSessionId]);

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

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.soundEnabled, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const getNicknameSuggestions = (seed: string) => {
    const base = seed.trim().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").slice(0, 14) || "Player";
    const taken = new Set([...Object.keys(playerScores), ...sessions.map((session) => session.winner)].map((name) => name.trim()));
    return [`${base}2`, `${base}01`, `${base}Prime`, `${base}Pro`, `${base}Team`].filter((name, index, list) => !taken.has(name) && list.indexOf(name) === index).slice(0, 3);
  };

  const armRound = () => {
    const normalizedName = playerName.trim();
    if (!normalizedName) {
      setNicknameError("Enter a nickname before starting.");
      setNicknameSuggestions([]);
      setSelectedNicknameSuggestion(0);
      return;
    }
    setSessionNickname(normalizedName);
    setNicknameError("");
    setNicknameSuggestions([]);
    setSelectedNicknameSuggestion(0);
    window.clearTimeout(timerRef.current);
    playWarning();
    setReactionTime(null);
    setGameState("armed");
    timerRef.current = window.setTimeout(() => {
      signalAt.current = performance.now();
      playSignal();
      setGameState("live");
    }, 1350 + Math.floor(Math.random() * 2200));
  };

  const handleArenaClick = () => {
    if (gameState === "armed") {
      window.clearTimeout(timerRef.current);
      playError();
      setGameState("false-start");
      toast.error("False start", { description: "Wait for the green signal." });
      return;
    }
    if (gameState !== "live") return;
    const result = Math.max(1, Math.round(performance.now() - signalAt.current));
    playSuccess();
    setReactionTime(result);
    setRoundTimes((current) => [...current, result]);
    setGameState("result");
    const playerKey = playerName.trim() || "Unnamed player";
    const nextSession: Session = { sessionId: activeSessionId, date: "Just now", players: 1, best: result, winner: playerKey, round };
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

  const toggleTheme = () => {
    document.documentElement.classList.add("theme-transition");
    setTheme((value) => value === "dark" ? "light" : "dark");
    window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 380);
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

  const deleteHistoryPlayer = () => {
    const playerKey = selectedHistoryPlayer.trim();
    if (!playerKey) return;
    const remainingSessions = sessions.filter((session) => session.winner.trim() !== playerKey);
    const remainingScores = Object.fromEntries(Object.entries(playerScores).filter(([name]) => name.trim() !== playerKey));
    const remainingNames = Array.from(new Set([...remainingSessions.map((session) => session.winner.trim()), ...Object.keys(remainingScores).map((name) => name.trim())])).filter((name) => name && name !== playerKey).sort((a, b) => a.localeCompare(b));
    setSessions(remainingSessions);
    setPlayerScores(remainingScores);
    if (playerKey === activePlayerName.trim()) {
      const nextPlayer = remainingNames[0] ?? "";
      setPlayerName(nextPlayer);
      setSessionNickname(nextPlayer);
      setRoundTimes([]);
      setReactionTime(null);
      setRound(1);
      setGameState("idle");
    }
    setHistoryPlayer("");
    setDeleteHistoryPlayerDialog(null);
    toast.success("Player deleted", { description: `${playerKey}'s saved scores and session history were removed.` });
  };

  const clearSessionHistory = () => {
    const playerKey = historyPlayer || playerName.trim() || "Unnamed player";
    if (typeof window !== "undefined" && !window.confirm(`Clear every logged entry for ${playerKey}? Your saved best score will remain.`)) return;
    setSessions((current) => current.filter((session) => session.winner !== playerKey));
    setRoundTimes([]);
    setReactionTime(null);
    setGameState("idle");
    toast.success("Session history cleared", { description: "Your saved best score was kept." });
  };

  const activePlayerName = playerName.trim() || "Unnamed player";
  const historyPlayerOptions = Array.from(new Set([activePlayerName, ...sessions.map((session) => session.winner)])).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const selectedHistoryPlayer = historyPlayerOptions.includes(historyPlayer) ? historyPlayer : activePlayerName;
  const h2hPlayerOptions = historyPlayerOptions;
  const selectedH2hPlayerA = h2hPlayerOptions.includes(h2hPlayerA) ? h2hPlayerA : activePlayerName;
  const selectedH2hPlayerB = h2hPlayerOptions.find((name) => name === h2hPlayerB && name !== selectedH2hPlayerA) ?? h2hPlayerOptions.find((name) => name !== selectedH2hPlayerA) ?? "";
  const getPlayerEntries = (name: string) => sessions.filter((session) => session.winner === name).slice().sort((a, b) => {
    const sessionDelta = sessionOrder(a) - sessionOrder(b);
    return sessionDelta || ((a.round ?? 0) - (b.round ?? 0));
  });
  const h2hEntriesA = getPlayerEntries(selectedH2hPlayerA);
  const h2hEntriesB = getPlayerEntries(selectedH2hPlayerB);
  const h2hMaxRounds = Math.max(h2hEntriesA.length, h2hEntriesB.length, 1);
  const h2hAllValues = [...h2hEntriesA, ...h2hEntriesB].map((entry) => entry.best);
  const h2hMin = h2hAllValues.length ? Math.min(...h2hAllValues) : 0;
  const h2hMax = h2hAllValues.length ? Math.max(...h2hAllValues) : 1;
  const h2hPointString = (entries: Session[]) => entries.map((entry, index) => {
    const x = h2hMaxRounds === 1 ? 240 : 18 + (index / (h2hMaxRounds - 1)) * 444;
    const y = 18 + ((entry.best - h2hMin) / Math.max(1, h2hMax - h2hMin)) * 104;
    return `${x},${y}`;
  }).join(" ");
  const h2hPointsA = h2hPointString(h2hEntriesA);
  const h2hPointsB = h2hPointString(h2hEntriesB);
  const h2hAverageA = h2hEntriesA.length ? Math.round(h2hEntriesA.reduce((sum, entry) => sum + entry.best, 0) / h2hEntriesA.length) : 0;
  const h2hAverageB = h2hEntriesB.length ? Math.round(h2hEntriesB.reduce((sum, entry) => sum + entry.best, 0) / h2hEntriesB.length) : 0;
  const h2hBestA = h2hEntriesA.length ? Math.min(...h2hEntriesA.map((entry) => entry.best)) : 0;
  const h2hBestB = h2hEntriesB.length ? Math.min(...h2hEntriesB.map((entry) => entry.best)) : 0;
  const h2hWorstA = h2hEntriesA.length ? Math.max(...h2hEntriesA.map((entry) => entry.best)) : 0;
  const h2hWorstB = h2hEntriesB.length ? Math.max(...h2hEntriesB.map((entry) => entry.best)) : 0;
  const h2hWinner = h2hAverageA && h2hAverageB ? (h2hAverageA < h2hAverageB ? selectedH2hPlayerA : h2hAverageB < h2hAverageA ? selectedH2hPlayerB : "") : "";
  const activePlayerRawEntries = sessions.filter((session) => session.winner === activePlayerName);
  const activePlayerEntries = activePlayerRawEntries.slice().sort((a, b) => {
    const sessionDelta = sessionOrder(a) - sessionOrder(b);
    return sessionDelta || ((a.round ?? 0) - (b.round ?? 0));
  });
  const selectedPlayerEntries = sessions.filter((session) => session.winner === selectedHistoryPlayer).slice().sort((a, b) => {
    const sessionDelta = sessionOrder(a) - sessionOrder(b);
    return sessionDelta || ((a.round ?? 0) - (b.round ?? 0));
  });
  const activeSessionEntries = selectedPlayerEntries;
  const historyFastest = activeSessionEntries.length ? Math.min(...activeSessionEntries.map((session) => session.best)) : null;
  const trendValues = selectedPlayerEntries.map((session) => session.best);
  const trendMax = trendValues.length ? Math.max(...trendValues) : 1;
  const trendMin = trendValues.length ? Math.min(...trendValues) : 0;
  const trendAverage = trendValues.length ? Math.round(trendValues.reduce((sum, value) => sum + value, 0) / trendValues.length) : 0;
  const trendPoints = trendValues.map((value, index) => {
    const x = trendValues.length === 1 ? 240 : 18 + (index / (trendValues.length - 1)) * 444;
    const y = 18 + ((value - trendMin) / Math.max(1, trendMax - trendMin)) * 104;
    return `${x},${y}`;
  }).join(" ");
  const playerLeaderboard = Object.entries(playerScores).map(([name, score]) => ({ name, score: score.best, avg: Math.round(score.total / score.rounds) })).sort((a, b) => a.score - b.score).map((player, index) => ({ ...player, rank: index + 1 }));
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

  const retryPersistence = () => {
    if (persistedStateQuery.isError) {
      void persistedStateQuery.refetch();
      return;
    }
    savePersistedState.mutate({ ownerKey, state: { sessions, playerScores, playerName, totalRounds, activeSessionId } });
  };

  const copyCode = () => {
    navigator.clipboard?.writeText("QT-4821");
    toast.success("Session code copied", { description: "Share it with your team." });
  };

  return (
    <main className="quicktap-shell">
      <aside className={`left-rail ${showMobileNav ? "mobile-nav-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div><div className="brand-name">QUICK<span>TAP</span></div><div className="brand-caption">REACTION / TEAM MODE</div></div>
        </div>
        <nav id="mobile-primary-nav" className="rail-nav" aria-label="Primary">
          <button className="rail-link play-link active"><Zap size={15} /> Play</button>
          <button className="rail-link" onClick={() => { setShowHistory(true); setShowMobileNav(false); }}><History size={15} /> Session history</button>
          <button className="rail-link" onClick={() => { setShowH2H(true); setShowMobileNav(false); }}><Users size={15} /> H2H</button>
        </nav>
        <div className="rail-bottom round-context"><div className="room-note">ROUND CONTEXT<br /><strong>{playerName}</strong> · Round {round} of {totalRounds}</div></div>
      </aside>

      <section className="main-stage">
        <header className="topbar">
          <button className="mobile-menu" type="button" onClick={() => setShowMobileNav((value) => !value)} aria-expanded={showMobileNav} aria-controls="mobile-primary-nav" aria-label={showMobileNav ? "Close navigation menu" : "Open navigation menu"}>{showMobileNav ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb"><span>MEETING ROOM</span><ArrowRight size={13} /><strong>QUICKTAP</strong></div>
          <div className="topbar-actions"><button className={`persistence-status ${persistenceStatus === "LOCAL COPY" ? "is-offline" : ""}`} type="button" onClick={() => { if (persistenceStatus === "LOCAL COPY") retryPersistence(); }} title={persistenceStatus === "LOCAL COPY" ? "Retry database sync" : "QuickTap data persistence status"}>{persistenceStatus}</button><button className="sound-toggle" onClick={() => setSoundEnabled((value) => !value)} aria-pressed={soundEnabled} aria-label={soundEnabled ? "Mute game sounds" : "Unmute game sounds"}>{soundEnabled ? "SOUND ON" : "SOUND OFF"}</button><button className="theme-toggle" onClick={toggleTheme} aria-pressed={theme === "light"} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button><button className="icon-button" onClick={reset} aria-label="Reset session"><RotateCcw size={16} /></button></div>
        </header>

        <div className="stage-content">
          <div className="stage-heading">
            <div><div className="eyebrow"><span className="lime-dash" /> ROUND {String(round).padStart(2, "0")} / {String(totalRounds).padStart(2, "0")}</div><h1>Make your move<br /><em>count.</em></h1></div>
            <div className="stage-heading-right"><div className="mini-stat"><span>YOUR BEST</span><strong>{bestTime ?? "—"} <small>{bestTime ? "ms" : "waiting"}</small></strong></div><button className="stats-reset" onClick={() => setShowResetStatsDialog(true)}><RotateCcw size={13} /> Reset stats</button></div>
          </div>

          <div className={`reaction-arena state-${gameState}`} onClick={handleArenaClick} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleArenaClick()} aria-label="Reaction game arena">
            <div className="arena-grid" />
            <div className="arena-corner corner-tl">WAIT TIME<br /><span>1.35 — 3.55 SEC</span></div>
            <div className="arena-corner corner-tr">INPUT<br /><span>POINTER / SPACE</span></div>
            <div className="arena-center">
              {gameState === "live" ? <div className="tap-target"><div className="target-cross"><span /></div><div className="target-label">TAP NOW</div></div> : gameState === "result" ? <div className="result-readout"><div className="result-label">REACTION TIME</div><div className="result-number">{reactionTime}<small>ms</small></div><div className="result-badge"><Check size={13} /> Logged for {playerName}</div></div> : gameState === "summary" ? <div className="summary-readout"><div className="result-label">FINAL LEADERBOARD</div><div className="summary-title">{playerName || "Unnamed player"}</div><div className="summary-metrics"><div><span>BEST</span><strong>{bestTime ?? "—"}<small>ms</small></strong></div><div><span>AVG</span><strong>{sessionAverage ?? "—"}<small>ms</small></strong></div></div><div className="summary-list">{playerLeaderboard.length ? playerLeaderboard.map((player) => <div className={`summary-row ${player.name === activePlayerName ? "highlight" : ""}`} key={player.name}><span>{String(player.rank).padStart(2, "0")}</span><strong>{player.name}</strong><b>{player.score}<small>ms</small></b></div>) : <div className="summary-row highlight"><span>01</span><strong>{activePlayerName}</strong><b>—<small>ms</small></b></div>}</div></div> : gameState === "idle" ? <div className="setup-panel" onClick={(event) => event.stopPropagation()}><div className="wait-icon"><Users size={25} /></div><div className="wait-kicker">{stateCopy.kicker}</div><div className="wait-title">{stateCopy.title}</div><div className="setup-fields"><label><span>PLAYER NICKNAME</span><input className={nicknameError ? "nickname-input nickname-input-error" : "nickname-input"} value={playerName} maxLength={18} aria-invalid={Boolean(nicknameError)} onChange={(event) => { setPlayerName(event.target.value); setNicknameError(""); setNicknameSuggestions([]); setSelectedNicknameSuggestion(0); }} onKeyDown={(event) => { if (!nicknameSuggestions.length) return; if (event.key === "ArrowDown") { event.preventDefault(); setSelectedNicknameSuggestion((index) => (index + 1) % nicknameSuggestions.length); } else if (event.key === "ArrowUp") { event.preventDefault(); setSelectedNicknameSuggestion((index) => (index - 1 + nicknameSuggestions.length) % nicknameSuggestions.length); } else if (event.key === "Enter") { event.preventDefault(); const suggestion = nicknameSuggestions[selectedNicknameSuggestion]; if (suggestion) { setPlayerName(suggestion); setNicknameError(""); setNicknameSuggestions([]); setSelectedNicknameSuggestion(0); } } }} placeholder="Your nickname" /></label><label><span>ROUNDS</span><select value={totalRounds} onChange={(event) => setTotalRounds(Number(event.target.value))}><option value={3}>03 rounds</option><option value={5}>05 rounds</option><option value={7}>07 rounds</option><option value={10}>10 rounds</option></select></label></div>{nicknameError && <div className="nickname-warning" role="alert"><strong>{nicknameError}</strong><span>Try one of these available options:</span><div className="nickname-suggestions">{nicknameSuggestions.map((suggestion, index) => <button type="button" className={index === selectedNicknameSuggestion ? "suggestion-selected" : ""} aria-current={index === selectedNicknameSuggestion ? "true" : undefined} key={suggestion} onClick={() => { setPlayerName(suggestion); setNicknameError(""); setNicknameSuggestions([]); setSelectedNicknameSuggestion(0); }}>{suggestion}</button>)}</div><small className="suggestion-hint">Use ↑ ↓ to choose · Enter to select</small></div>}<div className="wait-sub">{stateCopy.sub}</div></div> : <div className="wait-readout"><div className="wait-icon">{gameState === "false-start" ? <RotateCcw size={26} /> : <Activity size={26} />}</div><div className="wait-kicker">{stateCopy.kicker}</div><div className="wait-title">{stateCopy.title}</div><div className="wait-sub">{stateCopy.sub}</div></div>}
            </div>
            <div className="arena-corner corner-bl">SESSION<br /><span>TEAM / {String(totalRounds).padStart(2, "0")} ROUNDS</span></div>
            <div className="arena-corner corner-br"><Keyboard size={13} /> SPACEBAR ENABLED</div>
          </div>

          <div className="stage-controls"><button className={`primary-button ${gameState === "armed" ? "loading" : ""}`} onClick={(event) => { event.stopPropagation(); gameState === "result" || gameState === "false-start" ? startNext() : gameState === "summary" ? reset() : gameState === "idle" ? armRound() : undefined; }} disabled={gameState === "armed" || gameState === "live"}><span className="button-icon">{gameState === "idle" ? <Play size={15} fill="currentColor" /> : gameState === "result" || gameState === "false-start" ? <RotateCcw size={15} /> : gameState === "summary" ? <RotateCcw size={15} /> : <Radio size={15} />}</span>{stateCopy.button}<ArrowRight size={15} /></button><div className="control-hint"><span className="keycap">SPACE</span> to tap <span className="dot-separator">·</span> <button onClick={() => toast.info("The target appears once per round after a random 1.35–3.55 second delay.")}>How it works <ChevronDown size={13} /></button></div></div>
        </div>
      </section>

      <aside className="score-panel">
        <div className="score-panel-header"><div><div className="eyebrow">LEADERBOARD</div><h2>TOP SCORES</h2></div><Crown size={18} className="crown" /></div>
        <div className="leaderboard-list">{playerLeaderboard.length ? playerLeaderboard.map((player) => <div className={`leader-row ${player.name === activePlayerName ? "leader" : ""}`} key={player.name}><div className="rank">{String(player.rank).padStart(2, "0")}</div><div className="team-symbol">{player.rank === 1 ? <Sparkles size={14} /> : <ShieldCheck size={14} />}</div><div className="team-details"><strong>{player.name}</strong><span>AVG {player.avg} MS</span></div><div className="team-score">{player.score.toLocaleString()}</div></div>) : <div className="leaderboard-empty"><ShieldCheck size={15} /><span>No logged stats yet.<small>Complete a round to enter your board.</small></span></div>}</div>
        <div className="score-divider" />
        <div className="panel-subhead"><span>SESSION HISTORY</span><button onClick={() => setShowHistory(!showHistory)}>{showHistory ? "Hide" : "View all"} <ArrowRight size={13} /></button></div>
        {(showHistory ? activeSessionEntries : activePlayerEntries.slice(0, 2)).map((session, index) => <div className="history-row" key={`${session.sessionId}-${session.round ?? index + 1}-${session.date}-${session.best}-${index}`}><div className="history-icon"><Clock3 size={14} /></div><div className="history-details"><strong>{session.winner}</strong><span>{session.date} · {session.players} players</span></div><div className="history-best">{session.best}<small>ms</small></div></div>)}
        <div className="panel-footer"><div className="footer-activity"><div className="activity-bars"><i /><i /><i /><i /><i /></div><span>ACTIVE</span></div></div>
      </aside>
      {showHistory && <div className="history-overlay" role="dialog" aria-modal="true" aria-labelledby="history-title"><div className="history-dialog"><div className="history-dialog-head"><div><div className="eyebrow">SESSION ARCHIVE</div><h2 id="history-title">{selectedHistoryPlayer} / full history</h2><p>All reaction entries logged under {selectedHistoryPlayer}, across every session.</p><label className="history-player-picker"><span>VIEW PLAYER</span><select value={selectedHistoryPlayer} onChange={(event) => setHistoryPlayer(event.target.value)} aria-label="View player history">{historyPlayerOptions.map((name) => <option value={name} key={name}>{name}</option>)}</select><button className="history-delete-player" type="button" onClick={() => setDeleteHistoryPlayerDialog(selectedHistoryPlayer)}>Delete player</button></label></div><button className="history-close" onClick={() => setShowHistory(false)} aria-label="Close session history">Close</button></div><div className="history-trend"><div className="history-trend-head"><div><div className="eyebrow">REACTION TREND</div><strong>{activeSessionEntries.length ? `${activeSessionEntries.length} entr${activeSessionEntries.length === 1 ? "y" : "ies"} logged` : "No entries logged"}</strong></div>{activeSessionEntries.length > 0 && <span>AVG {trendAverage}MS</span>}</div>{activeSessionEntries.length ? <svg className="trend-chart" viewBox="0 0 480 150" role="img" aria-label={`Reaction time trend for ${selectedHistoryPlayer}`}><line x1="18" y1="18" x2="464" y2="18" /><line x1="18" y1="122" x2="464" y2="122" /><polyline points={trendPoints} />{trendValues.map((value, index) => { const [x, y] = trendPoints.split(" ")[index].split(","); return <g className="chart-point" key={`${value}-${index}`}><circle cx={x} cy={y} r="4"><title>{selectedHistoryPlayer} · Round {index + 1} · {value} ms · {activeSessionEntries[index]?.date ?? "Date unavailable"}</title></circle><text x={x} y="143" textAnchor="middle">R{index + 1}</text></g>; })}</svg> : <div className="trend-empty"><Activity size={15} /> Complete a round to plot your reaction trend.</div>}</div><div className="history-dialog-list">{activeSessionEntries.length ? activeSessionEntries.map((session, index) => <div className={`history-dialog-row ${historyFastest !== null && session.best === historyFastest ? "fastest" : ""}`} key={`${session.sessionId}-${session.date}-${session.best}-${index}`}><span>R{String(session.round ?? index + 1).padStart(2, "0")}</span><div><strong>{session.winner}</strong><small>{session.date} · {session.players} players</small></div><b>{session.best}<em>ms</em></b></div>) : <div className="history-dialog-empty"><Clock3 size={18} /><strong>No saved entries for this nickname.</strong><span>Complete a round and it will appear here across every session.</span></div>}</div><div className="history-dialog-actions"><button className="history-clear" onClick={clearSessionHistory}>Clear Session History</button><button className="history-dialog-action" onClick={() => setShowHistory(false)}>Back to play <ArrowRight size={14} /></button></div></div></div>}
      {showH2H && <div className="history-overlay" role="dialog" aria-modal="true" aria-labelledby="h2h-title"><div className="h2h-dialog"><div className="history-dialog-head"><div><div className="eyebrow">HEAD TO HEAD</div><h2 id="h2h-title">Reaction duel</h2><p>Compare two saved players across every logged session.</p></div><button className="history-close" onClick={() => setShowH2H(false)} aria-label="Close H2H comparison">Close</button></div>{h2hPlayerOptions.length > 1 ? <><div className="h2h-pickers"><label><span>PLAYER A</span><select value={selectedH2hPlayerA} onChange={(event) => setH2hPlayerA(event.target.value)}>{h2hPlayerOptions.map((name) => <option value={name} key={`a-${name}`}>{name}</option>)}</select></label><div className="h2h-vs">VS</div><label><span>PLAYER B</span><select value={selectedH2hPlayerB} onChange={(event) => setH2hPlayerB(event.target.value)}>{h2hPlayerOptions.filter((name) => name !== selectedH2hPlayerA).map((name) => <option value={name} key={`b-${name}`}>{name}</option>)}</select></label></div><div className="h2h-chart-panel"><div className="h2h-chart-head"><div className="eyebrow">REACTION TREND OVERLAY</div></div><svg className="trend-chart h2h-chart" viewBox="0 0 480 150" role="img" aria-label={`Head to head reaction trend comparing ${selectedH2hPlayerA} and ${selectedH2hPlayerB}`}><line x1="18" y1="18" x2="464" y2="18" /><line x1="18" y1="122" x2="464" y2="122" />{h2hPointsA && <polyline className="h2h-line-a" points={h2hPointsA} />}{h2hPointsB && <polyline className="h2h-line-b" points={h2hPointsB} />}{h2hEntriesA.map((entry, index) => { const [x, y] = h2hPointsA.split(" ")[index].split(","); return <circle className="h2h-dot-a chart-point" key={`a-dot-${entry.sessionId}-${entry.round ?? "legacy"}-${entry.date}-${entry.best}-${index}`} cx={x} cy={y} r="4"><title>{selectedH2hPlayerA} · Round {entry.round ?? index + 1} · {entry.best} ms · {entry.date}</title></circle>; })}{h2hEntriesB.map((entry, index) => { const [x, y] = h2hPointsB.split(" ")[index].split(","); return <circle className="h2h-dot-b chart-point" key={`b-dot-${entry.sessionId}-${entry.round ?? "legacy"}-${entry.date}-${entry.best}-${index}`} cx={x} cy={y} r="4"><title>{selectedH2hPlayerB} · Round {entry.round ?? index + 1} · {entry.best} ms · {entry.date}</title></circle>; })}</svg><div className="h2h-legend"><span><i className="legend-a" />{selectedH2hPlayerA} · AVG {h2hAverageA || "—"}MS</span><span><i className="legend-b" />{selectedH2hPlayerB} · AVG {h2hAverageB || "—"}MS</span></div><div className="h2h-summary-table"><div className="h2h-summary-row h2h-summary-header"><span>PLAYER</span><span>BEST</span><span>WORST</span><span>AVERAGE</span></div><div className="h2h-summary-row"><strong><i className="legend-a" />{selectedH2hPlayerA}{h2hWinner === selectedH2hPlayerA && <Trophy className="h2h-trophy" size={12} aria-label="H2H winner" />}</strong><b>{h2hBestA || "—"}<small>{h2hBestA ? "ms" : ""}</small></b><b>{h2hWorstA || "—"}<small>{h2hWorstA ? "ms" : ""}</small></b><b>{h2hAverageA || "—"}<small>{h2hAverageA ? "ms" : ""}</small></b></div><div className="h2h-summary-row"><strong><i className="legend-b" />{selectedH2hPlayerB}{h2hWinner === selectedH2hPlayerB && <Trophy className="h2h-trophy" size={12} aria-label="H2H winner" />}</strong><b>{h2hBestB || "—"}<small>{h2hBestB ? "ms" : ""}</small></b><b>{h2hWorstB || "—"}<small>{h2hWorstB ? "ms" : ""}</small></b><b>{h2hAverageB || "—"}<small>{h2hAverageB ? "ms" : ""}</small></b></div></div></div></> : <div className="h2h-empty"><Users size={18} /><strong>Add another player to unlock H2H.</strong><span>Complete a round under a second nickname, then compare both trend lines here.</span></div>}<button className="history-dialog-action" onClick={() => setShowH2H(false)}>Back to play <ArrowRight size={14} /></button></div></div>}
      {deleteHistoryPlayerDialog && <div className="reset-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-player-title"><div className="reset-confirm-dialog"><div className="eyebrow">CONFIRM DELETE</div><h2 id="delete-player-title">Delete {deleteHistoryPlayerDialog}?</h2><p>This removes every saved score and session history entry for this nickname. This action cannot be undone.</p><div className="reset-confirm-actions"><button className="reset-confirm-cancel" onClick={() => setDeleteHistoryPlayerDialog(null)}>Cancel</button><button className="reset-confirm-danger" onClick={deleteHistoryPlayer}>Delete player</button></div></div></div>}
      {showResetStatsDialog && <div className="reset-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="reset-stats-title" aria-describedby="reset-stats-description"><div className="reset-confirm-dialog"><div className="eyebrow">CONFIRM RESET</div><h2 id="reset-stats-title">Reset saved stats?</h2><p id="reset-stats-description">This will remove {playerName.trim() || "Unnamed player"}'s saved best, leaderboard entry, and session history. This action cannot be undone.</p><div className="reset-confirm-actions"><button className="reset-confirm-cancel" onClick={() => setShowResetStatsDialog(false)}>Cancel</button><button className="reset-confirm-danger" onClick={() => { setShowResetStatsDialog(false); resetStats(); }}>Reset stats</button></div></div></div>}
    </main>
  );
}
