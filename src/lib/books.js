// Se Fire Books — localStorage helpers (100% local, no backend)
const BOOKS_KEY = 'sfbooks:books';

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getBooks() {
  try {
    const raw = localStorage.getItem(BOOKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBooks(books) {
  try {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function addBook({ title, author = '', totalPages = 0, coverColor = 'orange' }) {
  const books = getBooks();
  const book = {
    id: uid(),
    title: title.trim(),
    author: author.trim(),
    coverColor,
    totalPages: Math.max(0, Number(totalPages) || 0),
    currentPage: 0,
    notes: [],
    status: 'reading',
    addedAt: Date.now(),
    finishedAt: null,
  };
  books.unshift(book);
  saveBooks(books);
  return book;
}

export function updateBook(id, patch) {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const book = { ...books[idx], ...patch };
  // Keep currentPage within bounds
  if (typeof book.currentPage === 'number') {
    book.currentPage = Math.max(0, book.totalPages > 0 ? Math.min(book.currentPage, book.totalPages) : book.currentPage);
  }
  books[idx] = book;
  saveBooks(books);
  return book;
}

export function deleteBook(id) {
  saveBooks(getBooks().filter((b) => b.id !== id));
}

export function addNote(bookId, { text, page = null }) {
  const note = { id: uid(), text: text.trim(), page: page === '' || page === null ? null : Number(page), createdAt: Date.now() };
  const book = getBooks().find((b) => b.id === bookId);
  if (!book) return null;
  return updateBook(bookId, { notes: [note, ...(book.notes || [])] });
}

export function deleteNote(bookId, noteId) {
  const book = getBooks().find((b) => b.id === bookId);
  if (!book) return null;
  return updateBook(bookId, { notes: (book.notes || []).filter((n) => n.id !== noteId) });
}

// Stats
export function getStats() {
  const books = getBooks();
  return {
    booksFinished: books.filter((b) => b.status === 'finished').length,
    totalPagesRead: books.reduce((sum, b) => sum + (Number(b.currentPage) || 0), 0),
    booksReading: books.filter((b) => b.status === 'reading').length,
  };
}
