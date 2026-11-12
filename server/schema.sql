CREATE TABLE IF NOT EXISTS billing_users (id TEXT PRIMARY KEY, customer_id TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS billing_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES billing_users(id), csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS billing_login (state_hash TEXT PRIMARY KEY, browser_hash TEXT NOT NULL, verifier TEXT NOT NULL, nonce TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS billing_checkouts (user_id TEXT PRIMARY KEY REFERENCES billing_users(id), request_id TEXT NOT NULL, expires INTEGER NOT NULL, session_id TEXT);
CREATE TABLE IF NOT EXISTS billing_events (id TEXT PRIMARY KEY, type TEXT NOT NULL, customer_id TEXT, created INTEGER NOT NULL, received INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS billing_holds (customer_id TEXT PRIMARY KEY, reason TEXT NOT NULL, event_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS billing_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS billing_session_expiry ON billing_sessions(expires);
CREATE INDEX IF NOT EXISTS billing_login_expiry ON billing_login(expires);
