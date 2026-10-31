// Se Fire AI Chat — local simulated AI engine.
// All conversations persist in localStorage under 'sfaichat:conversations'.

const LS_KEY = 'sfaichat:conversations';

function readAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getConversations() {
  const convs = readAll();
  // newest first
  return [...convs].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveConversation(conv) {
  const convs = readAll();
  const idx = convs.findIndex((c) => c.id === conv.id);
  const next = { ...conv, updatedAt: Date.now() };
  if (idx >= 0) convs[idx] = next;
  else convs.unshift(next);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convs));
  } catch {
    // storage full / unavailable — keep it in memory only
  }
  return next;
}

export function deleteConversation(id) {
  try {
    const convs = readAll().filter((c) => c.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(convs));
  } catch {
    // ignore
  }
}

export function clearConversations() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}

export function newConversation() {
  return {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: 'New chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function deriveTitle(text) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'New chat';
  return clean.length > 42 ? clean.slice(0, 42) + '…' : clean;
}

// ---------- Simulated reply engine ----------

const JOKES = [
  'Why did the developer go broke? Because he used up all his cache. 🔥',
  'I told my friend a joke about UDP… he didn’t get it, and I don’t care.',
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'My WiFi went down for five minutes today. So I had to talk to my family. They seem like nice people.',
  'Why did the scarecrow win an award? Because he was outstanding in his field.',
  'I would tell you a joke about an infinite loop, but I would tell you a joke about an infinite loop, but I would tell you a joke about an infinite loop…',
  'Why don’t scientists trust atoms? Because they make up everything.',
  'Parallel lines have so much in common. Shame they’ll never meet.',
];

const DEFAULT_RESPONSES = [
  'Interesting thought! Here’s how I see it: keep it simple, start small, and iterate. What’s the next step you’re thinking about? 🔥',
  'Good one. My take: there’s no single right answer, but the best move is usually the one you can act on today. Want to dig deeper into it?',
  'I’m with you on that. If I had to boil it down to one line: trust the process, stay curious, and keep building. What else is on your mind?',
  'Hmm, let me think… Honestly, the fact you’re asking says a lot — curiosity is the whole game. Tell me more about where you’re headed with this.',
];

const EASTER_EGGS = [
  '🎉 You found a secret: Steve codes all his apps himself, from scratch, with love. Pass it on.',
  '🔥 Psst… try asking me about Se Fire’s music. Or don’t. I’ll still be here.',
  '✨ Easter egg unlocked: this chat runs 100% in your browser — no servers, no tracking, just vibes.',
];

const GREETING_RESPONSES = [
  'Hey! Great to see you. 🔥 What’s on your mind today?',
  'Hello! Ready when you are — ask me anything.',
  'Hey hey! What are we thinking about today?',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateReply(text) {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();

  // ~5% easter egg
  if (Math.random() < 0.05) {
    return pick(EASTER_EGGS);
  }

  // greeting
  if (/^(hi|hey|hello|yo|sup|howdy|hiya|hey there|hi there|hello there)\b/.test(lower)) {
    return pick(GREETING_RESPONSES);
  }

  // joke
  if (lower.includes('joke')) {
    return pick(JOKES);
  }

  // weather
  if (lower.includes('weather')) {
    return 'I can’t check live weather yet — but try the Se Fire Weather app! Meanwhile, dress for the vibe you want. 🔥';
  }

  // music / se fire promo
  if (lower.includes('music') || lower.includes('se fire')) {
    return 'Speaking of music — Se Fire’s catalog is on Spotify, Apple Music, SoundCloud and Amazon Music. Scroll down on this page and hit play. Real writing, real recording, real artistry. 🔥';
  }

  // identity
  if (lower.includes('who are you')) {
    return 'I’m Se Fire AI Chat — your companion for ideas, questions, and late-night thoughts. I run right here in your browser, no account needed.';
  }

  // thanks
  if (lower.includes('thank')) {
    return 'You’re welcome! Anytime. What’s next? 🔥';
  }

  // question
  if (raw.endsWith('?')) {
    const topic = raw.length > 60 ? raw.slice(0, 60).trim() + '…' : raw;
    return `Good question — “${topic}” Here’s my honest take: break it into smaller pieces, handle the easiest one first, and momentum will do the rest. Want me to look at it from another angle?`;
  }

  // default — rotate through generic responses
  const idx = Math.floor(Math.random() * DEFAULT_RESPONSES.length);
  return DEFAULT_RESPONSES[idx];
}

export function makeMessage(role, text) {
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    ts: Date.now(),
  };
}
