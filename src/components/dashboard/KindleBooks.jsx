import React, { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Plus, Trash2, Copy, Check, Sparkles, BookMarked, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const AMAZON_SERIES_URL = "https://www.amazon.com/dp/B0GX2WYHTH";
const AMAZON_AUTHOR_URL = "https://www.amazon.ca/Steven-Thomas-Turcott/e/B0GX64C5FQ";

export default function KindleBooks() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [books, setBooks] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [asin, setAsin] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const loadBooks = () => {
    base44.entities.KindleBook.list("series_order", 50)
      .then(setBooks)
      .catch(() => setBooks([]));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const trimmedAsin = asin.trim().toUpperCase();
    const finalUrl = url.trim() || (trimmedAsin ? `https://www.amazon.com/dp/${trimmedAsin}` : "");
    if (!finalUrl) {
      toast({ title: "Please enter an Amazon URL or ASIN" });
      return;
    }

    setSaving(true);
    try {
      await base44.entities.KindleBook.create({
        title: trimmedTitle,
        series_name: "Shadow Path",
        series_order: order ? Number(order) : (books?.length || 0) + 1,
        author: "Steven Thomas Turcott",
        asin: trimmedAsin,
        amazon_url: finalUrl,
        description: desc.trim(),
        format: "Kindle Edition",
        publication_date: "2026",
      });
      toast({ title: "Kindle book added", description: `${trimmedTitle} is now connected.` });
      setTitle("");
      setAsin("");
      setUrl("");
      setOrder("");
      setDesc("");
      setShowAdd(false);
      loadBooks();
    } catch {
      toast({ title: "Could not add book", description: "Please check the details and try again." });
    }
    setSaving(false);
  };

  const handleDelete = async (id, bookTitle) => {
    try {
      await base44.entities.KindleBook.delete(id);
      toast({ title: "Book removed", description: `${bookTitle} removed.` });
      loadBooks();
    } catch {
      toast({ title: "Could not remove book" });
    }
  };

  const handleCopyLink = (book) => {
    navigator.clipboard.writeText(book.amazon_url || `https://www.amazon.com/dp/${book.asin}`);
    setCopiedId(book.id);
    toast({ title: "Amazon Kindle link copied" });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const list = books || [];

  return (
    <section className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              {t("kb.title") || "Kindle Books & Series"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-white/50 max-w-xl">
            {t("kb.subtitle") ||
              "All published works and dark fantasy novels by Steven Thomas Turcott (Se Fire Tech) available on Amazon Kindle."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={AMAZON_SERIES_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-full hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kindle Series Page</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>

          <a
            href={AMAZON_AUTHOR_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-full hover:text-white hover:border-white/25 transition-colors"
          >
            <span>Author Page</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>

          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Series Spotlight Banner */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Shadow Path — Complete 9-Book Dark Fantasy Epic
            </h3>
            <p className="text-xs text-white/60">
              By Steven Thomas Turcott · Available on Amazon Kindle Unlimited & Digital Store
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
          <Layers className="w-3.5 h-3.5" />
          <span>{list.length} Books Connected</span>
        </div>
      </div>

      {/* Add book form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Connect New Kindle Book
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 block mb-1">Book Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shadow Path Book 10"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/60 block mb-1">ASIN</label>
                <input
                  value={asin}
                  onChange={(e) => setAsin(e.target.value)}
                  placeholder="e.g. B0H132QN3M"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Series #</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 block mb-1">Amazon Kindle URL (optional if ASIN provided)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 block mb-1">Synopsis / Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Brief overview of the book..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-medium text-black bg-white rounded-full hover:bg-white/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Book"}
            </button>
          </div>
        </form>
      )}

      {/* Book Grid */}
      {books === null ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 py-8 text-center text-xs text-white/40">
          No books connected yet.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((book) => (
            <div
              key={book.id}
              className="group rounded-xl bg-white/[0.03] border border-white/10 p-4 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Book {book.series_order || "•"}
                  </span>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyLink(book)}
                      title="Copy Amazon link"
                      className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      {copiedId === book.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      title="Remove"
                      className="p-1 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="mt-2 text-sm font-medium text-white line-clamp-2 leading-snug">
                  {book.title}
                </h4>

                {book.asin && (
                  <p className="mt-1 text-[11px] text-white/40 font-mono">
                    ASIN: {book.asin} · {book.format || "Kindle Edition"}
                  </p>
                )}

                {book.description && (
                  <p className="mt-2 text-xs text-white/60 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/35">Amazon Kindle</span>
                <a
                  href={book.amazon_url || `https://www.amazon.com/dp/${book.asin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 rounded-full transition-colors"
                >
                  <span>Read on Kindle</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}