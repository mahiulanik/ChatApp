/** Join class names, skipping falsy values. */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

/** "Ada Lovelace" -> "AL" */
export function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "#3b5bdb",
  "#0b7285",
  "#7048e8",
  "#c2255c",
  "#e8590c",
  "#2b8a3e",
  "#5f3dc4",
  "#1098ad",
  "#495057",
  "#a61e4d",
];

/** Deterministic fallback avatar color for users without a profile picture. */
export function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < String(name).length; i++) {
    hash = (hash * 31 + String(name).charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** "2:56 PM" */
export function formatTime(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayKey(dateInput) {
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "TODAY" | "YESTERDAY" | "OCT 12" */
export function formatDayLabel(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (dayKey(date) === dayKey(now)) return "TODAY";
  if (dayKey(date) === dayKey(yesterday)) return "YESTERDAY";
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

/** Tiny notification blip played for incoming messages when sound is on. */
let audioCtx = null;
export function playPop() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx ||= new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(940, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Audio is a nice-to-have; never let it break chat.
  }
}
