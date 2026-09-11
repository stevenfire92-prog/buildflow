import React, { useState } from "react";

export default function AddBookForm({ onSave, onCancel, saving, bookCount = 0 }) {
  const [title, setTitle] = useState("");
  const [asin, setAsin] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState("");
  const [desc, setDesc] = useState("");
  const [buyPrice, setBuyPrice] = useState("4.99");
  const [rentPrice, setRentPrice] = useState("1.99");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      asin,
      url,
      order,
      desc,
      buyPrice,
      rentPrice,
      defaultOrder: bookCount + 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/60 block mb-1">Buy Price (USD)</label>
          <input
            type="number"
            step="0.01"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="4.99"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">Rent Price (USD, 30 days)</label>
          <input
            type="number"
            step="0.01"
            value={rentPrice}
            onChange={(e) => setRentPrice(e.target.value)}
            placeholder="1.99"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
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
          onClick={onCancel}
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
  );
}