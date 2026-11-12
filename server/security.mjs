const encoder = new TextEncoder();
export const seconds = () => Math.floor(Date.now() / 1000);
export function bytes64(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]+$/.test(s)) throw Error('invalid_encoding');
  return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}
export function base64(b) {
  return btoa(String.fromCharCode(...new Uint8Array(b))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export function random() { return base64(crypto.getRandomValues(new Uint8Array(32))); }
export async function digest(s) { return base64(await crypto.subtle.digest('SHA-256', encoder.encode(s))); }
export function cookie(req, name) {
  return (req.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1) || '';
}
export function sessionCookie(name, value, age) {
  return name + '=' + value + '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=' + age;
}
export function sameOrigin(req, env) {
  return req.headers.get('origin') === env.APP_ORIGIN && new URL(req.url).origin === env.APP_ORIGIN;
}
export async function limitedBody(req, max = 262144) {
  const reader = req.body?.getReader();
  if (!reader) return '';
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) throw Error('body_too_large');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(all);
}
export async function verifyStripe(raw, header, secret, now = seconds()) {
  if (!secret || !header || header.length > 4096) return false;
  const parts = header.split(',').map(v => v.split('='));
  const times = parts.filter(v => v[0] === 't');
  if (times.length !== 1 || !/^\d+$/.test(times[0][1])) return false;
  const t = Number(times[0][1]);
  if (!Number.isSafeInteger(t) || Math.abs(now - t) > 300) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  for (const [kind, value] of parts) {
    if (kind !== 'v1' || !/^[a-f0-9]{64}$/i.test(value || '')) continue;
    const signature = Uint8Array.from(value.match(/../g), x => parseInt(x, 16));
    if (await crypto.subtle.verify('HMAC', key, signature, encoder.encode(t + '.' + raw))) return true;
  }
  return false;
}
export async function verifyIdToken(token, jwks, { issuer, audience, nonce, now = seconds() }) {
  if (typeof token !== 'string' || token.length > 32768) throw Error('bad_token');
  const parts = token.split('.');
  if (parts.length !== 3) throw Error('bad_token');
  const parse = s => JSON.parse(new TextDecoder().decode(bytes64(s)));
  const header = parse(parts[0]), claims = parse(parts[1]);
  if (!['RS256', 'ES256'].includes(header.alg) || header.crit) throw Error('bad_algorithm');
  const candidates = (jwks.keys || []).filter(k => k.kid === header.kid && (!k.use || k.use === 'sig') && (!k.alg || k.alg === header.alg));
  if (candidates.length !== 1) throw Error('bad_key');
  const jwk = candidates[0];
  if (header.alg === 'RS256' && jwk.kty !== 'RSA' || header.alg === 'ES256' && (jwk.kty !== 'EC' || jwk.crv !== 'P-256')) throw Error('bad_key');
  const algorithm = header.alg === 'RS256'
    ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
    : { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' };
  const key = await crypto.subtle.importKey('jwk', jwk, algorithm, false, ['verify']);
  if (!await crypto.subtle.verify(algorithm, key, bytes64(parts[2]), encoder.encode(parts[0] + '.' + parts[1]))) throw Error('bad_signature');
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== issuer || !aud.includes(audience) || (aud.length > 1 && claims.azp !== audience) ||
      (claims.azp && claims.azp !== audience) || claims.nonce !== nonce ||
      typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 255 ||
      !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) ||
      claims.iat > now + 60 || (claims.nbf !== undefined && claims.nbf > now + 60)) throw Error('bad_claims');
  return claims;
}
