# Razorpay activation

The user selected Razorpay but does not yet have an account. The application intentionally does not accept live payments now.

## Configure course offers

In `data/offerings.json`, add an entry under `courses` using an existing ID from `data/catalog.json`:

```json
{
  "currency": "SGD",
  "timezone": "Asia/Singapore",
  "paymentsEnabled": false,
  "courses": {
    "COURSE_ID_FROM_CATALOG": {
      "priceMinor": 25000,
      "sessions": [{ "id": "YOUR_SESSION_ID", "start": "2027-01-20T01:00:00Z", "mode": "Online" }]
    }
  }
}
```

The amount and date above are examples, not APJ prices or schedules. Confirm actual fees, taxes, currency support, dates, syllabus and accreditation/awarding-body arrangements before enabling an offer. Amounts are integer currency subunits; server-side course data determines the charge. Do not use third-party prices as APJ prices.

## Merchant configuration

Create and activate an eligible Razorpay merchant account. In the hosting environment, configure secrets (never in source or chat):

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Use test credentials first. Set `paymentsEnabled` to true only when configured offers and the appropriate merchant environment are ready. Configure auto-capture in the Razorpay dashboard as appropriate to your account. Verify supported transaction currency for that merchant account.

Webhook endpoint: `/api/training/webhook`. Subscribe to payment captured, authorized and failed notifications. The endpoint verifies the raw request HMAC and re-fetches payment details before updating registration state. The current Site is private; an external webhook must be able to reach the deployed endpoint without an interactive login. Do not make the entire site public just to bypass this requirement without the owner's explicit instruction.

## Before live launch

For a new local checkout, build once and apply the local database migration once:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_big_black_knight.sql
```

The current development database has already had this migration applied. Do not replay it. Hosted migrations are applied by the Sites deployment workflow.

Run an actual Razorpay test checkout and test cancellation, failure, authorization pending, capture, duplicate callbacks, signature rejection, timeout/recovery and webhook delivery. Confirm the recorded amount/currency and registration reference. Verify the merchant’s refund process and any required tax invoice separately. A downloaded registration confirmation is not a tax invoice.

Only switch to live keys after successful merchant testing. Never set payment success based solely on a URL, checkout modal or browser payload. This application checks the signature and fetches the payment from Razorpay; only `captured` is paid.

If an Order creation request times out, the registration is marked `payment_review` to avoid creating duplicate orders blindly. An operator must reconcile the existing receipt in the Razorpay dashboard before updating the stored order/state. Registration records are in the D1 `registrations` table; protect database/hosting administrative access.

References: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/ and https://razorpay.com/docs/webhooks/validate-test/
