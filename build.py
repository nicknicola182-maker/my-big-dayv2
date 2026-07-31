#!/usr/bin/env python3
import json, glob, os, base64
os.chdir(os.path.dirname(os.path.abspath(__file__)))

packs = {}
for f in sorted(glob.glob("packs/*.json")):
    d = json.load(open(f))
    # drop sources from the embedded build to save weight (kept in repo)
    d.pop("sources", None)
    packs[d["id"]] = d
import gzip as _gz
_packs_raw = json.dumps(packs, separators=(",",":")).encode()
_packs_gz = _gz.compress(_packs_raw, 9)
packs_js = ('const PACKS_Z="' + base64.b64encode(_packs_gz).decode() + '";\n'
  'const PACKS = JSON.parse(fflate.strFromU8(fflate.gunzipSync(Uint8Array.from(atob(PACKS_Z),c=>c.charCodeAt(0)))));')

import base64
def b64(p): return base64.b64encode(open(p,"rb").read()).decode()
css = open("src/app.css").read()
css = css.replace("%%F_GLOOCK%%", b64("fonts/Gloock-Regular.woff2"))
css = css.replace("%%F_OUTFIT%%", b64("fonts/Outfit-Regular.woff2"))
css = css.replace("%%F_OUTFITB%%", b64("fonts/Outfit-Bold.woff2"))
css = css.replace("%%F_SCRIPT%%", b64("fonts/NothingYouCouldDo-Regular.woff2"))
qr = open("node_modules/qrcode-generator/dist/qrcode.js").read()
fflate = open("node_modules/fflate/umd/index.js").read()
app1 = open("src/app1.js").read()
app2 = open("src/app2.js").read()

html = f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#F6DDE2">
<title>My Big Day — the wedding planner who knows your traditions</title>
<style>{css}</style>
</head>
<body>
<div id="app"></div>
<script>{fflate}</script>
<script>{qr}</script>
<script>{packs_js}</script>
<script>{app1}</script>
<script>{app2}</script>
</body>
</html>"""

os.makedirs("dist", exist_ok=True)
open("dist/index.html","w").write(html)
print("built dist/index.html:", round(len(html)/1024), "KB")
