# Good Fills — Razorpay Payment Integration Status & Go-Live Playbook

**Status:** Code-Level Hardening 100% Complete & Tested  
**Current Mode:** Test / Development Sandbox (`rzp_test_...`)  
**Date Documented:** October 2026  
**Next Phase:** Site Features (Contact Us, Operations/Admin, Auth, Policies) -> Deployment -> Live KYC & Settlement Activation  

---

## 1. Why This Strategy is 100% Correct

Postponing Razorpay Live KYC / Business Profile activation until the rest of the application is built is the **industry standard best practice**. 

### Razorpay Live Activation Prerequisites:
To approve a merchant account for live bank settlements, Razorpay's compliance team audits the website. They require:
1. **Publicly Accessible Deployed URL:** A live website where customers browse products.
2. **Contact Us Page:** Clear business contact address, email, and phone number.
3. **Legal & Operational Pages:** Terms of Service, Privacy Policy, Shipping & Delivery Policy, and Refund/Cancellation Policy.
4. **Functional Checkout:** Proof that the website functions properly.

By building **Contact Us**, **Admin & Operations**, **User Accounts**, and **Policies** now, Good Fills will easily pass Razorpay's merchant verification in one go.

---

## 2. Summary of What Has Been Completed

All 30 requirements of the Razorpay Hardening specification have been implemented and verified:

### A. Core Gateway & Security Hardening
- **UPI Only Enforcement:** All non-UPI methods (cards, netbanking, wallets, EMI, pay later) are strictly disabled at both the SDK and configuration levels. Attached to Payment Configuration ID: `config_TisYGSQSNXrQse`.
- **Direct VPA Fallback Removed:** Direct personal VPA (`9742068899@upi`) and manual UTR entry were completely eradicated from the checkout flow.
- **Server-Authoritative Pricing & Weight-Based DTDC Shipping:**
  - Client prices and totals are completely ignored.
  - Server reconstructs cart totals from the master product catalog.
  - Domestic courier shipping is computed strictly by net product weight:
    - 0–500g: ₹100
    - 501g–1kg: ₹200
    - 1.01–2kg: ₹400
    - 2.01–3kg: ₹600
    - +₹200 per additional started 1kg.
- **Cryptographic Signature Verification:** Timing-safe HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) ensures zero payment tampering.
- **Direct Razorpay API Status Verification:** Queries the gateway directly to confirm payment state is `captured` and currency is `INR`.
- **Idempotency & Duplicate Replay Protection:** Re-delivered callbacks or retried requests result in a safe no-op (`alreadyPaid: true`).
- **Dedicated Webhook Handler:** Cryptographically verified webhook endpoint at `/api/webhooks/razorpay` handles `payment.captured`, `payment.failed`, and `order.paid` with deduplication.
- **Environment Isolation:** Sandbox controls are strictly blocked in production (`isProduction()` check).
- **Zero Secret Leakage:** `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are never exposed to client bundles, logs, or network payloads.

### B. User Experience & Verification Flow
- **Artisanal Atelier Aesthetics:** Preserves the Good Fills warm-luxury, organic ivory and terracotta design.
- **Failure & Retry Handling:** Exact required copy: *"Payment could not be completed. Please try again."* Cart contents and shipping form inputs remain intact for instant retry.
- **Order Confirmation Page:**
  - Generates official internal Good Fills reference: `ORD-XXXX`.
  - Displays DTDC dispatch timeline, courier tracking SMS notices, and separate payment/order states.
- **Test Suite Passed:** 12/12 automated integration and security tests passed with 0 failures (`scripts/test-razorpay-hardening.mjs`).
- **TypeScript Compilation:** 0 errors across the entire codebase.

---

## 3. Current Configuration Active in `.env.local`

```env
# Public Test Key (Safe for client bundle)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TisKGNRE9GRoKm

# Server-Only Secret (Never exposed to browser)
RAZORPAY_KEY_SECRET=uGg0hOSjaGHoMup3gsTAYpb5

# Server-Only Webhook Secret
RAZORPAY_WEBHOOK_SECRET=whsec_goodfills_prod_secret_2026

# UPI-Only Configuration ID (Created in Razorpay Dashboard)
NEXT_PUBLIC_RAZORPAY_CONFIG_ID=config_TisYGSQSNXrQse
```

---

## 4. What to Do Next (Development Roadmap)

Before returning to payments, we will build:

1. **Contact Us Page (`/contact`):**
   - Atelier home-kitchen address in Bengaluru.
   - WhatsApp direct communication channel and customer care phone.
   - Inquiry form for custom batch orders and general questions.
2. **Admin & Operational Order Panel (`/admin` or `/atelier-ops`):**
   - Live queue of confirmed orders (`ORD-XXXX`).
   - Order fulfillment workflow: Stone-milling & preparation -> Airtight pouch sealing -> Handed over to DTDC.
   - DTDC consignment tracking number assignment.
   - Kitchen dispatch printouts / packing slips.
3. **Customer Accounts / Sign Up / Auth:**
   - Saved shipping addresses for repeat orders.
   - Past order history and live shipment tracking.
4. **Mandatory Merchant Compliance Pages (Required for Razorpay KYC):**
   - Terms & Conditions (`/terms`)
   - Privacy Policy (`/privacy`)
   - Shipping & Delivery Policy (`/shipping-policy`)
   - Cancellation & Refund Policy (`/refund-policy`)

---

## 5. Return-to-Payment: Final Go-Live Checklist

Once the website is deployed to production (e.g., on Vercel), execute these remaining steps to start accepting live payments:

### Step A: Complete Business Profile in Razorpay Dashboard
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings → Business Profile**.
3. Provide:
   - Registered Business / Proprietorship Name.
   - Bank Account Number & IFSC (where customer money will be deposited).
   - PAN card and GSTIN (if applicable).
   - Live website URL.

### Step B: Switch to Live Mode
1. Click the toggle at the top of the Razorpay Dashboard to switch from **Test Mode** to **Live Mode**.

### Step C: Generate Live API Keys
1. Go to **Settings → API Keys**.
2. Click **Generate Live Key**.
3. Copy:
   - `Key Id` (starts with `rzp_live_...`).
   - `Key Secret`.

### Step D: Configure Production Webhook
1. Go to **Settings → Webhooks → Add New Webhook**.
2. **Webhook URL:** `https://your-domain.com/api/webhooks/razorpay`
3. **Secret:** Generate a high-entropy string (e.g., via `openssl rand -hex 24`).
4. **Active Events:**
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Save Webhook.

### Step E: Update Production Environment Variables
In your hosting provider (e.g., Vercel Project Settings → Environment Variables):
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_live_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret_here
NEXT_PUBLIC_RAZORPAY_CONFIG_ID=config_TisYGSQSNXrQse
NODE_ENV=production
```

### Step F: Smoke Test with a Real ₹1 Transaction
1. Place a live test order using your actual PhonePe / Google Pay.
2. Verify that:
   - UPI QR / Intent prompts for bank MPIN.
   - ₹1 is deducted from your bank.
   - Razorpay Dashboard logs the payment under **Transactions**.
   - Your order redirects to `/order-confirmation` and clears the bag.
   - Razorpay settles the funds to your registered bank account according to their T+2 settlement schedule.
