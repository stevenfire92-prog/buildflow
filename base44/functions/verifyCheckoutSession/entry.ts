import { secrets } from "base44:runtime";
import { getStripeHeaders } from "../../shared/stripe.ts";

export default async function(req) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string" || !/^cs_(test_)?[a-zA-Z0-9]+$/.test(sessionId)) {
      return Response.json({ error: "Invalid session id" }, { status: 400 });
    }

    const apiKey = secrets.get("STRIPE_SECRET_KEY");
    if (!apiKey) {
      return Response.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: getStripeHeaders(apiKey) }
    );
    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe retrieve error:", session.error?.message);
      return Response.json({ error: session.error?.message || "Stripe request failed" }, { status: 502 });
    }

    return Response.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email ?? null,
    });
  } catch (error) {
    console.error("verifyCheckoutSession failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}