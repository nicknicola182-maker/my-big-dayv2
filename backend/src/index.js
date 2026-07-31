/* Wedding App API — Cloudflare Worker
   Couples & pairing · plan sync · guest QR album (R2) · geo · FX · AI scan · suppliers · enquiries */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};
const J = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS, ...extra } });
const uid = (n = 12) => [...crypto.getRandomValues(new Uint8Array(n))].map(b => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");
const pairCode = () => [...crypto.getRandomValues(new Uint8Array(6))].map(b => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[b % 31]).join("");

async function auth(req, env) {
  const h = req.headers.get("Authorization") || "";
  const m = h.match(/^Bearer\s+([^:]+):(.+)$/);
  if (!m) return null;
  const row = await env.DB.prepare("SELECT id FROM couples WHERE id=? AND token=?").bind(m[1], m[2]).first();
  return row ? m[1] : null;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, "") || "/";
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    try {
      /* ---------- health ---------- */
      if (p === "/api/health") return J({ ok: true, service: "wedding-app-api", time: new Date().toISOString() });

      /* ---------- couples & pairing ---------- */
      if (p === "/api/couple" && req.method === "POST") {
        const body = await req.json().catch(() => ({}));
        const id = uid(10), token = uid(24), code = pairCode();
        await env.DB.prepare("INSERT INTO couples (id, token, pair_code, names) VALUES (?,?,?,?)")
          .bind(id, token, code, (body.names || "").slice(0, 120)).run();
        return J({ id, token, pairCode: code });
      }
      if (p === "/api/pair" && req.method === "POST") {
        const { code } = await req.json().catch(() => ({}));
        if (!code) return J({ error: "code required" }, 400);
        const row = await env.DB.prepare("SELECT id, token FROM couples WHERE pair_code=?").bind(String(code).toUpperCase().trim()).first();
        if (!row) return J({ error: "No couple with that code, darling — check it and try again." }, 404);
        return J({ id: row.id, token: row.token });
      }

      /* ---------- plan sync (last write wins) ---------- */
      if (p === "/api/plan") {
        const cid = await auth(req, env);
        if (!cid) return J({ error: "unauthorised" }, 401);
        if (req.method === "GET") {
          const row = await env.DB.prepare("SELECT data, updated_at FROM plans WHERE couple_id=?").bind(cid).first();
          return J(row ? { data: JSON.parse(row.data), updatedAt: row.updated_at } : { data: null, updatedAt: null });
        }
        if (req.method === "PUT") {
          const body = await req.json().catch(() => null);
          if (!body || !body.data) return J({ error: "data required" }, 400);
          const txt = JSON.stringify(body.data);
          if (txt.length > 900_000) return J({ error: "plan too large" }, 413);
          await env.DB.prepare(
            "INSERT INTO plans (couple_id, data, updated_at, device) VALUES (?,?,datetime('now'),?) " +
            "ON CONFLICT(couple_id) DO UPDATE SET data=excluded.data, updated_at=datetime('now'), device=excluded.device")
            .bind(cid, txt, (body.device || "").slice(0, 40)).run();
          await env.DB.prepare("UPDATE couples SET last_seen=datetime('now') WHERE id=?").bind(cid).run();
          const row = await env.DB.prepare("SELECT updated_at FROM plans WHERE couple_id=?").bind(cid).first();
          return J({ ok: true, updatedAt: row.updated_at });
        }
      }

      /* ---------- guest album: public page, upload, list, serve ---------- */
      const albumPage = p.match(/^\/album\/([a-z0-9]+)$/);
      if (albumPage && req.method === "GET") {
        const cid = albumPage[1];
        const c = await env.DB.prepare("SELECT names FROM couples WHERE id=?").bind(cid).first();
        if (!c) return new Response("Album not found", { status: 404 });
        return new Response(guestPage(cid, c.names || "the happy couple"), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
      const albumUpload = p.match(/^\/album\/([a-z0-9]+)\/upload$/);
      if (albumUpload && req.method === "POST") {
        const cid = albumUpload[1];
        const c = await env.DB.prepare("SELECT id FROM couples WHERE id=?").bind(cid).first();
        if (!c) return J({ error: "album not found" }, 404);
        const form = await req.formData();
        const file = form.get("photo");
        const uploader = (form.get("name") || "").toString().slice(0, 60);
        if (!file || typeof file === "string") return J({ error: "photo required" }, 400);
        if (file.size > 15 * 1024 * 1024) return J({ error: "photo too large (15MB max)" }, 413);
        if (!/^image\//.test(file.type)) return J({ error: "images only" }, 415);
        const key = `${cid}/${Date.now()}-${uid(6)}.${(file.type.split("/")[1] || "jpg").slice(0, 4)}`;
        await env.ALBUM.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
        await env.DB.prepare("INSERT INTO album_photos (id, couple_id, r2_key, uploader, bytes) VALUES (?,?,?,?,?)")
          .bind(uid(10), cid, key, uploader, file.size).run();
        return J({ ok: true });
      }
      const albumList = p.match(/^\/album\/([a-z0-9]+)\/list$/);
      if (albumList && req.method === "GET") {
        const rows = await env.DB.prepare(
          "SELECT r2_key, uploader, created_at FROM album_photos WHERE couple_id=? ORDER BY created_at DESC LIMIT 500")
          .bind(albumList[1]).all();
        return J({ photos: (rows.results || []).map(r => ({ url: "/album/photo/" + encodeURIComponent(r.r2_key), by: r.uploader, at: r.created_at })) });
      }
      const photoServe = p.match(/^\/album\/photo\/(.+)$/);
      if (photoServe && req.method === "GET") {
        const obj = await env.ALBUM.get(decodeURIComponent(photoServe[1]));
        if (!obj) return new Response("Not found", { status: 404 });
        return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata?.contentType || "image/jpeg", "Cache-Control": "public, max-age=31536000", ...CORS } });
      }

      /* ---------- geo (free — from Cloudflare's edge) ---------- */
      if (p === "/api/geo") {
        const cf = req.cf || {};
        return J({ country: cf.country || null, city: cf.city || null, timezone: cf.timezone || null });
      }

      /* ---------- FX (free API, cached 24h in KV) ---------- */
      if (p === "/api/fx") {
        const base = (url.searchParams.get("base") || "GBP").toUpperCase().slice(0, 3);
        const cached = await env.CACHE.get("fx:" + base);
        if (cached) return J(JSON.parse(cached));
        const r = await fetch("https://open.er-api.com/v6/latest/" + base);
        if (!r.ok) return J({ error: "fx source unavailable" }, 502);
        const data = await r.json();
        const out = { base, rates: data.rates, asOf: data.time_last_update_utc };
        ctx.waitUntil(env.CACHE.put("fx:" + base, JSON.stringify(out), { expirationTtl: 86400 }));
        return J(out);
      }

      /* ---------- AI scan (Claude API — needs ANTHROPIC_API_KEY secret) ---------- */
      if (p === "/api/scan" && req.method === "POST") {
        const cid = await auth(req, env);
        if (!cid) return J({ error: "unauthorised" }, 401);
        if (!env.ANTHROPIC_API_KEY) return J({ error: "Scanning isn't switched on yet — the ANTHROPIC_API_KEY secret needs setting." }, 503);
        const { image, mediaType } = await req.json().catch(() => ({}));
        if (!image) return J({ error: "image (base64) required" }, 400);
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({
            model: "claude-3-5-haiku-latest", max_tokens: 400,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: image } },
              { type: "text", text: "This is a wedding supplier document (quote, invoice or receipt). Extract as JSON only, no prose: {\"supplier\": string|null, \"amount\": number|null, \"currency\": string|null, \"type\": \"quote\"|\"deposit-invoice\"|\"balance-invoice\"|\"receipt\"|null, \"dueDate\": \"YYYY-MM-DD\"|null, \"summary\": string}. Use null when unsure — never guess figures." }
            ]}]
          })
        });
        if (!r.ok) return J({ error: "AI service error", detail: await r.text() }, 502);
        const out = await r.json();
        let extracted = null;
        try { extracted = JSON.parse((out.content?.[0]?.text || "").replace(/```json|```/g, "").trim()); } catch (e) {}
        if (!extracted) return J({ error: "could not parse document" }, 422);
        await env.DB.prepare("INSERT INTO scans (id, couple_id, item_id, extracted) VALUES (?,?,?,?)")
          .bind(uid(10), cid, null, JSON.stringify(extracted)).run();
        return J({ extracted });
      }

      /* ---------- suppliers (Places proxy — needs GOOGLE_PLACES_API_KEY secret) ---------- */
      if (p === "/api/suppliers") {
        const q = url.searchParams.get("q"), where = url.searchParams.get("where");
        if (!q || !where) return J({ error: "q and where required" }, 400);
        if (!env.GOOGLE_PLACES_API_KEY) return J({ error: "In-app supplier results aren't switched on yet — the GOOGLE_PLACES_API_KEY secret needs setting. The app falls back to map links.", fallback: true }, 503);
        const ck = "sup:" + q + ":" + where;
        const cached = await env.CACHE.get(ck);
        if (cached) return J(JSON.parse(cached));
        const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber" },
          body: JSON.stringify({ textQuery: q + " near " + where, maxResultCount: 10 })
        });
        if (!r.ok) return J({ error: "places error" }, 502);
        const data = await r.json();
        const out = { results: (data.places || []).map(pl => ({ name: pl.displayName?.text, rating: pl.rating, reviews: pl.userRatingCount, address: pl.formattedAddress, website: pl.websiteUri, phone: pl.internationalPhoneNumber })) };
        ctx.waitUntil(env.CACHE.put(ck, JSON.stringify(out), { expirationTtl: 604800 }));
        return J(out);
      }

      /* ---------- enquiries ---------- */
      if (p === "/api/enquiry" && req.method === "POST") {
        const cid = await auth(req, env);
        if (!cid) return J({ error: "unauthorised" }, 401);
        const b = await req.json().catch(() => ({}));
        await env.DB.prepare("INSERT INTO enquiries (id, couple_id, category, supplier, message) VALUES (?,?,?,?,?)")
          .bind(uid(10), cid, (b.category || "").slice(0, 60), (b.supplier || "").slice(0, 120), (b.message || "").slice(0, 2000)).run();
        return J({ ok: true, note: "Stored. Outbound sending hooks up to an email provider in a later sprint." });
      }

      return J({ error: "not found" }, 404);
    } catch (e) {
      return J({ error: "server error", detail: String(e && e.message || e) }, 500);
    }
  }
};

/* ---------- the guest upload page (no app needed — this is what the QR opens) ---------- */
function guestPage(cid, names) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${names} — share your photos · My Big Day</title>
<style>
body{font-family:system-ui,sans-serif;background:linear-gradient(160deg,#FBEAEE,#F6DDE2 45%,#F8E3CF);margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;color:#33262B}
.card{background:#fff;border-radius:24px;max-width:400px;width:100%;padding:30px 26px;text-align:center;box-shadow:0 10px 40px rgba(160,90,110,.18)}
h1{font-family:Georgia,serif;font-weight:500;font-size:26px;margin:0 0 6px}
p{color:#84717A;font-size:14.5px;line-height:1.5}
.btn{display:block;width:100%;padding:15px;border:none;border-radius:16px;background:linear-gradient(135deg,#D96A8C,#B84A6E);color:#fff;font-size:16px;font-weight:700;cursor:pointer;margin-top:14px}
input[type=text]{width:100%;box-sizing:border-box;padding:12px;border:1.5px solid #F0E2DE;border-radius:12px;font-size:15px;margin-top:10px}
#st{margin-top:12px;font-size:14px;color:#5A7F66;font-weight:600;min-height:20px}
.heart{font-size:40px}
</style></head><body><div class="card">
<div class="heart">📸</div>
<h1>${names}</h1>
<p>You were there — we want to see it through your eyes. Add your photos straight to the couple's album. No app, no sign-up, just love.</p>
<input type="text" id="nm" placeholder="Your name (optional)">
<input type="file" id="f" accept="image/*" multiple style="display:none">
<button class="btn" onclick="document.getElementById('f').click()">Choose photos</button>
<div id="st"></div>
<script>
const f=document.getElementById('f'),st=document.getElementById('st');
f.onchange=async()=>{const files=[...f.files];let done=0;
for(const file of files){st.textContent='Sending '+(done+1)+' of '+files.length+'…';
const fd=new FormData();fd.append('photo',file);fd.append('name',document.getElementById('nm').value);
try{const r=await fetch('/album/${cid}/upload',{method:'POST',body:fd});if(r.ok)done++;}catch(e){}}
st.textContent=done? done+' photo'+(done>1?'s':'')+' with the couple now — thank you! 🥂':'That did not work — try again?';};
</script><div style='margin-top:14px;font-size:11px;letter-spacing:.2em;color:#B08894'>MY BIG DAY</div></div></body></html>`;
}
