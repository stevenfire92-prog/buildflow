// Notes engine — localStorage backed
const KEY = 'sfnotes:notes';

export function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveNotes(notes) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function addNote({ title = '', body = '', color = '#f97316' }) {
  const notes = getNotes();
  const note = {
    id: Date.now().toString(),
    title,
    body,
    color,
    pinned: false,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  notes.unshift(note);
  saveNotes(notes);
  return note;
}

export function updateNote(id, fields) {
  const notes = getNotes();
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  Object.assign(note, fields, { updated: new Date().toISOString() });
  saveNotes(notes);
}

export function deleteNote(id) {
  saveNotes(getNotes().filter((n) => n.id !== id));
}

export function togglePin(id) {
  const notes = getNotes();
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  note.pinned = !note.pinned;
  saveNotes(notes);
}

export function sortedNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updated) - new Date(a.updated);
  });
}
