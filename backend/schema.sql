CREATE TABLE IF NOT EXISTS couples (id TEXT PRIMARY KEY, token TEXT NOT NULL, pair_code TEXT UNIQUE, names TEXT, created_at TEXT DEFAULT (datetime('now')), last_seen TEXT);
CREATE TABLE IF NOT EXISTS plans (couple_id TEXT PRIMARY KEY REFERENCES couples(id), data TEXT NOT NULL, rev INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')), device TEXT);
-- Existing deployments only (the column is in the CREATE above for fresh ones):
--   ALTER TABLE plans ADD COLUMN rev INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS album_photos (id TEXT PRIMARY KEY, couple_id TEXT NOT NULL, r2_key TEXT NOT NULL, uploader TEXT, bytes INTEGER, created_at TEXT DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_album_couple ON album_photos(couple_id);
CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, couple_id TEXT NOT NULL, category TEXT, supplier TEXT, message TEXT, status TEXT DEFAULT 'queued', created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS scans (id TEXT PRIMARY KEY, couple_id TEXT NOT NULL, item_id TEXT, extracted TEXT, created_at TEXT DEFAULT (datetime('now')));
