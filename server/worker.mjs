import { seconds, random, digest, cookie, sessionCookie, sameOrigin, limitedBody, verifyStripe, verifyIdToken } from './security.mjs';
import { StripeClient, validPrice, subscriptionState, BILLING_EVENTS } from './stripe.mjs';

const SESSION = '__Host-fa_session', LOGIN = '__Host-fa_login', TERMS = '2026-11-08';
const idOf = obj => typeof obj === 'string' ? obj : obj?.id;
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', ...extra }
});
const redirect = (url, cookies = []) => {
  const headers = new Headers({ Location: url, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  cookies.forEach(c => headers.append('Set-Cookie', c));
  return new Response(null, { status: 303, headers });
};
const q = (env, sql, ...args) => env.BILLING_DB.prepare(sql).bind(...args);
async function secret(value) { return typeof value?.get === 'function' ? value.get() : value; }
function configured(env) {
  // Sandbox only until hosted-provider and end-to-end tests approve a separate live rollout.
  return env.BILLING_ENABLED === 'true' && env.BILLING_ENV === 'test' && !!env.BILLING_DB &&
    !!env.APP_ORIGIN?.startsWith('https://') && !!env.OIDC_ISSUER?.startsWith('https://') &&
    !!env.OIDC_CLIENT_ID && !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET &&
    !!env.STRIPE_PRICE_ID && !!env.STRIPE_PORTAL_CONFIGURATION_ID;
}
async function stripe(env) {
  const key = await secret(env.STRIPE_SECRET_KEY);
  if (!/^(rk|sk)_test_/.test(key || '')) throw Error('wrong_stripe_environment');
  return new StripeClient(key, env.FETCH || fetch);
}
async function session(req, env) {
  const token = cookie(req, SESSION);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return q(env, 'SELECT s.*, u.customer_id FROM billing_sessions s JOIN billing_users u ON u.id=s.user_id WHERE token_hash=? AND expires>?', await digest(token), seconds()).first();
}
async function limit(env, key, max, window = 60) {
  const now = seconds(), bucket = key + ':' + Math.floor(now / window);
  const row = await q(env, 'INSERT INTO billing_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count', bucket, now + window * 2).first();
  return row.count <= max;
}
async function discovery(env) {
  const issuer = env.OIDC_ISSUER.replace(/\/$/, '');
  const res = await (env.FETCH || fetch)(issuer + '/.well-known/openid-configuration', { signal: AbortSignal.timeout(10000), redirect: 'error' });
  if (!res.ok) throw Error('identity_unavailable');
  const doc = await res.json();
  if (doc.issuer !== env.OIDC_ISSUER || !['authorization_endpoint','token_endpoint','jwks_uri'].every(k => {
    try { const u = new URL(doc[k]); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
  })) throw Error('identity_configuration');
  return doc;
}
async function status(env, client, customer) {
  if (!customer) return { pro: false, outstanding: false, paidThrough: 0, held: false, cancelAtPeriodEnd: false };
  const hold = await q(env, 'SELECT reason FROM billing_holds WHERE customer_id=?', customer).first();
  const list = await client.request('subscriptions?customer=' + encodeURIComponent(customer) + '&status=all&limit=100&expand[]=data.latest_invoice');
  return subscriptionState(list, customer, env.STRIPE_PRICE_ID, seconds(), !!hold);
}
async function webhook(req, env) {
  let raw, event;
  try {
    raw = await limitedBody(req);
    if (!await verifyStripe(raw, req.headers.get('stripe-signature'), await secret(env.STRIPE_WEBHOOK_SECRET))) return json({ error: 'invalid_signature' }, 400);
    event = JSON.parse(raw);
  } catch { return json({ error: 'invalid_webhook' }, 400); }
  if (event.livemode !== false || typeof event.id !== 'string' || !event.id.startsWith('evt_')) return json({ error: 'invalid_environment' }, 400);
  if (!BILLING_EVENTS.has(event.type)) return json({ received: true, ignored: true });
  if (await q(env, 'SELECT id FROM billing_events WHERE id=?', event.id).first()) return json({ received: true });
  const obj = event.data?.object;
  if (!obj || !Number.isFinite(event.created)) return json({ error: 'invalid_event' }, 400);
  let customer = idOf(obj.customer), risk = false;
  if (['charge.dispute.created','charge.refunded','radar.early_fraud_warning.created'].includes(event.type)) {
    const chargeId = event.type === 'charge.refunded' ? obj.id : idOf(obj.charge);
    if (!chargeId?.startsWith('ch_')) throw Error('risk_charge_missing');
    const charge = await (await stripe(env)).request('charges/' + encodeURIComponent(chargeId));
    customer = idOf(charge.customer);
    // Do not silently restore access on an unrelated later invoice event.
    risk = event.type !== 'charge.refunded' || charge.amount_refunded > 0;
  }
  if (!customer?.startsWith('cus_')) throw Error('customer_missing');
  const owner = await q(env, 'SELECT id FROM billing_users WHERE customer_id=?', customer).first();
  if (!owner) return json({ received: true, ignored: true });
  const statements = [];
  if (risk) statements.push(q(env, 'INSERT INTO billing_holds(customer_id,reason,event_id) VALUES(?,?,?) ON CONFLICT(customer_id) DO UPDATE SET reason=excluded.reason,event_id=excluded.event_id', customer, event.type, event.id));
  statements.push(q(env, 'INSERT OR IGNORE INTO billing_events(id,type,customer_id,created,received) VALUES(?,?,?,?,?)', event.id, event.type, customer, event.created, seconds()));
  await env.BILLING_DB.batch(statements);
  // Entitlements always read current Stripe state; stale/reordered lifecycle payloads never grant access.
  return json({ received: true });
}
async function api(req, env) {
  const url = new URL(req.url), path = url.pathname, ready = configured(env);
  if (path === '/api/billing/config' && req.method === 'GET') return json({ available: ready, environment: ready ? 'test' : 'disabled', monthlyTotal: 500, currency: 'JPY', termsVersion: TERMS });
  if (!ready) return json({ error: 'billing_not_configured' }, 503);
  if (url.origin !== env.APP_ORIGIN) return json({ error: 'invalid_origin' }, 403);
  if (path === '/api/stripe/webhook' && req.method === 'POST') return webhook(req, env);
  if (path === '/api/auth/start' && req.method === 'POST') {
    if (!sameOrigin(req, env)) return json({ error: 'invalid_origin' }, 403);
    if (!await limit(env, 'login:' + await digest(req.headers.get('cf-connecting-ip') || 'unknown'), 10, 600)) return json({ error: 'try_later' }, 429);
    const state = random(), binding = random(), verifier = random(), nonce = random(), doc = await discovery(env);
    await q(env, 'INSERT INTO billing_login(state_hash,browser_hash,verifier,nonce,expires) VALUES(?,?,?,?,?)', await digest(state), await digest(binding), verifier, nonce, seconds() + 600).run();
    const auth = new URL(doc.authorization_endpoint);
    Object.entries({ client_id: env.OIDC_CLIENT_ID, response_type: 'code', scope: 'openid',
      redirect_uri: env.APP_ORIGIN + '/api/auth/callback', state, nonce,
      code_challenge: await digest(verifier), code_challenge_method: 'S256' }).forEach(([k, v]) => auth.searchParams.set(k, v));
    return redirect(auth.href, [sessionCookie(LOGIN, binding, 600)]);
  }
  if (path === '/api/auth/callback' && req.method === 'GET') {
    try {
      const state = url.searchParams.get('state') || '', code = url.searchParams.get('code') || '', binding = cookie(req, LOGIN);
      if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !/^[A-Za-z0-9_-]{43}$/.test(binding) || !code || code.length > 4096) throw Error('invalid_callback');
      const attempt = await q(env, 'DELETE FROM billing_login WHERE state_hash=? AND browser_hash=? AND expires>? RETURNING *', await digest(state), await digest(binding), seconds()).first();
      if (!attempt) throw Error('invalid_callback');
      const doc = await discovery(env), body = new URLSearchParams({ grant_type: 'authorization_code', code,
        client_id: env.OIDC_CLIENT_ID, redirect_uri: env.APP_ORIGIN + '/api/auth/callback', code_verifier: attempt.verifier });
      const clientSecret = await secret(env.OIDC_CLIENT_SECRET);
      if (clientSecret) body.set('client_secret', clientSecret);
      const tokenRes = await (env.FETCH || fetch)(doc.token_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(10000), redirect: 'error' });
      if (!tokenRes.ok) throw Error('token_exchange_failed');
      const tokens = await tokenRes.json();
      const keysRes = await (env.FETCH || fetch)(doc.jwks_uri, { signal: AbortSignal.timeout(10000), redirect: 'error' });
      if (!keysRes.ok) throw Error('identity_unavailable');
      const claims = await verifyIdToken(tokens.id_token, await keysRes.json(), { issuer: env.OIDC_ISSUER, audience: env.OIDC_CLIENT_ID, nonce: attempt.nonce });
      const user = await digest(env.OIDC_ISSUER + '\n' + claims.sub), token = random(), csrf = random();
      const age = Math.min(3600, claims.exp - seconds());
      if (age <= 0) throw Error('expired_token');
      await env.BILLING_DB.batch([
        q(env, 'INSERT OR IGNORE INTO billing_users(id) VALUES(?)', user),
        q(env, 'INSERT INTO billing_sessions(token_hash,user_id,csrf,expires) VALUES(?,?,?,?)', await digest(token), user, csrf, seconds() + age)
      ]);
      return redirect(env.APP_ORIGIN + '/settings', [sessionCookie(SESSION, token, age), sessionCookie(LOGIN, '', 0)]);
    } catch {
      return redirect(env.APP_ORIGIN + '/settings?login=failed', [sessionCookie(LOGIN, '', 0)]);
    }
  }
  const user = await session(req, env);
  if (!user) return json({ error: 'login_required' }, 401);
  if (!await limit(env, 'user:' + user.user_id, 30)) return json({ error: 'try_later' }, 429);
  if (req.method === 'POST' && (!sameOrigin(req, env) || req.headers.get('x-csrf-token') !== user.csrf)) return json({ error: 'invalid_origin_or_csrf' }, 403);
  if (path === '/api/auth/logout' && req.method === 'POST') {
    await q(env, 'DELETE FROM billing_sessions WHERE token_hash=?', user.token_hash).run();
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(SESSION, '', 0) });
  }
  const client = await stripe(env);
  if (path === '/api/billing/status' && req.method === 'GET') return json({ authenticated: true, csrf: user.csrf, environment: 'test', ...await status(env, client, user.customer_id) });
  if (path === '/api/billing/portal' && req.method === 'POST') {
    if (!user.customer_id) return json({ error: 'no_contract' }, 409);
    const portal = await client.request('billing_portal/sessions', { customer: user.customer_id, configuration: env.STRIPE_PORTAL_CONFIGURATION_ID, return_url: env.APP_ORIGIN + '/settings' });
    if (new URL(portal.url).origin !== 'https://billing.stripe.com') throw Error('invalid_portal_url');
    return json({ url: portal.url });
  }
  if (path === '/api/billing/checkout' && req.method === 'POST') {
    let input;
    try { input = JSON.parse(await limitedBody(req, 4096)); } catch { return json({ error: 'invalid_request' }, 400); }
    if (input.termsVersion !== TERMS || input.accepted !== true) return json({ error: 'terms_required' }, 400);
    if (Object.keys(input).some(k => !['termsVersion','accepted'].includes(k))) return json({ error: 'invalid_request' }, 400);
    const price = await client.request('prices/' + encodeURIComponent(env.STRIPE_PRICE_ID));
    if (!validPrice(price, env.STRIPE_PRICE_ID)) throw Error('invalid_price');
    if (!user.customer_id) {
      const customer = await client.request('customers', { metadata: { app_user: user.user_id, application: 'football_analyzer' } }, 'fa-customer-' + user.user_id);
      await q(env, 'UPDATE billing_users SET customer_id=? WHERE id=? AND customer_id IS NULL', customer.id, user.user_id).run();
      user.customer_id = (await q(env, 'SELECT customer_id FROM billing_users WHERE id=?', user.user_id).first()).customer_id;
    }
    const existing = await status(env, client, user.customer_id);
    if (existing.held) return json({ error: 'contract_review_required' }, 409);
    if (existing.outstanding) return json({ error: 'existing_contract_use_portal' }, 409);
    const now = seconds();
    await q(env, 'DELETE FROM billing_checkouts WHERE user_id=? AND expires<=?', user.user_id, now).run();
    await q(env, 'INSERT OR IGNORE INTO billing_checkouts(user_id,request_id,expires) VALUES(?,?,?)', user.user_id, random(), now + 3600).run();
    const attempt = await q(env, 'SELECT * FROM billing_checkouts WHERE user_id=?', user.user_id).first();
    const checkout = attempt.session_id
      ? await client.request('checkout/sessions/' + encodeURIComponent(attempt.session_id))
      : await client.request('checkout/sessions', {
        mode: 'subscription', customer: user.customer_id, line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
        client_reference_id: user.user_id, expires_at: attempt.expires,
        automatic_tax: { enabled: false }, subscription_data: { billing_mode: { type: 'flexible' }, metadata: { app_user: user.user_id } },
        metadata: { app_user: user.user_id, terms_version: TERMS },
        integration_identifier: 'football_analyzer_' + attempt.request_id.slice(0, 8).toLowerCase().replace(/[^a-z]/g, 'x'),
        success_url: env.APP_ORIGIN + '/settings?checkout=returned', cancel_url: env.APP_ORIGIN + '/settings?checkout=cancelled'
      }, 'fa-checkout-' + attempt.request_id);
    if (checkout.status !== 'open' || !checkout.url) return json({ error: 'checkout_pending_or_complete' }, 409);
    if (checkout.amount_total !== 500 || checkout.total_details?.amount_tax !== 0 || checkout.currency !== 'jpy' || checkout.customer !== user.customer_id || new URL(checkout.url).origin !== 'https://checkout.stripe.com') throw Error('invalid_checkout');
    await q(env, 'UPDATE billing_checkouts SET session_id=? WHERE user_id=? AND request_id=?', checkout.id, user.user_id, attempt.request_id).run();
    return json({ url: checkout.url });
  }
  return json({ error: 'not_found' }, 404);
}
export default {
  async fetch(req, env) {
    if (!new URL(req.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try { return await api(req, env); } catch {
      // Do not reflect Stripe/OIDC errors, keys, cookies, raw events, or tokens to clients/logs.
      return json({ error: 'service_unavailable' }, 503);
    }
  },
  async scheduled(_controller, env) {
    if (!env.BILLING_DB) return;
    const now = seconds();
    await env.BILLING_DB.batch([
      q(env, 'DELETE FROM billing_login WHERE expires<=?', now),
      q(env, 'DELETE FROM billing_sessions WHERE expires<=?', now),
      q(env, 'DELETE FROM billing_limits WHERE expires<=?', now),
      q(env, 'DELETE FROM billing_checkouts WHERE expires<=?', now),
      q(env, 'DELETE FROM billing_events WHERE received<?', now - 90 * 86400)
    ]);
  }
};
