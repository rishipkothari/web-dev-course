---
order: 21
part: D - Later
title: Payments with Stripe (stub, for Nannager)
minutes: 60
status: stub
---

# 21 - Payments with Stripe (stub)

Not written yet. It gets written when Nannager needs it, against Stripe's docs at that time. Outline so the shape is known:

1. **Before any code:** Vercel Pro (commercial use), Neon terms check, and turn staging back on (a long-lived `staging` branch with a branch-scoped Preview database), because money is the point where a pre-production environment earns its overhead.
2. **Test mode vs live mode:** Stripe gives two complete sets of keys. Test keys go wherever development values go; live keys only in Vercel Production. The same environment map, one more row.
3. **Checkout, not card forms:** Stripe Checkout or Payment Links, so card data never touches your app.
4. **Webhooks:** Stripe tells your server what happened (payment succeeded, subscription cancelled). Verify the signature on every webhook. Use the Stripe CLI to forward test webhooks to localhost.
5. **Idempotency:** Stripe can send the same webhook twice. Store processed event ids in a table with a unique constraint, so handling one twice is harmless.
6. **The source of truth is Stripe:** your database mirrors subscription state from webhooks; it does not decide it.
7. **Drills:** a failed payment, a refund, a webhook delivered twice, rotating the webhook secret.
