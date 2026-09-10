import { secrets } from "base44:runtime";
import { getStripeHeaders } from "../../shared/stripe.ts";

const APP_URL = "https://defiant-build-flow-labs.base44.app";

export default async function(req) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string" || !/^cs_(test_)?[a-zA-Z0-9]+$/.test(sessionId)) {
      return Response.json({ error: "Invalid session id" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || APP_URL;
    if (!/^https?:\/\/[\w.-]+$/.test(origin)) {
      return Response.json({ error: "Invalid origin" }, { status: 400 });
    }

    const apiKey = secrets.get("STRIPE_SECRET_KEY");
    if (!apiKey) {
      return Response.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const csRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: getStripeHeaders(apiKey) }
    );
    const session = await csRes.json();
    if (!csRes.ok) {
      console.error("Stripe retrieve error:", session.error?.message);
      return Response.json({ error: session.error?.message || "Stripe request failed" }, { status: 502 });
    }

    const customerId = session.customer;
    if (!customerId) {
      return Response.json({ error: "No subscription found for this checkout session" }, { status: 404 });
    }

    const params = new URLSearchParams();
    params.append("customer", customerId);
    params.append("return_url", `${origin}/subscription`);

    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: getStripeHeaders(apiKey, {
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": crypto.randomUUID(),
      }),
      body: params,
    });

    const portal = await res.json();
    if (!res.ok) {
      console.error("Stripe portal error:", portal.error?.message);
      return Response.json({ error: portal.error?.message || "Stripe request failed" }, { status: 502 });
    }

    return Response.json({ url: portal.url });
  } catch (error) {
    console.error("createBillingPortalSession failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}