import { secrets } from "base44:runtime";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { getStripeHeaders } from "../../shared/stripe.ts";

const APP_URL = "https://defiant-build-flow-labs.base44.app";

export default async function(req: Request): Promise<Response> {
  try {
    const origin = req.headers.get("origin") || APP_URL;
    const apiKey = secrets.get("STRIPE_SECRET_KEY");
    if (!apiKey) {
      return Response.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const payload = await req.json().catch(() => ({}));
    const { bookId, action = "buy", returnUrl } = payload;

    if (!bookId) {
      return Response.json({ error: "bookId is required" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    // Fetch the book details
    let book = null;
    try {
      book = await base44.asServiceRole.entities.KindleBook.get(bookId);
    } catch (e) {
      console.warn("Could not fetch book with asServiceRole, trying plain entities:", e.message);
      book = await base44.entities.KindleBook.get(bookId);
    }

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const isRent = action === "rent";
    const rawPrice = isRent ? (book.rent_price ?? 1.99) : (book.buy_price ?? 4.99);
    const unitAmount = Math.max(50, Math.round(Number(rawPrice) * 100)); // Minimum Stripe 50 cents

    const productName = `${book.title} — ${isRent ? "Digital Rental (30 Days)" : "Digital Edition (Full Purchase)"}`;
    const productDesc = isRent
      ? `30-Day Instant Digital Rental for "${book.title}" by ${book.author || "Steven Thomas Turcott"}.`
      : `Full digital purchase & permanent access to "${book.title}" by ${book.author || "Steven Thomas Turcott"}.`;

    const redirectBase = returnUrl && /^https?:\/\//.test(returnUrl) ? returnUrl : origin;
    const successUrl = `${redirectBase}?checkout=book_success&book_id=${encodeURIComponent(book.id)}&action=${encodeURIComponent(action)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${redirectBase}?checkout=cancelled`;

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[0]", "card");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", String(unitAmount));
    params.append("line_items[0][price_data][product_data][name]", productName);
    params.append("line_items[0][price_data][product_data][description]", productDesc);
    params.append("line_items[0][quantity]", "1");

    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);

    const appId = secrets.get("BASE44_APP_ID") || "";
    if (appId) {
      params.append("metadata[base44_app_id]", appId);
    }
    params.append("metadata[book_id]", String(book.id));
    params.append("metadata[book_title]", String(book.title || ""));
    params.append("metadata[purchase_type]", isRent ? "rent" : "buy");
    params.append("metadata[author]", String(book.author || "Steven Thomas Turcott"));

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: getStripeHeaders(apiKey, {
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": crypto.randomUUID(),
      }),
      body: params,
    });

    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe book checkout error:", session.error?.message);
      return Response.json(
        { error: session.error?.message || "Stripe checkout session failed" },
        { status: 502 }
      );
    }

    return Response.json({
      url: session.url,
      sessionId: session.id,
      amount: rawPrice,
      action: isRent ? "rent" : "buy",
      bookTitle: book.title,
    });
  } catch (error) {
    console.error("createBookCheckoutSession failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}