import { secrets } from "base44:runtime";
import { getStripeHeaders } from "../../shared/stripe.ts";

const APP_URL = "https://defiant-build-flow-labs.base44.app";
const PRO_PRICE_ID = "price_1UDqb2DK0S02iLjGRxbwC9Ko";

const APP_PRICES = {
  pro: "price_1UDqb2DK0S02iLjGRxbwC9Ko",
  builder_ai: "price_1UDvYJDK0S02iLjG93GNoO6A",
  fitness: "price_1UEVF0DK0S02iLjGZFHOrI32",
  support: "price_1UEVF0DK0S02iLjG3Khamda8",
  expenses: "price_1UEVF1DK0S02iLjG7mHYpQkl",
  habits: "price_1UEVF1DK0S02iLjGAG6OfQhE",
};

export default async function(req: Request): Promise<Response> {
  try {
    const origin = req.headers.get("origin") || APP_URL;

    const apiKey = secrets.get("STRIPE_SECRET_KEY");
    if (!apiKey) {
      return Response.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const appKey = body?.appSlug || body?.appKey;
    const selectedPriceId = body?.priceId || (appKey && APP_PRICES[appKey]) || PRO_PRICE_ID;
    const isOneTime = body?.mode === "payment" || selectedPriceId === APP_PRICES.builder_ai;
    const mode = isOneTime ? "payment" : "subscription";

    const returnPath = body?.returnPath || (appKey ? `/apps?app=${appKey}` : "/dashboard");
    const successUrl = `${origin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}${returnPath}?checkout=cancelled`;

    const params = new URLSearchParams();
    params.append("mode", mode);
    params.append("line_items[0][price]", selectedPriceId);
    params.append("line_items[0][quantity]", "1");
    params.append("payment_method_types[0]", "card");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    
    const appId = secrets.get("BASE44_APP_ID");
    if (appId) {
      params.append("metadata[base44_app_id]", appId);
      if (body?.appName) params.append("metadata[app_name]", body.appName);
      if (mode === "subscription") {
        params.append("subscription_data[metadata][base44_app_id]", appId);
      }
    }

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
      console.error("Stripe checkout error:", session.error?.message);
      return Response.json({ error: session.error?.message || "Stripe request failed" }, { status: 502 });
    }

    return Response.json({ url: session.url, sessionId: session.id, priceId: selectedPriceId });
  } catch (error: any) {
    console.error("createCheckoutSession failed:", error?.message);
    return Response.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}