# RAZORPAY INTEGRATION — HARDENING & PRODUCTION-READINESS PROMPT

You are working on the existing **Good Fills** e-commerce project.

A Razorpay integration has already been implemented. **Do not rebuild it from scratch.** Audit the current implementation, fix weaknesses, and make it production-ready while preserving the existing Good Fills architecture and premium checkout UX.

Read first:
1. `agent.md`
2. `handoff.md`
3. Existing Razorpay/payment code
4. Checkout implementation
5. Cart/order persistence and shipping calculation
6. Environment/configuration
7. Existing tests

Use the following requirements as non-negotiable.

---

## 1. PAYMENT METHOD: UPI ONLY

Good Fills Phase 1 supports **UPI only**.

Do NOT offer:
- Cards
- Netbanking
- Wallets
- EMI
- Pay Later
- Any other payment method

The current implementation reportedly exposes Cards, Netbanking and other methods. Change this so Razorpay Checkout itself is configured for **UPI only**, not merely hidden with frontend CSS/UI logic.

Use Razorpay's supported Checkout Payment Configuration / payment-method controls and make the Razorpay Dashboard configuration consistent with the application. Razorpay currently supports enabling/disabling specific checkout methods. See: https://razorpay.com/blog/checkout-payment-configuration-razorpay/

The Good Fills checkout UI should simply communicate:

**Secure UPI payment powered by Razorpay**

Avoid a payment-method selector that suggests multiple choices when only one is allowed.

---

## 2. REMOVE THE DIRECT PERSONAL UPI FALLBACK

The existing implementation reportedly contains:

`9742068899@upi`

Do **not** expose this as an alternative production checkout path.

For Phase 1, Razorpay UPI is the single automatic payment path.

A direct VPA/QR payment outside Razorpay must not:
- Automatically mark an order as paid
- Bypass Razorpay verification
- Share the same automatic payment-success flow

If the VPA must remain in the codebase for a future/manual support flow, isolate it and ensure it is impossible to use as a normal production payment method.

---

## 3. KEEP SECRET KEYS SERVER-SIDE

Retain the server-side Razorpay SDK/client.

Public:
`NEXT_PUBLIC_RAZORPAY_KEY_ID`

Server-only:
`RAZORPAY_KEY_SECRET`
`RAZORPAY_WEBHOOK_SECRET`

Never expose secrets in client bundles, API responses, logs, errors, or public environment variables.

---

## 4. SERVER-CREATED RAZORPAY ORDERS

Every payment attempt must use a genuine Razorpay Order created by the server.

The server must create it with:
- Authoritative amount
- INR currency
- Unique receipt/reference
- Internal Good Fills order reference
- Non-sensitive customer metadata where useful

Razorpay's integration guidance says an order should be created for every payment and its server-generated `order_id` passed to Checkout: https://razorpay.com/docs/server-integration/python/test-app/

---

## 5. NEVER TRUST CLIENT-SIDE TOTALS

The browser must NOT be authoritative for:
- Product prices
- Quantity prices
- Discounts
- Shipping
- Final total

The server must reconstruct/validate the total from trusted product/cart/order data.

Example:

```text
Product subtotal = ₹800
Shipping = ₹200
Total = ₹1000
```

Razorpay Order amount must be generated from that server-side total, not a `clientTotal` field.

If the client changes a product price, shipping amount, or final total in the request, the server must ignore the manipulated values.

---

## 6. SERVER-VALIDATE SHIPPING

Good Fills domestic shipping is based on **product weight only**:

```text
Up to 500g       ₹100
501g–1kg         ₹200
1.01–2kg         ₹400
2.01–3kg         ₹600
Each started
additional 1kg  +₹200
```

Example:

`1.2kg = ₹400`

Packaging weight is excluded from the customer-facing shipping calculation.

The same authoritative shipping calculation used by the cart/order must be used when creating the Razorpay order.

---

## 7. STRICT ORDER ↔ RAZORPAY MAPPING

Maintain a trusted mapping:

```text
Good Fills Order ID: ORD-1024
Razorpay Order ID: order_...
```

At payment verification:
1. Locate the internal order server-side.
2. Confirm the supplied Razorpay Order ID matches the stored Razorpay Order ID.
3. Confirm amount matches.
4. Confirm currency is INR.
5. Verify signature.
6. Verify payment state/capture state as appropriate.
7. Check duplicate/idempotency state.
8. Only then mark the payment Paid.

Razorpay explicitly recommends retrieving the order ID from a trusted source for HMAC verification and separately checking payment status/capture: https://razorpay.com/security/checklist

---

## 8. SIGNATURE VERIFICATION

Keep HMAC-SHA256 verification using:

```text
HMAC-SHA256(
  razorpay_order_id + "|" + razorpay_payment_id,
  RAZORPAY_KEY_SECRET
)
```

Use a timing-safe comparison where appropriate.

Signature verification is mandatory, but it is **not the only validation**. Also validate order mapping, amount, currency, payment status, and duplicate state.

Razorpay's official documentation identifies signature verification as a mandatory step: https://razorpay.com/docs/server-integration/python/test-app/

Do not claim that signature verification alone guarantees that every fraudulent payment can never confirm an order.

---

## 9. VERIFY PAYMENT STATUS / CAPTURE STATE

Do not blindly set `paymentStatus = Paid` solely because the signature is valid.

Verify the payment/order state as appropriate and ensure the transaction is in the expected valid/captured state before confirming the Good Fills payment.

Razorpay's security guidance recommends using backend/trusted payment status and appropriate capture settings: https://razorpay.com/security/checklist

---

## 10. ADD WEBHOOK SUPPORT

If a webhook endpoint does not already exist, add one such as:

`/api/webhooks/razorpay`

Use the exact current Razorpay event names/configuration during implementation. At minimum, cover the payment lifecycle needed for the application, such as `payment.captured` and `payment.failed`.

Webhook requirements:
- Validate webhook signature
- Use the webhook secret only server-side
- Parse and validate payloads safely
- Apply idempotent state transitions
- Persist relevant payment state
- Return the correct HTTP status
- Do not leak secrets

Razorpay recommends validating webhook requests using HMAC: https://razorpay.com/security/checklist

---

## 11. WEBHOOK IDEMPOTENCY

The same webhook may be delivered more than once.

Repeated processing must NOT:
- Create duplicate orders
- Create duplicate payments
- Increase revenue multiple times
- Send duplicate confirmations
- Move a paid order backward

Store a durable event identifier or implement an equivalent idempotent processing strategy.

---

## 12. CALLBACK + WEBHOOK RECONCILIATION

Browser callback provides fast UX.

Webhook provides server-to-server payment lifecycle confirmation.

Both must use the same safe payment-state transition logic.

Desired behavior:

```text
First valid confirmation → applies state
Later duplicate confirmation → safe no-op
```

Never allow a later duplicate/failed callback to downgrade:

`Paid → Pending`

---

## 13. DUPLICATE PAYMENT PROTECTION

Protect against:
- Double-clicking Pay
- Browser retries
- Network retries
- Repeated callbacks
- Repeated webhooks
- Refreshing the confirmation page
- Multiple payment attempts for the same internal order

At minimum:
- Payment ID must be unique
- Razorpay Order ID must map to one internal order
- Already-paid orders must not create another Paid transition
- Same payment must never generate two Good Fills orders

---

## 14. PAYMENT STATUS MODEL

Keep payment, order, and shipment state separate.

Payment:
```text
Pending
Paid
Failed
Refunded
```

Order:
```text
Pending
Confirmed
Processing
Ready to Ship
Shipped
Delivered
Cancelled
Returned
RTO
```

Shipment:
```text
Not Shipped
Handed Over
In Transit
Out for Delivery
Delivered
Delivery Failed
RTO
```

Do not collapse these into one `status` field.

---

## 15. PAYMENT FAILURE / ABANDONMENT

If payment fails:
- Do not mark Paid
- Do not mark the order Confirmed as paid
- Keep cart/order context so the customer can retry where appropriate
- Show a concise retry message

If the customer closes Razorpay without paying:
- Do not mark Paid
- Keep the appropriate Pending/abandoned state
- Allow retry where appropriate

Customer copy:

**Payment could not be completed. Please try again.**

---

## 16. SUCCESS FLOW

Use this final flow:

```text
Checkout
  ↓
Server calculates authoritative order total
  ↓
Good Fills order created/persisted
  ↓
Server creates Razorpay Order
  ↓
Razorpay Checkout
  ↓
Customer pays with UPI
  ↓
Browser callback
  ↓
Server validates mapping + amount + currency + signature + payment state
  ↓
Payment = Paid
  ↓
Order = Confirmed
  ↓
Order confirmation
```

Do not move to `Processing` until fulfillment actually begins.

---

## 17. PAYMENT RECORD

Persist enough information for support/reconciliation:

```text
Payment
├── id
├── orderId
├── provider
├── providerOrderId
├── providerPaymentId
├── amount
├── currency
├── status
├── method
├── signatureVerified
├── capturedAt
├── createdAt
└── updatedAt
```

Expected launch method:

`UPI`

Do not store card data or other unnecessary sensitive payment information.

---

## 18. CUSTOMER PREFILL

Retain prefill for:
- Name
- Email
- Phone

Source from authenticated customer/order data.

Do not treat prefill as trusted payment identity.

---

## 19. TEST / LIVE SEPARATION

Support both:

Test:
`rzp_test_...`

Live:
`rzp_live_...`

But enforce environment separation.

The existing Atelier Sandbox Simulator must be:

**development/test-only**

It must never activate in production.

Never use test credentials in production.
Never use live secrets in source code.

Do not claim that switching from test to live is literally “zero configuration changes.” The application code can support both, but production still requires correct live credentials, Razorpay Dashboard configuration, webhook setup, and applicable merchant/account activation/configuration.

---

## 20. ENVIRONMENT CHECKS

Use clear environment configuration.

At minimum:

```text
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Never prefix server secrets with `NEXT_PUBLIC_`.

Fail safely if required production configuration is missing.

---

## 21. CHECKOUT UX

Preserve the existing premium Good Fills / Atelier design.

Change only what is necessary for correctness and UPI-only behavior.

Payment UI should communicate one clear option:

**Pay with UPI**

Do not show a grid of different payment methods.
Do not show “Recommended” beside one method when it is the only allowed method.

Do not use UI/CSS hiding as the only control. The underlying Razorpay Checkout configuration must also prohibit non-UPI methods.

---

## 22. ORDER CONFIRMATION

After verified payment, show:
- Good Fills Order ID
- Products
- Quantities
- Total
- Payment status
- Delivery address
- Estimated delivery
- Order timeline

If a Razorpay payment reference is shown, label it clearly as a **payment reference**, not the customer's primary order ID.

Do not expose unnecessary provider internals.

---

## 23. WHATSAPP CONFIRMATION

If the existing system sends a WhatsApp message to the kitchen/business, only include the Razorpay payment reference if it is genuinely useful to the business and not sensitive.

Do not rely on WhatsApp as the payment verification mechanism.

---

## 24. SECURITY / LOGGING

Never log:
- API secret
- Webhook secret
- Passwords
- Payment credentials
- Sensitive tokens

Safe logs may include:
- Internal Order ID
- Non-sensitive provider IDs
- Event type
- Success/failure state
- Correlation IDs

Customer-facing errors must not expose stack traces or secrets.

---

## 25. SECURITY TESTS

Add/execute tests for:

### Valid payment
→ Paid

### Invalid signature
→ Rejected

### Wrong Razorpay Order ID
→ Rejected

### Wrong amount
→ Rejected

### Wrong currency
→ Rejected

### Reused payment ID
→ No duplicate

### Repeated webhook
→ Idempotent no-op

### Invalid webhook signature
→ Rejected

### Payment failed
→ Not Paid

### Client changes total
→ Server ignores manipulation

### Client changes product price
→ Server ignores manipulation

### Client changes shipping
→ Server ignores manipulation

### Browser says success but server verification fails
→ Not Paid

### Already-paid order receives another success callback
→ No duplicate transition

### Sandbox simulator in production
→ Blocked

### Test credentials in production
→ Blocked/alerted

---

## 26. REAL CHECKOUT METHOD TEST

Open the actual Razorpay Checkout, not just the Good Fills wrapper UI.

Verify the customer can see:

**UPI**

and cannot see:
- Cards
- Netbanking
- Wallets
- EMI
- Other methods

Do not mark this task complete just because the Good Fills UI hides those methods.

---

## 27. PAYMENT FLOW TEST MATRIX

| Scenario | Expected result |
|---|---|
| Successful UPI payment | Payment Paid + Order Confirmed |
| Failed UPI payment | Payment Failed / not Paid |
| User closes Razorpay | Not Paid |
| Invalid signature | Rejected |
| Wrong Razorpay Order ID | Rejected |
| Wrong amount | Rejected |
| Wrong currency | Rejected |
| Duplicate callback | No duplicate |
| Duplicate webhook | No duplicate |
| Webhook after callback | Safe reconciliation/no-op |
| Callback after webhook | Safe reconciliation/no-op |
| Network failure after payment | Webhook/reconciliation can resolve state |
| Client manipulates total | Server uses authoritative total |
| Product price changes | Server revalidates |
| Shipping changes | Server revalidates |
| Product unavailable | Payment not initiated |
| Test environment | Sandbox works |
| Production | Sandbox impossible |

---

## 28. CURRENT IMPLEMENTATION AUDIT

Inspect the actual implementation before changing it, including where applicable:

```text
src/lib/razorpay.ts
src/lib/loadRazorpayScript.ts
CheckoutView.tsx
CheckoutView.module.css
src/types/index.ts
src/lib/orders.ts
OrderConfirmationView.tsx
app/api/razorpay/create-order
app/api/razorpay/verify
```

Also inspect:
- Cart calculation
- Shipping calculation
- Product price source
- Order persistence
- Environment files
- Authentication
- Existing tests
- Webhook support if already present

Do not assume the implementation is correct just because TypeScript compiles and endpoints return HTTP 200.

---

## 29. DO NOT UNNECESSARILY REDESIGN THE CHECKOUT

The purpose of this task is to harden and correct the current Razorpay implementation.

Preserve:
- Good Fills brand styling
- Premium Atelier presentation
- Customer prefill
- Existing working checkout structure

Only make UI changes that improve correctness, clarity, or UPI-only behavior.

---

## 30. PRODUCTION READINESS CHECKLIST

Before reporting completion, verify:

- [ ] Razorpay Checkout exposes UPI only
- [ ] Cards disabled
- [ ] Netbanking disabled
- [ ] Wallets disabled
- [ ] Other methods disabled
- [ ] Direct VPA fallback removed from normal checkout
- [ ] Server creates Razorpay Orders
- [ ] Amount is server-authoritative
- [ ] Shipping is server-authoritative
- [ ] Currency is server-authoritative
- [ ] Internal ↔ Razorpay Order mapping is trusted
- [ ] Signature verification works
- [ ] Payment status/capture state is checked
- [ ] Webhook endpoint exists
- [ ] Webhook signature is verified
- [ ] Webhook handling is idempotent
- [ ] Browser callback handling is idempotent
- [ ] Duplicate payment protection exists
- [ ] Test/live environments are separated
- [ ] Sandbox is blocked in production
- [ ] Secrets remain server-side
- [ ] Sensitive data is not logged
- [ ] Payment failure works
- [ ] Payment abandonment works
- [ ] Retry works
- [ ] Order is only confirmed after verified payment
- [ ] Order/payment/shipment states remain separate
- [ ] UPI-only behavior was tested in the real Razorpay Checkout
- [ ] TypeScript passes
- [ ] Lint/build passes
- [ ] Relevant integration/security tests pass

---

## 31. REPORT FORMAT

After the audit, report exactly:

### AUDIT RESULT
What was already correct.

### CHANGES MADE
Exact security, payment, UX, and architecture changes.

### FINAL PAYMENT FLOW
Show the final flow.

### TEST RESULTS
For every test:
- Name
- Method
- Result
- Limitation, if any

### MERCHANT CONFIGURATION STILL REQUIRED
List only things that require the Razorpay Dashboard/merchant setup, such as:
- Live keys
- UPI-only payment configuration
- Webhook URL
- Webhook secret
- Applicable live-account activation/configuration

Do not claim production readiness if required merchant-side configuration has not actually been completed.

---

# FINAL STANDARD

The Razorpay integration is not considered complete merely because:

- The modal opens
- TypeScript compiles
- The API returns HTTP 200
- A mock payment works
- An HMAC test works

It is complete when it is:

**Correct → Server-validated → UPI-only → Idempotent → Webhook-aware → Environment-safe → User-friendly → Production-ready**

Keep the Good Fills payment experience simple.

**One payment method. One authoritative payment flow. One trusted payment state.**
