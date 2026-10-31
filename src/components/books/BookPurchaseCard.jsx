import React, { useState } from "react";
import { CreditCard, ShoppingBag, Clock, ExternalLink, Check, Copy, Trash2, ShieldCheck } from "lucide-react";
import { client } from "@/api/localClient";
import { useToast } from "@/components/ui/use-toast";

export default function BookPurchaseCard({
  book,
  onDelete,
  canDelete = false,
  returnUrl,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("buy"); // "buy" | "rent"
  const [loadingAction, setLoadingAction] = useState(null);
  const [copied, setCopied] = useState(false);

  const buyPrice = Number(book.buy_price ?? 4.99).toFixed(2);
  const rentPrice = Number(book.rent_price ?? 1.99).toFixed(2);
  const rentDays = book.rent_duration_days ?? 30;

  const handleCheckout = async (action) => {
    // Check if inside iframe
    if (window.self !== window.top) {
      toast({
        title: "Live checkout required",
        description: "Stripe checkout operates securely on the published app. Please open in a new tab.",
      });
      return;
    }

    setLoadingAction(action);
    try {
      const currentUrl = returnUrl || window.location.href.split("?")[0];
      const res = await client.functions.invoke("createBookCheckoutSession", {
        bookId: book.id,
        action,
        returnUrl: currentUrl,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast({
          title: "Payment error",
          description: res.data?.error || "Could not start Stripe checkout. Please try again.",
        });
      }
    } catch (err) {
      toast({
        title: "Checkout failed",
        description: err.message || "Failed to initialize Stripe checkout.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopy = () => {
    const url = book.amazon_url || `https://www.amazon.com/dp/${book.asin}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Amazon Kindle link copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group rounded-2xl bg-gradient-to-b border p-5 flex flex-col justify-between transition-all duration-200 relative ${
        selected
          ? "from-amber-500/[0.08] to-transparent border-amber-400/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/30"
          : "from-white/[0.05] to-transparent border-white/10 hover:border-white/20"
      }`}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectable && (
              <button
                type="button"
                onClick={onToggleSelect}
                aria-label={`Select book ${book.title}`}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                  selected
                    ? "bg-amber-400 text-black border border-amber-300 shadow-sm"
                    : "bg-white/10 text-transparent border border-white/30 hover:border-white/60"
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${selected ? "text-black stroke-[3]" : ""}`} />
              </button>
            )}
            <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Book {book.series_order || "•"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Stripe Verified
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy Amazon URL"
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(book.id, book.title)}
                title="Remove book"
                className="p-1 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & ASIN */}
        <h4 className="text-base font-semibold text-white line-clamp-2 leading-snug">
          {book.title}
        </h4>
        <p className="mt-1 text-[11px] text-white/40 font-mono">
          {book.asin ? `ASIN: ${book.asin} · ` : ""}{book.author || "Steven Thomas Turcott"}
        </p>

        {book.description && (
          <p className="mt-2.5 text-xs text-white/65 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Buy Now / Rent Tabs */}
        <div className="mt-4 p-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("buy")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === "buy"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buy Now</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === "buy" ? "bg-black/10 text-black" : "bg-white/10 text-white/70"}`}>
              ${buyPrice}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rent")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === "rent"
                ? "bg-amber-400 text-black shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Rent</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === "rent" ? "bg-black/10 text-black" : "bg-white/10 text-white/70"}`}>
              ${rentPrice}
            </span>
          </button>
        </div>

        {/* Tab Detail Pane */}
        <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          {activeTab === "buy" ? (
            <div className="flex items-center justify-between text-xs">
              <div className="text-white/70">
                <span className="font-semibold text-white block">Full Digital Purchase</span>
                <span className="text-[11px] text-white/40">Lifetime digital ownership & reader access</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-bold text-white">${buyPrice}</span>
                <span className="text-[10px] text-white/40 block">USD</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <div className="text-white/70">
                <span className="font-semibold text-amber-300 block">Digital Rental ({rentDays} Days)</span>
                <span className="text-[11px] text-white/40">Instant streaming & download pass</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-bold text-amber-300">${rentPrice}</span>
                <span className="text-[10px] text-white/40 block">USD</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
        <button
          onClick={() => handleCheckout(activeTab)}
          disabled={loadingAction !== null}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "buy"
              ? "bg-white text-black hover:bg-white/90"
              : "bg-amber-400 text-black hover:bg-amber-300"
          } disabled:opacity-50`}
        >
          {loadingAction === activeTab ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {activeTab === "buy" ? `Buy Now with Stripe · $${buyPrice}` : `Rent for ${rentDays} Days · $${rentPrice}`}
              </span>
            </>
          )}
        </button>

        {book.amazon_url && (
          <a
            href={book.amazon_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] text-white/50 hover:text-white/90 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <span>Or read on Amazon Kindle</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}