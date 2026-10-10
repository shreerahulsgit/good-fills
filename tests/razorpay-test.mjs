import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('   GOOD FILLS — RAZORPAY HARDENING TEST SUITE       ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, isPass, detail = '') {
    if (isPass) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} — ${detail}`);
      failed++;
    }
  }

  // TEST 1: Server-authoritative total (ignores client manipulation)
  try {
    const res = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'prod-01', quantity: 1 }], // Baby Cereal Mix: ₹225, 250g
        customer: {
          fullName: 'Security Auditor',
          phone: '9999999999',
          email: 'audit@example.com',
        },
        shippingAddress: {
          addressLine1: 'Test Lab, 1st Cross',
          city: 'Bengaluru',
          pincode: '560001',
          state: 'Karnataka',
        },
        // Attacker attempts to forge clientTotal = ₹10
        clientTotal: 10,
        amount: 1000,
      }),
    });

    const data = await res.json();
    // Authoritative total must be: ₹225 (prod-01) + ₹100 (shipping under 500g) = ₹325 (32500 paise)
    const isAuthoritative = data.success && data.amount === 32500;
    report(
      'Server-authoritative cart calculation ignores client price/total manipulation',
      isAuthoritative,
      `Expected amount 32500 paise, got ${data.amount}`
    );
  } catch (err) {
    report('Server-authoritative cart calculation', false, err.message);
  }

  // TEST 2: Multi-item weight shipping calculation
  try {
    const res = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 3 items of prod-01 (250g * 3 = 750g -> 501g-1kg slab = ₹200 shipping)
        // Subtotal = 225 * 3 = ₹675. Shipping = ₹200. Total = ₹875 (87500 paise)
        items: [{ productId: 'prod-01', quantity: 3 }],
        customer: {
          fullName: 'Weight Test Patron',
          phone: '9888888888',
          email: 'weight@example.com',
        },
        shippingAddress: {
          addressLine1: 'Atelier Cross',
          city: 'Bengaluru',
          pincode: '560038',
          state: 'Karnataka',
        },
      }),
    });

    const data = await res.json();
    const isWeightCorrect = data.success && data.amount === 87500;
    report(
      'Server calculates shipping strictly by DTDC net product weight (750g = ₹200 slab)',
      isWeightCorrect,
      `Expected 87500 paise, got ${data.amount}`
    );
  } catch (err) {
    report('Weight-based shipping test', false, err.message);
  }

  // TEST 3: Invalid signature rejection
  try {
    const res = await fetch(`${BASE_URL}/api/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_fake_123',
        razorpay_payment_id: 'pay_fake_456',
        razorpay_signature: 'invalid_forged_signature_hash',
      }),
    });

    const isRejected = res.status === 400;
    report(
      'Invalid Razorpay order mapping or forged signature is rejected with 400',
      isRejected,
      `Got status ${res.status}`
    );
  } catch (err) {
    report('Invalid signature rejection test', false, err.message);
  }

  // TEST 4: Create order and verify development sandbox flow
  let sandboxOrderId = '';
  let internalOrderId = '';
  try {
    const createRes = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'prod-01', quantity: 1 }],
        customer: {
          fullName: 'Sandbox Patron',
          phone: '9777777777',
          email: 'sandbox@example.com',
        },
        shippingAddress: {
          addressLine1: 'Test Sanctuary',
          city: 'Bengaluru',
          pincode: '560001',
          state: 'Karnataka',
        },
      }),
    });

    const createData = await createRes.json();
    sandboxOrderId = createData.razorpayOrderId;
    internalOrderId = createData.internalOrderId;

    const verifyRes = await fetch(`${BASE_URL}/api/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: sandboxOrderId,
        razorpay_payment_id: 'pay_sandbox_test_001',
        isMock: true,
      }),
    });

    const verifyData = await verifyRes.json();
    const isVerified = verifyRes.ok && verifyData.verified && verifyData.order?.paymentStatus === 'Paid';
    report(
      'Atelier Sandbox authorizes order and updates paymentStatus to Paid in dev',
      isVerified,
      JSON.stringify(verifyData)
    );
  } catch (err) {
    report('Sandbox verification test', false, err.message);
  }

  // TEST 5: Idempotent callback (reused payment confirmation)
  try {
    const duplicateRes = await fetch(`${BASE_URL}/api/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: sandboxOrderId,
        razorpay_payment_id: 'pay_sandbox_test_001',
        isMock: true,
      }),
    });

    const duplicateData = await duplicateRes.json();
    const isIdempotent = duplicateRes.ok && duplicateData.alreadyPaid === true;
    report(
      'Duplicate verification callback is safe idempotent no-op (alreadyPaid: true)',
      isIdempotent,
      JSON.stringify(duplicateData)
    );
  } catch (err) {
    report('Duplicate callback test', false, err.message);
  }

  // TEST 6: Webhook with invalid signature rejected
  try {
    const res = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'tampered_signature',
      },
      body: JSON.stringify({
        event: 'payment.captured',
        id: 'evt_test_fake',
      }),
    });

    const isRejected = res.status === 400;
    report(
      'Webhook with invalid cryptographic signature is rejected with 400',
      isRejected,
      `Got status ${res.status}`
    );
  } catch (err) {
    report('Webhook invalid signature test', false, err.message);
  }

  // TEST 7: Webhook with missing signature rejected
  try {
    const res = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'payment.captured',
        id: 'evt_test_no_sig',
      }),
    });

    const isRejected = res.status === 400;
    report(
      'Webhook without x-razorpay-signature header is rejected with 400',
      isRejected,
      `Got status ${res.status}`
    );
  } catch (err) {
    report('Webhook missing signature test', false, err.message);
  }

  // TEST 8: Webhook valid HMAC signature processing
  const testWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'GoodFills_Webhook_2026_Secure';
  const webhookEventId = `evt_${Date.now()}`;
  const webhookPayload = JSON.stringify({
    entity: 'event',
    account_id: 'acc_test',
    event: 'payment.captured',
    id: webhookEventId,
    payload: {
      payment: {
        entity: {
          id: 'pay_webhook_test_999',
          order_id: sandboxOrderId,
          amount: 32500,
          currency: 'INR',
          status: 'captured',
          method: 'upi',
        },
      },
    },
  });

  const validWebhookSig = crypto
    .createHmac('sha256', testWebhookSecret)
    .update(webhookPayload)
    .digest('hex');

  try {
    const res = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validWebhookSig,
      },
      body: webhookPayload,
    });

    const data = await res.json();
    const isWebhookSuccess = res.ok && data.received === true;
    report(
      'Webhook with valid HMAC-SHA256 signature is processed successfully (HTTP 200)',
      isWebhookSuccess,
      JSON.stringify(data)
    );
  } catch (err) {
    report('Webhook valid processing test', false, err.message);
  }

  // TEST 9: Webhook idempotency (duplicate delivery)
  try {
    const res = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validWebhookSig,
      },
      body: webhookPayload,
    });

    const data = await res.json();
    const isDuplicateIgnored = res.ok && data.status === 'already_processed';
    report(
      'Duplicate webhook event delivery is recognized and ignored (status: already_processed)',
      isDuplicateIgnored,
      JSON.stringify(data)
    );
  } catch (err) {
    report('Webhook idempotency test', false, err.message);
  }

  // TEST 10: Empty cart rejection
  try {
    const res = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [],
        customer: { fullName: 'Test', phone: '9999999999', email: 'test@test.com' },
        shippingAddress: { addressLine1: 'Test', city: 'Bengaluru', pincode: '560001' },
      }),
    });
    report(
      'Empty cart order creation is rejected with 400',
      res.status === 400,
      `Got status ${res.status}`
    );
  } catch (err) {
    report('Empty cart test', false, err.message);
  }

  // TEST 11: Missing customer contact details rejection
  try {
    const res = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'prod-01', quantity: 1 }],
        customer: { fullName: '', phone: '', email: '' },
        shippingAddress: { addressLine1: 'Test', city: 'Bengaluru', pincode: '560001' },
      }),
    });
    report(
      'Missing customer details order creation is rejected with 400',
      res.status === 400,
      `Got status ${res.status}`
    );
  } catch (err) {
    report('Missing customer details test', false, err.message);
  }

  // TEST 12: Production Sandbox Guard in /api/razorpay/verify
  // When NODE_ENV=production or isMock in invalid environment
  try {
    const res = await fetch(`${BASE_URL}/api/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'non_existent_order_id_9999',
        razorpay_payment_id: 'pay_9999',
        isMock: false,
      }),
    });
    report(
      'Unrecognized Razorpay order ID mapping is rejected with 400',
      res.status === 400,
      `Got status ${res.status}`
    );
  } catch (err) {
    report('Order mapping rejection test', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
