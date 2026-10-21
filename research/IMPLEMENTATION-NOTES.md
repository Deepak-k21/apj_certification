# APJ training and enrolment

## Reference analysis — 19 October 2026

TVE: https://www.tvecert.org/#/training

- Large training hero, primary navigation, pathway cards, ISO selection controls, course-detail dialogs, provider brochures and application links.
- 17 CQI & IRCA entries and 17 Exemplar Global entries across quality, environmental, occupational health and safety, information security, food safety, FSSC, energy and greenhouse gas verification.
- 56 EOSH entries across health/safety (9), fire (8), environment (7), sustainability (8), lifting/rigging (10), scaffolding (9) and first aid (5). Source durations are days.
- TVE's source has inconsistent editions between some titles and descriptions. Catalogue labels are preserved as reference information, not represented as APJ's approved offer or a verified statement of current ISO editions. Course-specific approvals and brochures must be confirmed before enrolment.
- Its accreditation logos, claims of approved-provider status, student counts and third-party certificates are not APJ facts and are not reused as APJ claims.

Star Academy: https://staracademy.com.sg/ and https://register.staracademy.com.sg/

- Public course outlines and audience sections link to a separate schedule/registration portal.
- Registration starts with course selection, dated runs, fees, self/company sponsorship and participant counts.
- Cart supports multiple courses, participant counts, totals and removing selections.
- Participant form includes name, email, mobile, company, address, course assignment, professional information, national identity number and marketing subscription.
- Inspected an ephemeral course cart and the participant form without submitting participant information or booking. Payment provider cannot be conclusively identified from the public pages inspected; payment is behind participant submission. No claims are made about Star Academy's gateway. User explicitly chose Razorpay for APJ.
- APJ implements the useful selection → participants → review → confirmation/payment sequence. No unnecessary national identity number is collected. No default marketing subscription is added.

## Adaptation

APJ uses its navy, teal, gold and violet branding across the original and training pages. Its Training navigation now opens /training/. The hub provides search, level/pathway filters, detail dialogs, provider brochure links, comparison of learning levels and FAQs. Twelve APJ enquiry entries populate Foundation and Lead Implementer pathways. Eleven proposed RE/RTO renewal topics have a dedicated /re-rto-renewal-courses/ page, individual descriptions, learning outcomes and audience guidance. Their final syllabi, STU approval, certificates, dates, fees and delivery remain to be confirmed by APJ.

RE/RTO terminology and safety context were checked against the [IES/ACES C&S RE/RTO Registry](https://www.ies.org.sg/registries/ies-aces-c-s-re-rto-registry/), the [IES continuing education guidelines](https://www.ies.org.sg/wp-content/uploads/Continuing-Education-System.pdf), [BCA site supervisor guidance](https://www1.bca.gov.sg/safety-and-standards/applications-and-licenses/permit-for-structural-works/requirements-on-site-supervisor-and-framework-for-risk-based-inspection/), and [MOM workplace safety legislation](https://www.mom.gov.sg/legislation/workplace-safety-and-health). These sources support the topic framing; they do not establish approval for any APJ course.

Registration uses durable D1 records, HttpOnly session ownership, server validation and idempotent retries. Unknown fees/dates produce a request awaiting a quote, not a zero-cost booking. Participant data is not stored in browser local storage. The course cart only stores course IDs, session selections and counts in session storage.

Razorpay uses server-created Orders, the server's stored order ID for HMAC verification, provider-side payment retrieval, amount/currency checks, capture-state confirmation and signed webhooks. No private key reaches the client. Checkout cancellation is not success. Webhooks are replay-safe at the state-transition level; late failed/authorized notifications cannot undo captured payment.

## Launch dependencies

1. User has not created a Razorpay account yet. No merchant keys are available; online payment is disabled.
2. APJ dates, prices, currency/tax treatment and confirmed course provider/accreditation details are not supplied. Do not invent these. SGD is the provisional display currency for the Singapore business, with no payable prices.
3. Configure offerings in data/offerings.json and secrets through hosting environment settings; see PAYMENT-SETUP.md.
4. A private Site can prevent unauthenticated provider webhooks. Before live payment, use an approved public payment endpoint/domain or change site access only with the user's explicit instruction. Client callback plus authenticated payment-status refresh are implemented but do not replace live end-to-end testing.
5. External Razorpay test checkout, webhook delivery, refund reconciliation and live capture remain unverified until merchant setup. Local provider fixtures test application logic only.
