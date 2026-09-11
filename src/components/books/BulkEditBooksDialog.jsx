import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DollarSign, Clock, Layers, User, Calendar, BookOpen, Check, Sparkles } from "lucide-react";

const PRESETS = [
  { label: "$4.99 Buy · $1.99 Rent (30d)", buy: "4.99", rent: "1.99", days: "30" },
  { label: "$3.99 Buy · $0.99 Rent (30d)", buy: "3.99", rent: "0.99", days: "30" },
  { label: "$2.99 Buy · $0.99 Rent (14d)", buy: "2.99", rent: "0.99", days: "14" },
  { label: "$9.99 Buy · $2.99 Rent (60d)", buy: "9.99", rent: "2.99", days: "60" },
  { label: "$0.99 Promo · $0.99 Rent (30d)", buy: "0.99", rent: "0.99", days: "30" },
  { label: "$5.99 Buy · $2.49 Rent (45d)", buy: "5.99", rent: "2.49", days: "45" },
];

export default function BulkEditBooksDialog({
  open,
  onOpenChange,
  selectedBooks = [],
  onSubmit,
  busy = false,
}) {
  // Field toggles (which fields to overwrite)
  const [updateBuyPrice, setUpdateBuyPrice] = useState(true);
  const [buyPrice, setBuyPrice] = useState("4.99");

  const [updateRentPrice, setUpdateRentPrice] = useState(true);
  const [rentPrice, setRentPrice] = useState("1.99");

  const [updateRentDays, setUpdateRentDays] = useState(false);
  const [rentDays, setRentDays] = useState("30");

  const [updateSeriesName, setUpdateSeriesName] = useState(false);
  const [seriesName, setSeriesName] = useState("Shadow Path");

  const [updateAuthor, setUpdateAuthor] = useState(false);
  const [author, setAuthor] = useState("Steven Thomas Turcott");

  const [updateFormat, setUpdateFormat] = useState(false);
  const [format, setFormat] = useState("Kindle Edition");

  const [updatePublicationDate, setUpdatePublicationDate] = useState(false);
  const [publicationDate, setPublicationDate] = useState("2026");

  const [updateDescription, setUpdateDescription] = useState(false);
  const [description, setDescription] = useState("");

  const applyPreset = (preset) => {
    setUpdateBuyPrice(true);
    setBuyPrice(preset.buy);
    setUpdateRentPrice(true);
    setRentPrice(preset.rent);
    setUpdateRentDays(true);
    setRentDays(preset.days);
  };

  const handleApply = () => {
    const updates = {};
    if (updateBuyPrice && buyPrice !== "") {
      updates.buy_price = parseFloat(buyPrice);
    }
    if (updateRentPrice && rentPrice !== "") {
      updates.rent_price = parseFloat(rentPrice);
    }
    if (updateRentDays && rentDays !== "") {
      updates.rent_duration_days = parseInt(rentDays, 10);
    }
    if (updateSeriesName && seriesName.trim()) {
      updates.series_name = seriesName.trim();
    }
    if (updateAuthor && author.trim()) {
      updates.author = author.trim();
    }
    if (updateFormat) {
      updates.format = format;
    }
    if (updatePublicationDate && publicationDate.trim()) {
      updates.publication_date = publicationDate.trim();
    }
    if (updateDescription && description.trim()) {
      updates.description = description.trim();
    }

    if (Object.keys(updates).length === 0) return;
    onSubmit(updates);
  };

  const hasAnyFieldSelected =
    updateBuyPrice ||
    updateRentPrice ||
    updateRentDays ||
    updateSeriesName ||
    updateAuthor ||
    updateFormat ||
    updatePublicationDate ||
    updateDescription;

  const count = selectedBooks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <DialogTitle className="text-white text-lg">
              Bulk Edit Kindle Books
            </DialogTitle>
          </div>
          <DialogDescription className="text-white/50 text-xs">
            Apply price or metadata updates to {count} selected book{count !== 1 ? "s" : ""}. Only checked fields will be modified.
          </DialogDescription>
        </DialogHeader>

        {/* Selected preview pills */}
        <div className="pt-2">
          <div className="text-[11px] text-white/40 mb-1.5 uppercase tracking-wider font-semibold">
            Target Books ({count})
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/5">
            {selectedBooks.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/80"
              >
                <span className="text-amber-400 font-bold">#{b.series_order || "•"}</span>
                <span className="truncate max-w-[140px]">{b.title}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Price Presets */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Pricing Presets</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-[11px] text-white/80 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4 pt-3 border-t border-white/10">
          {/* Section: Pricing */}
          <div>
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Stripe Prices & Rental</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Buy Price */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={updateBuyPrice}
                    onChange={(e) => setUpdateBuyPrice(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-white">Buy Price (USD)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">$</span>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!updateBuyPrice}
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder="4.99"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Rent Price */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={updateRentPrice}
                    onChange={(e) => setUpdateRentPrice(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-white">Rent Price (USD)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">$</span>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!updateRentPrice}
                    value={rentPrice}
                    onChange={(e) => setRentPrice(e.target.value)}
                    placeholder="1.99"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Rent Duration */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={updateRentDays}
                    onChange={(e) => setUpdateRentDays(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-white">Rental Access Duration (Days)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    disabled={!updateRentDays}
                    value={rentDays}
                    onChange={(e) => setRentDays(e.target.value)}
                    placeholder="30"
                    className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30"
                  />
                  <div className="flex gap-1.5">
                    {[14, 30, 60, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={!updateRentDays}
                        onClick={() => setRentDays(String(d))}
                        className="px-2.5 py-1 rounded-md text-[10px] bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Metadata */}
          <div>
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Series & Metadata</span>
            </h4>

            <div className="space-y-2.5">
              {/* Series Name */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={updateSeriesName}
                    onChange={(e) => setUpdateSeriesName(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-white">Series Name</span>
                </label>
                <input
                  disabled={!updateSeriesName}
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  placeholder="e.g. Shadow Path"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30"
                />
              </div>

              {/* Author */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={updateAuthor}
                    onChange={(e) => setUpdateAuthor(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-white">Author Name</span>
                </label>
                <input
                  disabled={!updateAuthor}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Steven Thomas Turcott"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30"
                />
              </div>

              {/* Format & Publication Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={updateFormat}
                      onChange={(e) => setUpdateFormat(e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-white">Format</span>
                  </label>
                  <select
                    disabled={!updateFormat}
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-30 [&>option]:bg-zinc-900"
                  >
                    <option value="Kindle Edition">Kindle Edition</option>
                    <option value="Paperback">Paperback</option>
                    <option value="Hardcover">Hardcover</option>
                  </select>
                </div>

                <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={updatePublicationDate}
                      onChange={(e) => setUpdatePublicationDate(e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-white">Publication Date/Year</span>
                  </label>
                  <input
                    disabled={!updatePublicationDate}
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-white">Book Synopsis / Description</span>
                </label>
                <textarea
                  rows={2}
                  disabled={!updateDescription}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Set shared synopsis or description for selected books..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 disabled:opacity-30 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={busy || !hasAnyFieldSelected || count === 0}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-full transition-colors disabled:opacity-50 font-semibold"
          >
            {busy ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Updating {count} Books...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Apply to {count} Selected Book{count !== 1 ? "s" : ""}</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}