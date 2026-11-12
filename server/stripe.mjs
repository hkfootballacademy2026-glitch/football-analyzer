// Small REST client: secrets and Stripe identifiers never come from browser input.
export class StripeClient {
  constructor(key, transport = fetch) { this.key = key; this.transport = transport; }
  async request(path, params = null, idempotencyKey) {
    const headers = { Authorization: 'Bearer ' + this.key, 'Stripe-Version': '2026-09-30.endive' };
    let body;
    if (params) {
      body = new URLSearchParams();
      const append = (key, value) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) value.forEach((v, i) => append(key + '[' + i + ']', v));
        else if (typeof value === 'object') Object.entries(value).forEach(([k, v]) => append(key ? key + '[' + k + ']' : k, v));
        else body.append(key, String(value));
      };
      Object.entries(params).forEach(([k, v]) => append(k, v));
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const res = await this.transport('https://api.stripe.com/v1/' + path, {
      method: params ? 'POST' : 'GET', headers, body, signal: AbortSignal.timeout(15000), redirect: 'error'
    });
    if (!res.ok) throw Error('stripe_unavailable');
    const data = await res.json();
    if (data.livemode === true) throw Error('wrong_stripe_environment');
    return data;
  }
}
export function validPrice(price, id) {
  return price?.id === id && price.active === true && price.livemode === false &&
    price.currency === 'jpy' && price.unit_amount === 500 && price.type === 'recurring' &&
    price.recurring?.interval === 'month' && price.recurring?.interval_count === 1 &&
    price.tax_behavior === 'inclusive';
}
export function subscriptionState(list, customer, price, now, held = false) {
  if (list.has_more) throw Error('subscription_review_required');
  const relevant = (list.data || []).filter(s => s.customer === customer && s.livemode === false &&
    s.items?.data?.some(i => i.price?.id === price));
  const outstanding = relevant.some(s => !['canceled', 'incomplete_expired'].includes(s.status));
  let paidThrough = 0, cancelAtPeriodEnd = false;
  for (const s of relevant) {
    if (s.status !== 'active' || s.items.data.length !== 1 || s.items.data[0].quantity !== 1) continue;
    const item = s.items.data[0], invoice = s.latest_invoice;
    if (!validPrice(item.price, price) || !invoice || typeof invoice === 'string' ||
        invoice.customer !== customer || invoice.status !== 'paid' || invoice.currency !== 'jpy' ||
        invoice.total !== 500 || invoice.amount_paid < 500 || invoice.amount_remaining !== 0 ||
        !Number.isFinite(item.current_period_start) || item.current_period_start > now ||
        !Number.isFinite(item.current_period_end) || item.current_period_end <= now) continue;
    if (item.current_period_end > paidThrough) {
      paidThrough = item.current_period_end;
      cancelAtPeriodEnd = s.cancel_at_period_end === true;
    }
  }
  return { pro: !held && paidThrough > now, paidThrough, cancelAtPeriodEnd, outstanding, held };
}
export const BILLING_EVENTS = new Set([
  'checkout.session.completed', 'checkout.session.async_payment_succeeded',
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
  'invoice.paid', 'invoice.payment_failed',
  'charge.dispute.created', 'charge.refunded', 'radar.early_fraud_warning.created'
]);
