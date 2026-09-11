import React, { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Plus, Sparkles, BookMarked, Layers, ShieldCheck, CheckSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { logActivity } from "@/lib/activityLog";
import BookPurchaseCard from "@/components/books/BookPurchaseCard";
import BulkEditBooksDialog from "@/components/books/BulkEditBooksDialog";
import BulkBooksBar from "@/components/books/BulkBooksBar";
import BulkDeleteBooksDialog from "@/components/books/BulkDeleteBooksDialog";
import AddBookForm from "@/components/books/AddBookForm";

const AMAZON_SERIES_URL = "https://www.amazon.com/dp/B0GX2WYHTH";
const AMAZON_AUTHOR_URL = "https://www.amazon.ca/Steven-Thomas-Turcott/e/B0GX64C5FQ";

export default function KindleBooks() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [books, setBooks] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  // Bulk edit state
  const [selectMode, setSelectMode] = useState(false);
  const [selection, setSelection] = useState([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);

  const loadBooks = () => {
    base44.entities.KindleBook.list()
      .then((data) => {
        const sorted = [...(data || [])].sort((a, b) => (a.series_order || 0) - (b.series_order || 0));
        setBooks(sorted);
      })
      .catch(() => setBooks([]));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleAdd = async ({ title, asin, url, order, desc, buyPrice, rentPrice, defaultOrder }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const trimmedAsin = asin.trim().toUpperCase();
    const finalUrl = url.trim() || (trimmedAsin ? `https://www.amazon.com/dp/${trimmedAsin}` : "");
    if (!finalUrl) {
      toast({ title: "Please enter an Amazon URL or ASIN" });
      return;
    }

    setSavingAdd(true);
    try {
      await base44.entities.KindleBook.create({
        title: trimmedTitle,
        series_name: "Shadow Path",
        series_order: order ? Number(order) : defaultOrder,
        author: "Steven Thomas Turcott",
        asin: trimmedAsin,
        amazon_url: finalUrl,
        description: desc.trim(),
        format: "Kindle Edition",
        publication_date: "2026",
        buy_price: parseFloat(buyPrice) || 4.99,
        rent_price: parseFloat(rentPrice) || 1.99,
        rent_duration_days: 30,
      });
      toast({
        title: "Kindle book added",
        description: `${trimmedTitle} is now connected with Stripe Buy & Rent options.`,
      });
      setShowAdd(false);
      loadBooks();
    } catch {
      toast({ title: "Could not add book", description: "Please check the details and try again." });
    } finally {
      setSavingAdd(false);
    }
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

  const toggleSelect = (id) => {
    setSelection((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0) setSelectMode(true);
      return next;
    });
  };

  const selectAll = () => {
    if (!books) return;
    if (selection.length === books.length) {
      setSelection([]);
    } else {
      setSelection(books.map((b) => b.id));
      setSelectMode(true);
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelection([]);
  };

  const handleBulkEditSubmit = async (updates) => {
    if (selection.length === 0 || bulkBusy) return;
    setBulkBusy(true);
    const targetIds = [...selection];
    try {
      const payload = targetIds.map((id) => ({
        id,
        ...updates,
      }));
      await base44.entities.KindleBook.bulkUpdate(payload);

      // Optimistic local state update
      setBooks((prev) =>
        (prev || []).map((b) => (targetIds.includes(b.id) ? { ...b, ...updates } : b))
      );

      // Log detailed activity for the team feed & real-time updates
      const updatedTitles = (books || [])
        .filter((b) => targetIds.includes(b.id))
        .map((b) => b.title)
        .slice(0, 3)
        .join(", ");
      const extraCount = targetIds.length > 3 ? ` and ${targetIds.length - 3} more` : "";
      const fieldList = Object.keys(updates)
        .map((k) => {
          if (k === "buy_price") return `Buy: $${updates[k]}`;
          if (k === "rent_price") return `Rent: $${updates[k]}`;
          if (k === "rent_duration_days") return `${updates[k]}d rental`;
          return `${k}: ${updates[k]}`;
        })
        .join(", ");

      logActivity({
        action: "updated",
        projectName: `Kindle Books (${targetIds.length})`,
        projectId: targetIds[0],
        details: `Bulk updated [${fieldList}] for ${updatedTitles}${extraCount}`,
      });

      toast({
        title: "Books updated",
        description: `Successfully updated prices & metadata for ${targetIds.length} book(s).`,
      });
      setShowBulkEdit(false);
      exitSelectMode();
      loadBooks();
    } catch {
      // Fallback: update in parallel if bulkUpdate hits schema validation nuances
      try {
        await Promise.all(
          targetIds.map((id) => base44.entities.KindleBook.update(id, updates))
        );
        setBooks((prev) =>
          (prev || []).map((b) => (targetIds.includes(b.id) ? { ...b, ...updates } : b))
        );
        toast({
          title: "Books updated",
          description: `Successfully updated prices & metadata for ${targetIds.length} book(s).`,
        });
        setShowBulkEdit(false);
        exitSelectMode();
        loadBooks();
      } catch (err) {
        toast({
          title: "Could not update books",
          description: err.message || "Please check your inputs and try again.",
        });
      }
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selection.length === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      await Promise.all(selection.map((id) => base44.entities.KindleBook.delete(id)));
      toast({
        title: "Books removed",
        description: `Removed ${selection.length} book(s).`,
      });
      setShowDeleteConfirm(false);
      exitSelectMode();
      loadBooks();
    } catch {
      toast({
        title: "Could not delete books",
        description: "Please try again.",
      });
    } finally {
      setBulkBusy(false);
    }
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
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              selectMode
                ? "bg-amber-400 text-black border-amber-300 font-semibold shadow-sm"
                : "text-white/70 bg-white/5 border border-white/10 hover:text-white hover:border-white/25"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{selectMode ? "Done Selecting" : "Select & Bulk Edit"}</span>
          </button>

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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Stripe Buy & Rent Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            <Layers className="w-3.5 h-3.5" />
            <span>{list.length} Books Connected</span>
          </div>
        </div>
      </div>

      {/* Add book form */}
      {showAdd && (
        <AddBookForm
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          saving={savingAdd}
          bookCount={list.length}
        />
      )}

      {/* Bulk Action Toolbar when in select mode */}
      {selectMode && (
        <BulkBooksBar
          selectionCount={selection.length}
          totalCount={list.length}
          onSelectAll={selectAll}
          onOpenBulkEdit={() => setShowBulkEdit(true)}
          onOpenDeleteConfirm={() => setShowDeleteConfirm(true)}
          onExit={exitSelectMode}
        />
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
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((book) => (
            <BookPurchaseCard
              key={book.id}
              book={book}
              canDelete={!selectMode}
              onDelete={handleDelete}
              selectable={selectMode}
              selected={selection.includes(book.id)}
              onToggleSelect={() => toggleSelect(book.id)}
            />
          ))}
        </div>
      )}

      {/* Bulk Edit Modal */}
      <BulkEditBooksDialog
        open={showBulkEdit}
        onOpenChange={setShowBulkEdit}
        selectedBooks={list.filter((b) => selection.includes(b.id))}
        onSubmit={handleBulkEditSubmit}
        busy={bulkBusy}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <BulkDeleteBooksDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        selectedBooks={list.filter((b) => selection.includes(b.id))}
        onConfirm={handleBulkDelete}
        busy={bulkBusy}
      />
    </section>
  );
}