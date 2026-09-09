import { secrets } from "base44:runtime";
import { getStripeHeaders } from "../../shared/stripe.ts";

const APP_URL = "https://defiant-build-flow-labs.base44.app";
const PRO_PRICE_ID = "price_1UDo8wDWoiOngqzV3BfxvR3f";

export default async function(req) {
  try {
    const origin = req.headers.get("origin") || APP_URL;
    if (!/^https?:\/\/[\w.-]+$/.test(origin)) {
      return Response.json({ error: "Invalid origin" }, { status: 400 });
    }

    const apiKey = secrets.get("STRIPE_SECRET_KEY");
    if (!apiKey) {
      return Response.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price]", PRO_PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("payment_method_types[0]", "card");
    params.append("success_url", `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${origin}/dashboard?checkout=cancelled`);
    params.append("metadata[base44_app_id]", secrets.get("BASE44_APP_ID"));
    params.append("subscription_data[metadata][base44_app_id]", secrets.get("BASE44_APP_ID"));

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

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("createCheckoutSession failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}