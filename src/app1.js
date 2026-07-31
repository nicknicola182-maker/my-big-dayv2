/* ============ Wedding App — Sprint 1 prototype v0.2 ============ */
/* PACKS is injected by the build step */
'use strict';

/* ---------- static data ---------- */
/* [code, name, currency, cost multiplier vs UK, currency units per GBP (rough)] */
const COUNTRIES = [
 ["AL","Albania","EUR",0.4,1.15],["AR","Argentina","USD",0.4,1.25],["AM","Armenia","USD",0.4,1.25],
 ["AU","Australia","AUD",1.1,1.95],["AT","Austria","EUR",0.95,1.15],["BD","Bangladesh","BDT",0.3,150],
 ["BE","Belgium","EUR",0.9,1.15],["BA","Bosnia & Herzegovina","EUR",0.45,1.15],["BR","Brazil","BRL",0.5,6.9],
 ["BG","Bulgaria","EUR",0.45,1.15],["CA","Canada","CAD",1.05,1.75],["CL","Chile","USD",0.6,1.25],
 ["CO","Colombia","USD",0.4,1.25],["HR","Croatia","EUR",0.6,1.15],["CY","Cyprus","EUR",0.72,1.15],
 ["CZ","Czechia","CZK",0.6,28],["DK","Denmark","DKK",1.1,8.6],["EG","Egypt","EGP",0.3,62],
 ["FJ","Fiji","USD",0.5,1.25],["FI","Finland","EUR",1.0,1.15],["FR","France","EUR",0.9,1.15],
 ["GE","Georgia","USD",0.4,1.25],["DE","Germany","EUR",0.85,1.15],["GR","Greece","EUR",0.68,1.15],
 ["GY","Guyana","USD",0.4,1.25],["HU","Hungary","HUF",0.55,460],["IS","Iceland","EUR",1.2,1.15],
 ["IN","India","INR",0.35,110],["ID","Indonesia","IDR",0.35,20000],["IE","Ireland","EUR",1.05,1.15],
 ["IL","Israel","ILS",1.0,4.6],["IT","Italy","EUR",0.85,1.15],["JO","Jordan","USD",0.5,1.25],
 ["KE","Kenya","KES",0.35,165],["KW","Kuwait","USD",1.0,1.25],["LB","Lebanon","USD",0.5,1.25],
 ["LT","Lithuania","EUR",0.55,1.15],["LU","Luxembourg","EUR",1.1,1.15],["MY","Malaysia","MYR",0.5,5.5],
 ["MT","Malta","EUR",0.8,1.15],["MU","Mauritius","USD",0.45,1.25],["MX","Mexico","MXN",0.5,24],
 ["MA","Morocco","MAD",0.4,12.5],["NL","Netherlands","EUR",0.9,1.15],["NZ","New Zealand","NZD",1.05,2.1],
 ["NG","Nigeria","NGN",0.35,1900],["MK","North Macedonia","EUR",0.4,1.15],["NO","Norway","NOK",1.2,13.5],
 ["OM","Oman","USD",0.9,1.25],["PK","Pakistan","PKR",0.3,360],["PE","Peru","USD",0.45,1.25],
 ["PH","Philippines","PHP",0.35,73],["PL","Poland","PLN",0.55,4.9],["PT","Portugal","EUR",0.7,1.15],
 ["QA","Qatar","USD",1.1,1.25],["RO","Romania","RON",0.5,5.8],["RU","Russia","USD",0.55,1.25],
 ["SA","Saudi Arabia","SAR",0.9,4.8],["RS","Serbia","EUR",0.45,1.15],["SG","Singapore","SGD",1.3,1.65],
 ["SK","Slovakia","EUR",0.55,1.15],["SI","Slovenia","EUR",0.65,1.15],["SO","Somalia","USD",0.3,1.25],
 ["ZA","South Africa","ZAR",0.45,23],["KR","South Korea","USD",0.9,1.25],["ES","Spain","EUR",0.75,1.15],
 ["LK","Sri Lanka","LKR",0.35,380],["SE","Sweden","SEK",0.9,13.4],["CH","Switzerland","CHF",1.5,1.1],
 ["TT","Trinidad & Tobago","USD",0.5,1.25],["TN","Tunisia","USD",0.4,1.25],["TR","Turkey","TRY",0.45,53],
 ["UA","Ukraine","UAH",0.4,53],["AE","United Arab Emirates","AED",1.15,4.7],["GB","United Kingdom","GBP",1.0,1],
 ["US","United States","USD",1.25,1.25],["NP","Nepal","NPR",0.3,175],["XX","Somewhere else","GBP",1.0,1]
].sort((a,b)=> a[0]==="XX"?1 : b[0]==="XX"?-1 : a[1].localeCompare(b[1]));
const CURSYM = {GBP:"£",EUR:"€",USD:"$",CAD:"C$",AUD:"A$",NZD:"NZ$",INR:"₹",PKR:"₨",ILS:"₪",AED:"AED ",ZAR:"R",
 PHP:"₱",MXN:"MX$",BRL:"R$",TRY:"₺",EGP:"E£",MAD:"MAD ",SAR:"SAR ",KES:"KSh ",NGN:"₦",RON:"RON ",UAH:"₴",
 CZK:"Kč ",HUF:"Ft ",PLN:"zł ",SEK:"kr ",DKK:"kr ",NOK:"kr ",CHF:"CHF ",SGD:"S$",MYR:"RM ",IDR:"Rp ",
 BDT:"৳",LKR:"Rs ",NPR:"Rs "};
const BASE_MEDIAN_GBP = 24000;

const PACK_TAGS = {
 "greek-orthodox":"crowns, koumbaroi, a proper glendi",
 "roman-catholic":"the full nuptial mass moment",
 "protestant":"bells, vows and a beautiful aisle",
 "jewish":"the chuppah, the glass, the hora",
 "muslim":"the nikah at the heart of it all",
 "hindu":"days of colour building to the fire",
 "sikh":"the Anand Karaj, done properly",
 "civil":"your rules, your words, your day",
 "buddhist":"monks bless, and the day is yours to build",
 "jain":"ahimsa in the vows and on every plate",
 "bahai":"one sentence, two witnesses, every parent's blessing",
 "quaker":"a room full of silence until someone is moved",
 "zoroastrian":"the cloth drops and the rice flies",
 "pagan":"a circle cast, hands bound, the broom jumped"
};
const VARIANTS = {
 "greek-orthodox":["Greek / Cypriot","Russian","Serbian","Romanian","Other Orthodox"],
 "roman-catholic":["Irish","Polish","Italian","Filipino","Latin American","Other"],
 "protestant":["Church of England / Anglican","Methodist","Baptist","Presbyterian","Lutheran","Other"],
 "jewish":["Orthodox","Masorti / Conservative","Reform / Liberal","Secular / cultural","Other"],
 "muslim":["South Asian","Arab","Turkish, Balkan & Central Asian","Southeast Asian","African","Other / mixed"],
 "hindu":["North Indian","South Indian","Gujarati","Bengali","Punjabi Hindu","Other / diaspora"],
 "sikh":null,
 "civil":["Register office","Licensed venue","Celebrant-led","Humanist","Other"],
 "buddhist":["Thai","Sri Lankan","Vietnamese","Chinese","Tibetan","Japanese","Western convert","Other"],
 "jain":["Svetambara","Digambara","Gujarati Jain","Marwari Jain","Other"],
 "bahai":["Persian heritage","South Asian heritage","African heritage","Western","Other"],
 "quaker":null,
 "zoroastrian":["Parsi (India)","Iranian Zoroastrian","Diaspora","Other"],
 "pagan":["Wiccan","Druid","Heathen","Eclectic / non-aligned","Other"]
};
["greek-orthodox","roman-catholic","protestant","muslim","hindu"].forEach(k=>{
  if(VARIANTS[k] && !VARIANTS[k].some(v=>/^Other/.test(v))) VARIANTS[k].push("Other");
});
const VTITLES = {
 "greek-orthodox":["Which Orthodox family is yours?","Greek, Russian, Serbian — each with its own glorious customs."],
 "roman-catholic":["Which heritage shapes your celebration?","The mass is the mass — the party around it is entirely yours."],
 "protestant":["Which church is yours?","Each one does the day a little differently."],
 "jewish":["Which movement are you part of?","It shapes the ceremony, the dates and the details."],
 "muslim":["Which cultural background shapes your day?","The nikah is constant — the celebrations around it are wonderfully yours."],
 "hindu":["Which region's customs are yours?","Every region does it differently, and every one is spectacular."],
 "civil":["What style of ceremony?","Your day, your rules — just point me in the right direction."],
 "buddhist":["Which Buddhist tradition is yours?","Thai, Sri Lankan, Tibetan — they share almost nothing at a wedding, so I'd rather use yours."],
 "jain":["Which Jain tradition?","Svetambara and Digambara share the principles and differ in the practice."],
 "bahai":["Which heritage shapes the day?","The ceremony is the same everywhere. What surrounds it usually isn't."],
 "zoroastrian":["Which community is yours?","Parsi and Iranian Zoroastrian practice diverged over a thousand years ago."],
 "pagan":["Which path is yours?","Wiccan, Druid, Heathen — the shape of the rite differs, and so does who may lead it."]
};
const VDESCS = {
 "muslim":{
  "South Asian":"Pakistani, Indian, Bangladeshi — the mehndi, the baraat, the walima.",
  "Arab":"Levantine, Gulf and North African — the katb el-kitab, the zaffe.",
  "Turkish, Balkan & Central Asian":"The kına gecesi, the gold pinning, the davul at the door.",
  "Southeast Asian":"Malay and Indonesian — the akad and the bersanding.",
  "African":"Somali, West and East African traditions, each glorious in its own right.",
  "Other / mixed":"Every family blends it differently — we'll shape it together."
 },
 "civil":{
  "Register office":"The town-hall classic — a registrar marries you. Simple, legal, done.",
  "Licensed venue":"The registrar comes to a licensed hotel or venue — ceremony and party in one place.",
  "Celebrant-led":"Your story, written and led by a pro, anywhere you like — with a quick legal signing on the side.",
  "Humanist":"Non-religious and deeply personal, led by a humanist celebrant.",
  "Other":"Something else, or still deciding — we'll keep it flexible."
 }
};
const CEREMONY_OPTS = {
 church:["Our own church","Another church","Chapel at the venue","Not sure yet"],
 jewish:["Synagogue","Hotel or venue, under the chuppah","Outdoors, under the chuppah","Not sure yet"],
 muslim:["Mosque","At home","Banqueting venue","Not sure yet"],
 hindu:["Temple","Banqueting venue with mandap","Outdoor mandap","Not sure yet"],
 sikh:["Gurdwara","Not sure yet"],
 civil:["Register office","Licensed venue","Outdoor ceremony","Not sure yet"],
 buddhist:["Temple or vihara","Banqueting venue","At home","Not sure yet"],
 jain:["Derasar","Banqueting venue with mandap","Outdoor mandap","Not sure yet"],
 bahai:["Bahá'í centre","Hired venue","At home","Not sure yet"],
 quaker:["Meeting house","Not sure yet"],
 zoroastrian:["Agiary or baug","Hired venue","At home","Not sure yet"],
 pagan:["Woodland or grove","Stone circle or ancient site","Beach or hilltop","Private land","Not sure yet"]
};
const RECEPTION_OPTS = ["Hotel","Banqueting hall","Marquee","Restaurant"];
const RECEPTION_LEANS = ["Hotel","Banqueting hall","Marquee","Restaurant","Beach","Outdoor","Farm / barn","Other"];
const DIY_LEANS = new Set(["Marquee","Beach","Outdoor","Farm / barn","Other"]);
const LEAN_DESCS = {
 "Hotel":"Ballrooms, bedrooms for the stragglers, and someone else does the clearing up. A classic for a reason.",
 "Banqueting hall":"Built for a big night — room to feed everyone properly and dance until they turn the lights on.",
 "Restaurant":"Intimate, delicious, and the food does the talking. I love this for you.",
 "Marquee":"A blank canvas with a roof — total freedom, and I'll plan every practical bit underneath it.",
 "Beach":"Sand between your toes, sunset behind the vows. I'll handle the tides, the permits and the plan B.",
 "Outdoor":"Open sky, golden hour, goosebumps. I'll build in the structure, the power and the wet-weather plan.",
 "Farm / barn":"A farm, a field, a football pitch — you don't need to know how, darling. That's my job. Marquee, power, loos, permissions: all going in your plan.",
 "Other":"Rooftop? Vineyard? Castle? Name it below — however unusual, I'll build the how."
};
const DIY_ITEMS = [
 {id:"diy-structure", name:"Marquee or structure hire", section:"Reception", event:"", essential:true, share:0.10, unit:"fixed", supplierCategory:"Marquee hire",
  note:"A blank-canvas venue needs its roof — marquee, tipi or stretch tent, with flooring and festoon lighting."},
 {id:"diy-power", name:"Generators & power", section:"Reception", event:"", essential:true, share:0.02, unit:"fixed", supplierCategory:"Event services",
  note:"Caterers, band and lighting all need power a field doesn't have."},
 {id:"diy-toilets", name:"Luxury toilet hire", section:"Reception", event:"", essential:true, share:0.02, unit:"fixed", supplierCategory:"Event services",
  note:"Non-negotiable, and your guests will thank you."},
 {id:"diy-permit", name:"Site permission, licences & insurance", section:"Extras", event:"", essential:true, share:0.01, unit:"fixed", supplierCategory:"Event services",
  note:"Landowner permission in writing, event insurance, and any licence needed for alcohol or amplified music."}
];
const DIY_TASKS = [
 {monthsBefore:11, task:"Get the landowner's permission in writing, and walk the site — access for vehicles, water, noise, a wet-weather plan", critical:true},
 {monthsBefore:9,  task:"Book the marquee or structure, generators and toilets — from-scratch venue kit gets booked out fast", critical:false},
 {monthsBefore:4,  task:"Confirm how the legal ceremony happens — an unlicensed site usually means a separate signing", critical:true}
];
const PRIORITIES = ["Food & drink","Photography & film","Music & dancing","Flowers & styling","Attire","The venue","Beauty","Transport"];
const PRIO_SECTION = {"Food & drink":"Reception","Photography & film":"Photos & Film","Music & dancing":"Music & Entertainment","Flowers & styling":"Flowers & Styling","Attire":"Attire","The venue":"Reception","Beauty":"Beauty","Transport":"Transport"};
const STYLES = ["Traditional","Modern","Relaxed","Formal","Rustic","Glamorous"];
const STYLE_DESCS = {
 "Traditional":"The classics, done properly — timeless, elegant, and your grandmother approves.",
 "Modern":"Clean lines, bold choices — a wedding that looks like the future feels.",
 "Relaxed":"Barefoot-by-dessert energy. Beautiful, without a single stiff collar in sight.",
 "Formal":"Black tie, champagne towers, everyone looking absolutely devastating.",
 "Rustic":"Barns, festoon lights and wildflowers — polished, never scruffy.",
 "Glamorous":"Full drama, darling — sparkle, velvet, and an entrance they'll talk about."
};
const FREE_CUSTOM_CAP = 10, FREE_TABLE_CAP = 2;
const PRICE_LABEL = "£6.99";

/* ---------- state ---------- */
let S = null;
const SCHEMA_V = 3;
const STORE_KEY = "weddingapp";

/* Every key the app will ever set is declared here. The ones that used to accrete at
   runtime (photos, cloud, customTodos…) are declared too, so migrations can reason
   about the shape instead of guessing. */
const BLANK = () => ({
  v: SCHEMA_V,
  unlocked:false, onboarded:false, seenLanding:false, revealSeen:false,
  ans:{}, plan:null, guests:[], tables:[], runsheet:[],
  budgetTotal:0, budgetEstimated:false, cur:"GBP",
  tab:"home", accOpen:{}, listFilter:"all", obIx:0,
  customTodos:[], photos:[], albumCode:null, cloud:null, _pushedAt:0
});

/* Migrations run in order until the save is current. NEVER replace an unrecognised
   save with a blank one — that is a couple's planning and they cannot get it back. */
const MIGRATIONS = {
  2: s => {
    s.obIx = 0;                                   // onboarding position is persisted from v3 on
    s.revealSeen = !!s.onboarded;                 // anyone already in the app has seen it
    const d = BLANK();
    for(const k of ["listFilter","customTodos","photos","albumCode","cloud","_pushedAt","budgetEstimated"]){
      if(s[k] === undefined) s[k] = d[k];
    }
    s.v = 3;
    return s;
  }
};

function migrate(s){
  while(s.v < SCHEMA_V){
    const step = MIGRATIONS[s.v];
    if(!step) return null;                        // no path forward — caller preserves it
    const before = s.v;
    s = step(s);
    if(s.v === before) return null;               // buggy migration; don't spin
  }
  return s;
}

/* Park an unreadable save instead of discarding it. */
function rescue(raw){
  try{ localStorage.setItem(STORE_KEY+".rescued", raw); }catch(e){}
}

let saveBroken = false;
function save(){
  try{
    localStorage.setItem(STORE_KEY, JSON.stringify(S));
    if(saveBroken){ saveBroken = false; if(typeof toast === "function") toast("Saved — we're back in sync."); }
  }catch(e){
    if(saveBroken) return;                        // already said so; don't nag on every keystroke
    saveBroken = true;
    const full = e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22);
    console.error("save failed", e);
    if(typeof toast === "function") toast(full
      ? "Your phone's storage is full, so I can't save changes. Remove a few album photos and I'll try again."
      : "I couldn't save that change — don't close the app just yet.");
  }
}

function load(){
  let raw = null;
  try{ raw = localStorage.getItem(STORE_KEY); }catch(e){}
  if(!raw){ S = BLANK(); return; }

  let parsed = null;
  try{ parsed = JSON.parse(raw); }catch(e){}
  if(!parsed || typeof parsed !== "object"){ rescue(raw); S = BLANK(); return; }

  if(parsed.v > SCHEMA_V){ S = parsed; return; }   // written by a newer build — leave it alone
  const migrated = migrate(parsed);
  if(migrated){ S = migrated; save(); return; }

  rescue(raw);                                     // keep it; recoverable by a human later
  S = BLANK();
}

function fmt(n){ const s = CURSYM[S.cur]||"£"; if(n==null||isNaN(n)) return "—";
  return s + Math.round(n).toLocaleString("en-GB"); }
function esc(t){ return String(t??"").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function uid(){ return Math.random().toString(36).slice(2,9); }
/* ---------- branch layer ----------
   A branch (Russian Orthodox, Gujarati Hindu, Reform Jewish) is a delta over its
   base pack: it renames and drops events, adds events, items, tasks, paperwork,
   customs and gotchas, and overrides terms. Merged here so buildPlan and every
   view see one resolved pack and know nothing about branches. */
const _branchCache = {};
function applyBranch(p, variant){
  if(!p || !variant || !p.branches || !p.branches[variant]) return p;
  const key = p.id + "|" + variant;
  if(_branchCache[key]) return _branchCache[key];
  const b = p.branches[variant];
  const drop = new Set(b.dropEvents || []);
  const rename = b.renameEvents || {};
  const out = Object.assign({}, p);
  out.terms = Object.assign({}, p.terms, b.terms || {});
  out.events = p.events
    .filter(e => !drop.has(e.id))
    .map(e => rename[e.id] ? Object.assign({}, e, {name: rename[e.id]}) : e)
    .concat(b.addEvents || []);
  /* an item whose event this branch dropped goes with it */
  const live = new Set(out.events.map(e => e.id));
  out.items = p.items.filter(i => !i.event || live.has(i.event)).concat(b.addItems || []);
  /* shares must still sum to ~1 after adding and removing lines */
  const sum = out.items.reduce((n,i) => n + (i.shareOfBudget || 0), 0) || 1;
  out.items = out.items.map(i => Object.assign({}, i, {shareOfBudget: Math.round(i.shareOfBudget/sum*1e4)/1e4}));
  out.timeline  = p.timeline.concat(b.addTimeline || []).slice().sort((x,y)=>y.monthsBefore-x.monthsBefore);
  out.paperwork = p.paperwork.concat(b.addPaperwork || []);
  out.customs   = p.customs.concat(b.addCustoms || []);
  out.gotchas   = p.gotchas.concat(b.addGotchas || []);
  out.branchLabel = b.label || variant;
  _branchCache[key] = out;
  return out;
}
function pack(){ return applyBranch(PACKS[S.ans.packId], S.ans.variant); }
function pack2(){ return S.ans.packId2 ? applyBranch(PACKS[S.ans.packId2], S.ans.variant2) : null; }
function term(k){ const p = pack(); return (p && p.terms && p.terms[k]) || k; }
function countryOf(code){ return COUNTRIES.find(c=>c[0]===code) || COUNTRIES[0]; }
function dispName(){ const p = pack(); if(!p) return "";
  if(p.branchLabel && p.branchLabel !== p.name) return p.branchLabel;
  if(p.id==="greek-orthodox"){ const v = S.ans.variant||"";
    if(/Other/.test(v) || !v) return "Orthodox";
  }
  return p.name; }
function kfmt(n, cur){ const s = CURSYM[cur]||cur+" ";
  if(n>=1e6) return s+(n/1e6).toLocaleString("en-GB",{maximumFractionDigits:1})+"M";
  return n>=1000? s+(n/1000).toLocaleString("en-GB",{maximumFractionDigits:1})+"k" : s+n; }
function niceRound(n){ const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(n))-1)); return Math.round(n/m)*m; }

/* ---------- the culture engine ---------- */
function buildPlan(){
  const p = pack(), a = S.ans;
  const enabled = new Set(a.eventsOn || p.events.filter(e=>e.default!==false).map(e=>e.id));
  const events = p.events.filter(e=>enabled.has(e.id)).map(e=>({...e, name: localEventName(e)}));
  const items = p.items.filter(i=>!i.event || enabled.has(i.event)).map(i=>({
    id:i.id, name:i.name, section:i.section, event:i.event, note:i.note, essential:!!i.essential,
    unit:i.unit, supplierCategory:i.supplierCategory, religious:!!i.religiousRequirement,
    share:i.shareOfBudget||0, on:!!i.essential, custom:false,
    agreed:null, paid:0, dep:null
  }));
  if(a.venueDIY){
    const have = new Set(items.map(i=>i.id));
    DIY_ITEMS.forEach(d=>{ if(!have.has(d.id)) items.push({...d, religious:false, on:true, custom:false, agreed:null, paid:0, dep:null}); });
  }
  allocate(items);
  const wd = a.dateISO ? new Date(a.dateISO) : null;
  const srcTimeline = a.venueDIY ? p.timeline.concat(DIY_TASKS) : p.timeline;
  const timeline = srcTimeline.map((t,ix)=>({id:"t"+ix, task:t.task, mb:t.monthsBefore, critical:!!t.critical, done:false,
    when: wd ? monthLabel(addMonths(wd, -t.monthsBefore)) : t.monthsBefore+" months before"}));
  timeline.sort((x,y)=>y.mb-x.mb);
  const paperwork = p.paperwork.map((pp,ix)=>({id:"p"+ix, item:pp.item, who:pp.who||"", note:pp.note||"", done:false}));
  if(a.homeCountry && a.country && a.homeCountry!==a.country){
    const churchBased = p.faithGroup==="Christian";
    if(churchBased && a.ceremony==="Our own church, back home"){
      paperwork.push({id:"p-dest", item:"You're marrying at home and celebrating abroad — no ceremony is needed overseas. Take your marriage certificate in case a venue or blessing asks for it", who:"Both", note:"One marriage, one "+(p.terms.ceremony||"ceremony")+" — the party abroad is just the party.", done:false});
    } else {
      if(churchBased){
        paperwork.push({id:"p-parish", item:"Ask your parish at home to start the marrying-abroad paperwork — the pre-marriage file and permissions passed through the diocese to the church where you'll marry", who:"Both", note:"Allow six months — this chain moves at church speed.", done:false});
      }
      paperwork.push({id:"p-dest", item:"Check how a marriage in "+countryOf(a.country)[1]+" is recognised at home, and what notice/documents your home country requires", who:"Both", note:"You live in "+countryOf(a.homeCountry)[1]+" and are marrying abroad — start this early.", done:false});
    }
  }
  S.plan = {events, items, timeline, paperwork};
  if(!S.runsheet.length) buildRunsheet();
}
function allocate(items){
  const a = S.ans, total = S.budgetTotal||0;
  const boost = {}; (a.priorities||[]).forEach(pr=>{ boost[PRIO_SECTION[pr]] = 1.22; });
  let sum = 0;
  items.forEach(i=>{ if(i.on){ i.w = i.share * (boost[i.section]||0.96); sum += i.w; } });
  items.forEach(i=>{ i.alloc = (i.on && sum>0 && total>0) ? Math.round(i.w/sum*total) : 0; });
}
function reallocate(){ allocate(S.plan.items); save(); }
function addMonths(d,m){ const x = new Date(d); x.setMonth(x.getMonth()+m); return x; }
function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function isoDate(d){ return d.toISOString().slice(0,10); }
/* Demo-load the Ceremony section so every feature is visible from first open */
function seedCeremony(){
  const items = S.plan.items.filter(i=>i.section==="Ceremony" && i.on);
  if(!items.length) return;
  const wd = S.ans.dateISO ? new Date(S.ans.dateISO) : addMonths(new Date(), 12);
  const a = items[0];
  const base = a.alloc || 400;
  a.quotes = [
    {id:uid(), who:"Quote one — nearby", amt:Math.round(base*0.95), note:"Sample quote — swap in your real one", chosen:true},
    {id:uid(), who:"Quote two — the fancier option", amt:Math.round(base*1.2), note:"Sample quote", chosen:false}
  ];
  a.agreed = a.quotes[0].amt;
  a.dep = {amt:Math.max(20,Math.round(a.agreed*0.3)), due:isoDate(addDays(new Date(),21)), paid:false};
  a.balDue = isoDate(addDays(wd,-30));
  a.docs = [{id:uid(), name:"sample-quote.pdf", sample:true}];
  if(items[1]){
    items[1].quotes = [{id:uid(), who:"First quote in", amt:Math.round((items[1].alloc||200)*1.1), note:"Tap “Use this” to make it your agreed price", chosen:false}];
  }
}
function monthLabel(d){ return d.toLocaleDateString("en-GB",{month:"short",year:"numeric"}); }
function guestCount(){ return S.guests.reduce((n,g)=>n + 1 + (g.plus||0), 0) || (S.ans.guests||0); }

function buildRunsheet(){
  const defT = {"Morning of":"09:00","Day before":"18:00","1-2 weeks before":"19:00","Week before":"19:00"};
  let t = 11*60;
  S.runsheet = (S.plan.events||[]).map(e=>{
    const dayof = !e.when || /day( of)?$|wedding day|same day/i.test(e.when) || e.when==="";
    let time;
    if(dayof){ time = String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0"); t += 120; }
    else time = defT[e.when] || "";
    return {id:uid(), eventId:e.id, name:e.name, when:e.when||"Wedding day", time, note:e.description||"", track:"Everyone"};
  });
}

/* ---------- guest & budget range builders ---------- */
function guestRanges(){
  return [
    {lo:0,   hi:75,  label:"0 – 75",    mid:50},
    {lo:76,  hi:150, label:"76 – 150",  mid:110},
    {lo:151, hi:300, label:"151 – 300", mid:220},
    {lo:301, hi:0,   label:"300+",      mid:400}
  ];
}
function budgetRanges(){
  const cc = countryOf(S.ans.country||"GB"), cur = cc[2], fx = cc[4]||1;
  const B = [10000,20000,30000,40000,50000].map(n=>niceRound(n*fx));
  const mid = (a,b)=>niceRound((a+b)/2);
  return {cur, ranges:[
    {label:"Under "+kfmt(B[0],cur),                 mid:niceRound(B[0]*0.8)},
    {label:kfmt(B[0],cur)+" – "+kfmt(B[1],cur),     mid:mid(B[0],B[1])},
    {label:kfmt(B[1],cur)+" – "+kfmt(B[2],cur),     mid:mid(B[1],B[2])},
    {label:kfmt(B[2],cur)+" – "+kfmt(B[3],cur),     mid:mid(B[2],B[3])},
    {label:kfmt(B[3],cur)+" – "+kfmt(B[4],cur),     mid:mid(B[3],B[4])},
    {label:kfmt(B[4],cur)+"+",                      mid:niceRound(B[4]*1.3)}
  ]};
}
function estimateBudget(){
  const cc = countryOf(S.ans.country||"GB");
  const p = pack(); const typ = p? p.typicalGuests.typical : 120;
  const scale = Math.min(2.2, Math.max(0.6, (S.ans.guests||typ)/typ));
  return niceRound(BASE_MEDIAN_GBP * cc[3] * (cc[4]||1) * scale);
}

/* ---------- cultural sphere filtering for events ---------- */
function eventSphere(e){
  const n = (e.name||"")+" "+(e.description||"");
  if(/South Asian/i.test(e.name)) return "South Asian";
  if(/Malay|Southeast Asian/i.test(e.name)) return "Southeast Asian";
  if(/Somali/i.test(e.name)) return "African";
  if(/Turkish|Balkan|Central Asian/i.test(e.name)) return "Turkish, Balkan & Central Asian";
  return null;
}
const EVENT_LOCAL = {
 "muslim": {
  "engagement": {"South Asian":"The engagement (mangni)","Arab":"The engagement (tolbeh)","Turkish, Balkan & Central Asian":"The engagement (nişan)"},
  "mehndi":     {"South Asian":"Mehndi night","Arab":"Laylat al-henna — the henna night","Turkish, Balkan & Central Asian":"Kına gecesi — the henna night","African":"The henna night","Southeast Asian":"Malam berinai — the henna night"},
  "dugun":      {"South Asian":"The wedding party","Arab":"The farah — the wedding party","Turkish, Balkan & Central Asian":"The düğün — the wedding party","African":"The aroos — the wedding party","Southeast Asian":"The wedding party"}
 }
};
function localEventName(e){
  const m = EVENT_LOCAL[S.ans.packId], v = S.ans.variant;
  if(m && m[e.id] && v){ const hit = Object.keys(m[e.id]).find(k=> v.indexOf(k)===0 || k.indexOf(v)===0);
    if(hit) return m[e.id][hit]; }
  return e.name;
}
function eventRelevant(e){
  const v = S.ans.variant;
  const sph = eventSphere(e);
  if(!sph) return true;                       // universal events always shown
  if(!v || /Other|mixed/i.test(v)) return true; // no answer / mixed → show everything
  return v.indexOf(sph) === 0 || sph.indexOf(v) === 0;
}

/* ---------- geolocation suggestion (on-device: timezone + language, no server) ---------- */
const TZ_COUNTRY = {"Europe/London":"GB","Europe/Dublin":"IE","Asia/Nicosia":"CY","Europe/Athens":"GR","Europe/Paris":"FR","Europe/Berlin":"DE","Europe/Madrid":"ES","Europe/Rome":"IT","Europe/Lisbon":"PT","Europe/Warsaw":"PL","Europe/Amsterdam":"NL","Europe/Stockholm":"SE","Europe/Copenhagen":"DK","Europe/Oslo":"NO","Europe/Helsinki":"FI","Europe/Zurich":"CH","Europe/Vienna":"AT","Europe/Brussels":"BE","Europe/Prague":"CZ","Europe/Budapest":"HU","Europe/Bucharest":"RO","Europe/Sofia":"BG","Europe/Belgrade":"RS","Europe/Zagreb":"HR","Europe/Kyiv":"UA","Europe/Kiev":"UA","Europe/Istanbul":"TR","Europe/Moscow":"RU","Europe/Malta":"MT","Europe/Luxembourg":"LU","Europe/Vilnius":"LT","Atlantic/Reykjavik":"IS","America/New_York":"US","America/Chicago":"US","America/Denver":"US","America/Los_Angeles":"US","America/Phoenix":"US","America/Toronto":"CA","America/Vancouver":"CA","America/Edmonton":"CA","America/Mexico_City":"MX","America/Sao_Paulo":"BR","America/Argentina/Buenos_Aires":"AR","America/Bogota":"CO","America/Lima":"PE","America/Santiago":"CL","America/Port_of_Spain":"TT","America/Guyana":"GY","Asia/Jerusalem":"IL","Asia/Dubai":"AE","Asia/Riyadh":"SA","Asia/Qatar":"QA","Asia/Kuwait":"KW","Asia/Beirut":"LB","Asia/Amman":"JO","Asia/Karachi":"PK","Asia/Kolkata":"IN","Asia/Colombo":"LK","Asia/Dhaka":"BD","Asia/Kathmandu":"NP","Asia/Jakarta":"ID","Asia/Kuala_Lumpur":"MY","Asia/Singapore":"SG","Asia/Manila":"PH","Asia/Seoul":"KR","Africa/Cairo":"EG","Africa/Casablanca":"MA","Africa/Nairobi":"KE","Africa/Lagos":"NG","Africa/Johannesburg":"ZA","Africa/Mogadishu":"SO","Australia/Sydney":"AU","Australia/Melbourne":"AU","Australia/Perth":"AU","Australia/Brisbane":"AU","Pacific/Auckland":"NZ","Pacific/Fiji":"FJ","Indian/Mauritius":"MU"};
function geoGuess(){
  try{
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(tz && TZ_COUNTRY[tz] && COUNTRIES.some(c=>c[0]===TZ_COUNTRY[tz])) return TZ_COUNTRY[tz];
  }catch(e){}
  try{
    const m = (navigator.language||"").match(/-([A-Z]{2})$/);
    if(m && COUNTRIES.some(c=>c[0]===m[1])) return m[1];
  }catch(e){}
  return "GB";
}

/* ---------- landing ---------- */
function renderLanding(){
  const petals = Array.from({length:14},(_,i)=>{
    const l = (i*7.3+3)%100, d = (i*1.7)%9, dur = 9+(i*2.3)%8, s = 0.6+((i*13)%10)/14;
    return `<span class="petal" style="left:${l}%;animation-delay:-${d}s;animation-duration:${dur}s;transform:scale(${s})"></span>`;
  }).join("");
  const sparks = Array.from({length:10},(_,i)=>{
    const l=(i*11+5)%100, t=(i*17+8)%90, d=(i*0.9)%4;
    return `<span class="spark" style="left:${l}%;top:${t}%;animation-delay:${d}s"></span>`;
  }).join("");
  document.getElementById("app").innerHTML = `
  <div id="landing">${petals}${sparks}
    <div class="land-inner">
      <div style="font-size:12px;letter-spacing:.3em;color:#B08894;text-transform:uppercase;margin-bottom:14px">My Big Day</div>
      <div class="script">darling…</div>
      <h1 class="land-title">You're getting<br>married.</h1>
      <p class="land-sub">Deep breath, champagne open. I plan weddings for a living — yours is about to be my favourite. A few little questions, and I'll build the whole thing around you two.</p>
      <button class="btn glam" onclick="S.seenLanding=true;save();renderOB()">Let's begin, my loves</button>
      <div class="land-foot">My Big Day · the planner who knows your traditions</div>
    </div>
  </div>`;
}

/* ---------- onboarding ---------- */
function obSteps(){
  const a = S.ans, p = a.packId ? PACKS[a.packId] : null;
  const cSet = p ? (p.faithGroup==="Christian" ? "church" : ({Jewish:"jewish",Muslim:"muslim",Hindu:"hindu",Sikh:"sikh",None:"civil"}[p.faithGroup]||"civil")) : "civil";
  const n1 = a.n1||"you", n2 = a.n2||"your love";
  const steps = [
    {id:"names", t:"Introduce me to the happy couple", s:"The two names going on everything — the invitations, the monogram, my heart.", type:"names"},
    {id:"gate", t:"Are we having a religious ceremony?", s:"Be honest with me, darling — it shapes everything I plan for you.", type:"pick",
      opts:[{v:"yes", l:"Yes — a religious ceremony"},{v:"no", l:"No — we're writing our own rules"}],
      get:()=>a.religiousGate, set:v=>{ a.religiousGate=v; if(v==="no"){ a.packChoice="civil"; a.packId="civil"; a.packId2=null; } }},
    {id:"religion", t:"Which faith are we working with?", s:"I know every one of these inside out — and I adore them all equally.", type:"pick",
      show:()=>a.religiousGate==="yes",
      opts:[
        {v:"christian", l:"Christian", d:"in all its beautiful branches"},
        {v:"jewish", l:"Jewish", d:PACK_TAGS["jewish"]},
        {v:"muslim", l:"Muslim", d:PACK_TAGS["muslim"]},
        {v:"hindu", l:"Hindu", d:PACK_TAGS["hindu"]},
        {v:"sikh", l:"Sikh", d:PACK_TAGS["sikh"]},
        {v:"buddhist", l:"Buddhist", d:PACK_TAGS["buddhist"]},
        {v:"jain", l:"Jain", d:PACK_TAGS["jain"]},
        {v:"bahai", l:"Bahá'í", d:PACK_TAGS["bahai"]},
        {v:"zoroastrian", l:"Zoroastrian / Parsi", d:PACK_TAGS["zoroastrian"]},
        {v:"pagan", l:"Pagan / handfasting", d:PACK_TAGS["pagan"]},
        {v:"mixed", l:"We're blending two traditions", d:"double the love, and I'm here for it"},
        {v:"civil", l:"None of these, actually", d:"we'll do it beautifully your way"}],
      get:()=>a.religion, set:v=>{ a.religion=v; a.packChoice=v;
        if(v==="mixed"){ /* mix step follows */ }
        else if(v==="christian"){ a.packId=null; a.packId2=null; }
        else { a.packId=v; a.packId2=null; } }},
    {id:"branch", t:"And what kind of Christian wedding?", s:"Each one is its own world — tell me yours.", type:"pick",
      show:()=>a.religiousGate==="yes" && a.religion==="christian",
      opts:[
        {v:"greek-orthodox", l:"Orthodox", d:"Greek, Russian, Serbian — we'll get specific next"},
        {v:"roman-catholic", l:"Roman Catholic", d:PACK_TAGS["roman-catholic"]},
        {v:"protestant", l:"Protestant / Anglican", d:PACK_TAGS["protestant"]},
        {v:"quaker", l:"Quaker", d:PACK_TAGS["quaker"]}],
      get:()=>a.packId, set:v=>{ a.packId=v; a.packId2=null; }},
    {id:"mix", t:"Two traditions, one love story", s:"Tell me whose is whose — I'll weave them together.", type:"mix",
      show:()=>a.packChoice==="mixed"},
    {id:"variant", t:(VTITLES[a.packId]||["And within that faith…"])[0], s:(VTITLES[a.packId]||["",""])[1]||"", type:"pick",
      show:()=>a.packId && VARIANTS[a.packId], opts:()=> (VARIANTS[a.packId]||[]).map(v=>({v, l:v, d:(VDESCS[a.packId]||{})[v]})),
      get:()=>a.variant, set:v=>a.variant=v, skip:true},
    {id:"country", t:"Where's the magic happening?", s:"The where sets the pricing, the paperwork and the possibilities.", type:"country", get:()=>a.country, set:v=>a.country=v},
    {id:"home", t:"And where do you two live?", s:"If home is somewhere else, there's extra paperwork — leave it with me.", type:"country",
      get:()=>a.homeCountry, set:v=>a.homeCountry=v, skip:true},
    {id:"date", t:"When are we doing this?", s:"A season is plenty to start with — and I'll flag any dates your tradition won't allow.", type:"date", skip:true},
    {id:"guests", t:"How many hearts in the room?", s:"A range is fine — or give me your exact number, superstar.", type:"guests"},
    {id:"budget", t:"Numbers, darling. Talk to me.", s:"No judgement here — a budget is just ambition with a plan. Skip it if you're not ready.", type:"budget", skip:true},
    {id:"ceremony", t:"Where's the "+(p? (p.terms.ceremony||"ceremony") : "ceremony")+" itself?",
      s:(cSet==="church" && a.homeCountry && a.country && a.homeCountry!==a.country)? "Marrying abroad, darling — so there are two proper routes, and I know both.":"", type:"pick",
      show:()=>a.packId!=="civil",
      opts: (cSet==="church" && a.homeCountry && a.country && a.homeCountry!==a.country)? [
        {v:"Our own church, back home", l:"Our own church, back home",
         d:"The full ceremony at home, the celebration abroad. One marriage, one "+(p?(p.terms.ceremony||"ceremony"):"ceremony")+" — nothing else needed overseas."},
        {v:"A church where we're marrying", l:"A church in "+countryOf(a.country)[1],
         d:"Your home parish sends the paperwork ahead through the diocese — it moves at church speed, so start early."},
        {v:"Chapel at the venue", l:"Chapel at the venue", d:"Ask early whether it's consecrated and who may officiate."},
        {v:"Not sure yet", l:"Not sure yet"}
      ] : CEREMONY_OPTS[cSet].map(v=>({v, l:v})), get:()=>a.ceremony, set:v=>a.ceremony=v, skip:true},
    {id:"reception", t:"Do you know where the party's happening?", s:"The reception, darling — the dancing, the dinner, the lot.", type:"reception", skip:true},
    {id:"events", t:"Which celebrations are we throwing?", s:"I've ticked the classics — switch off anything that isn't you two.", type:"events"},
    {id:"prio", t:"Where do we absolutely splurge?", s:"Pick up to three. I'll protect them in the budget like they're my own.", type:"multi",
      opts:PRIORITIES, get:()=>a.priorities||[], max:3, set:v=>a.priorities=v, skip:true},
    {id:"style", t:"Give me the vibe.", s:"One word each way — which wedding are we throwing?", type:"pick", opts:STYLES.map(v=>({v,l:v,d:STYLE_DESCS[v]})), get:()=>a.style, set:v=>a.style=v, skip:true},
    {id:"partner", t:"Planning as a duo?", s:"Invite "+ (a.n2? esc(a.n2):"your partner") +" so you're both looking at the same fabulous plan.", type:"partner"}
  ];
  return steps.filter(st=>!st.show || st.show());
}

const VIGNETTES = {
 names:    '<div class="vig vig-names"><span class="e">💘</span><span class="e">💝</span></div>',
 gate:     '<div class="vig vig-gate"><span class="ring"></span><span class="ring"></span><span class="sp">✨</span></div>',
 religion: '<div class="vig vig-religion"><span class="e">🕯️</span></div>',
 branch:   '<div class="vig vig-branch"><span class="dove">🕊️</span><span class="e">⛪</span></div>',
 mix:      '<div class="vig vig-mix"><span class="orb"><span class="oa">🧡</span><span class="ob">💜</span></span></div>',
 variant:  '<div class="vig vig-variant"><span class="flag"></span><span class="flag"></span><span class="flag"></span><span class="flag"></span><span class="flag"></span><span class="flag"></span></div>',
 country:  '<div class="vig vig-country"><span class="e">🌍</span><span class="pin">📍</span></div>',
 home:     '<div class="vig vig-home"><span class="e">🏡</span><span class="hh">💗</span><span class="hh">💗</span><span class="hh">💗</span></div>',
 date:     '<div class="vig vig-date"><span class="e">📅</span><span class="pop">💖</span></div>',
 guests:   '<div class="vig vig-guests"><span class="e">🥂</span><span class="e">🥂</span><span class="sp">✨</span></div>',
 budget:   '<div class="vig vig-budget"><span class="coin">🪙</span><span class="coin">🪙</span><span class="coin">🪙</span><span class="e">💝</span></div>',
 ceremony: '<div class="vig vig-cer"><span class="f">🌸</span><span class="f">🌺</span><span class="f">🌸</span></div>',
 reception:'<div class="vig vig-rec"><span class="e">🪩</span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>',
 events:   '<div class="vig vig-events"><span class="c"></span><span class="c"></span><span class="c"></span><span class="c"></span><span class="c"></span><span class="e">🎉</span></div>',
 prio:     '<div class="vig vig-prio"><span class="e">⭐</span><span class="e">🌟</span><span class="e">⭐</span></div>',
 style:    '<div class="vig vig-style"><span class="sw"></span><span class="sw"></span><span class="sw"></span><span class="sw"></span></div>',
 partner:  '<div class="vig vig-partner"><span class="e">📱</span><span class="lv">💌</span><span class="e">📱</span></div>'
};

/* onboarding position lives in S — a reload used to send the couple back to question one */
function renderOB(){
  if(!S.seenLanding){ renderLanding(); return; }
  const steps = obSteps();
  if(S.obIx >= steps.length){ finishOB(); return; }
  const st = steps[S.obIx], a = S.ans;
  const pct = Math.round((S.obIx)/steps.length*100);
  let body = "";
  if(st.type==="names"){
    body = `<input id="n1" placeholder="Your name" value="${esc(a.n1||"")}" style="margin-bottom:10px">
            <input id="n2" placeholder="Your partner's name" value="${esc(a.n2||"")}">`;
  } else if(st.type==="pick"){
    const opts = typeof st.opts==="function" ? st.opts() : st.opts;
    body = opts.map(o=>`<button class="opt ${st.get()===o.v?"on":""}" onclick="obPick('${st.id}','${esc(String(o.v)).replace(/'/g,"\\'")}')">${esc(o.l)}${o.d?`<small>${esc(o.d)}</small>`:""}</button>`).join("");
  } else if(st.type==="mix"){
    const packsArr = Object.values(PACKS);
    const L1 = a.n1? esc(a.n1)+"'s tradition" : "Your tradition";
    const L2 = a.n2? esc(a.n2)+"'s tradition" : "Your partner's tradition";
    body = `<div class="mixlab">${L1}</div>` +
      `<select class="mixsel" onchange="obMix('packId',this.value)"><option value="">Choose…</option>${packsArr.map(pp=>`<option value="${pp.id}" ${a.packId===pp.id?"selected":""}>${esc(pp.name)}</option>`).join("")}</select>` +
      `<div class="mixlab" style="margin-top:16px">${L2}</div>` +
      `<select class="mixsel" onchange="obMix('packId2',this.value)"><option value="">Choose…</option>${packsArr.filter(pp=>pp.id!==a.packId).map(pp=>`<option value="${pp.id}" ${a.packId2===pp.id?"selected":""}>${esc(pp.name)}</option>`).join("")}</select>` +
      (a.packId && a.packId2 ? `<div class="small" style="margin-top:14px">Gorgeous. I'll weave both in — the day's structure starts from ${esc(PACKS[a.packId].shortName)} and you can swap that any time in Settings.</div>`:"");
  } else if(st.type==="country"){
    const guessed = st.id==="country" && !st.get();
    const cur = st.get() || (st.id==="home" ? (a.country||geoGuess()) : geoGuess());
    body = `${guessed? `<div class="small" style="background:#FDF1F5;border-radius:12px;padding:9px 13px;margin-bottom:10px">📍 I've guessed <b>${esc(countryOf(cur)[1])}</b> from your phone — correct me if the wedding's elsewhere.</div>`:""}
      <select id="csel" onchange="obCountry('${st.id}', this.value)">` +
      COUNTRIES.map(c=>`<option value="${c[0]}" ${c[0]===cur?"selected":""}>${c[1]}</option>`).join("") + `</select>` +
      (st.id==="country"? `<input id="ccity" placeholder="Which town or city? (optional — sharpens supplier searches)" value="${esc(a.city||"")}" oninput="S.ans.city=this.value" style="margin-top:10px">`:"") +
      `<div class="small" style="margin-top:10px">${st.id==="country"? (a.packId && a.packId!=="civil"? "A "+esc(pack().shortName)+" wedding in Melbourne is still a "+esc(pack().shortName)+" wedding — you tell me where, I follow." : "Home or abroad, darling — pricing and paperwork follow the country, and I handle both.") : "Different country from the wedding means a little paperwork dance. I lead, you follow."}</div>`;
    if(!st.get()) st.set(cur);
  } else if(st.type==="date"){
    body = `<input type="date" id="wdate" value="${a.dateISO||""}" onchange="S.ans.dateISO=this.value">`;
  } else if(st.type==="guests"){
    const rs = guestRanges();
    body = rs.map((r,ix)=>`<button class="opt ${a.guestRange===ix?"on":""}" onclick="obGuestRange(${ix})">${r.label}</button>`).join("") +
      `<div class="orline">or exactly</div>
       <input type="number" inputmode="numeric" id="gexact" placeholder="Type your number — e.g. 250" value="${a.guestsExact||""}" oninput="obGuestExact(this.value)">`;
  } else if(st.type==="budget"){
    const br = budgetRanges();
    body = br.ranges.map((r,ix)=>`<button class="opt ${a.budgetRange===ix?"on":""}" onclick="obBudgetRange(${ix})">${r.label}</button>`).join("") +
      `<button class="opt ${a.budgetMode==="estimate"?"on":""}" onclick="obBudgetEstimate()">I honestly don't know<small>Then let's figure it out together — answer the rest and I'll build you a sample wedding to react to.</small></button>
      <div class="orline">or exactly</div>
       <input type="number" inputmode="numeric" id="bexact" placeholder="Type your budget — e.g. 25000" value="${a.budgetExact||""}" oninput="obBudgetExact(this.value)">`;
  } else if(st.type==="reception"){
    body = `<button class="opt ${a.receptionMode==="known"?"on":""}" onclick="obReception('known')">Yes — I've got the place<small>Look at you, ahead of the game.</small></button>` +
      (a.receptionMode==="known" ? `<input id="rother" placeholder="Name it — venue, town, the lot" value="${esc(a.receptionOther||"")}" oninput="S.ans.receptionOther=this.value" style="margin:2px 0 10px">` : "") +
      `<button class="opt ${a.receptionMode==="help"?"on":""}" onclick="obReception('help')">Help me choose<small>My favourite job. We'll find it together.</small></button>` +
      (a.receptionMode==="help" ? `<div class="small" style="margin:6px 0 8px">Any leanings? Pick as many as you like — we're exploring, darling.</div><div>${RECEPTION_LEANS.map(v=>`<button class="chip ${(a.receptionLeans||[]).includes(v)?"on":""}" onclick="obReceptionLean('${v}')">${v}</button>`).join("")}</div>` +
        ((a.receptionLeans||[]).includes("Other") ? `<input id="rlean" placeholder="Tell me — football pitch? rooftop? vineyard?" value="${esc(a.receptionLeanOther||"")}" oninput="S.ans.receptionLeanOther=this.value" style="margin-top:8px">` : "") +
        (a.leanLast && (a.receptionLeans||[]).includes(a.leanLast) && LEAN_DESCS[a.leanLast] ? `<div class="small" style="margin-top:10px;background:#FDF1F5;border-radius:12px;padding:10px 13px">${LEAN_DESCS[a.leanLast]}</div>` : "") : "");
  } else if(st.type==="events"){
    const p = pack();
    const rel = p.events.filter(eventRelevant), other = p.events.filter(e=>!eventRelevant(e));
    const on = new Set(a.eventsOn || rel.filter(e=>e.default!==false).map(e=>e.id));
    const row = e=>`
      <div class="opt evt" onclick="obEvent('${e.id}')">
        <span>${esc(localEventName(e))}<small>${esc(e.when||"")}${e.hosts?" · "+esc(e.hosts):""}</small></span>
        <span class="togg ${on.has(e.id)?"on":""}"><i></i></span>
      </div>`;
    body = rel.map(row).join("");
    if(other.length){
      body += a.showAllEvents
        ? `<div class="small" style="margin:10px 0 6px">Traditions from other ${esc(p.shortName)} communities — all yours if you want them</div>` + other.map(row).join("")
        : `<button class="skip" style="display:block;margin:12px auto 4px" onclick="S.ans.showAllEvents=true;save();renderOB()">+ Traditions from other ${esc(p.shortName)} communities (${other.length})</button>`;
    }
    a.eventsOn = [...on];
    const p2 = pack2();
    if(p2){ body += `<div class="small" style="margin:8px 0 6px">And from your ${esc(p2.shortName)} side — say the word</div>` +
      p2.events.slice(0,6).map(e=>{
        const on2 = new Set(a.events2On||[]);
        return `<div class="opt evt" onclick="obEvent2('${e.id}')">
          <span>${esc(e.name)}<small>${esc(e.when||"")}</small></span>
          <span class="togg ${on2.has(e.id)?"on":""}"><i></i></span></div>`;
      }).join(""); }
  } else if(st.type==="multi"){
    const cur = st.get();
    body = `<div class="center">` + st.opts.map(o=>`<button class="chip ${cur.includes(o)?"on":""}" onclick="obMulti('${st.id}','${esc(o)}')">${esc(o)}</button>`).join("") + `</div>`;
  } else if(st.type==="partner"){
    body = `<button class="opt" onclick="S.ans.partner='invite';obNext()">Yes — bring them in<small>Partner sync comes with the one-off unlock (${PRICE_LABEL}).</small></button>
            <button class="opt" onclick="S.ans.partner='later';obNext()">Just me for now</button>`;
  }
  const canNext = st.type==="names" ? true : st.type==="mix" ? (a.packId && a.packId2) :
    st.type==="guests" ? (a.guestRange!=null || a.guestsExact) :
    st.type==="budget" ? true :
    st.type==="reception" ? true :
    st.type==="events"||st.type==="multi"||st.type==="country"||st.type==="date"||st.type==="partner" ? true :
    st.get()!==undefined && st.get()!==null;
  document.getElementById("app").innerHTML = `<div id="ob">
    <div style="padding:20px 20px 12px;display:flex;justify-content:space-between;align-items:center">
      <button onclick="obBack()" style="font-size:15px;${S.obIx===0?"visibility:hidden":""}">‹ Back</button>
      <span class="small">${S.obIx+1} of ${steps.length}</span>
    </div>
    <div class="prog"><i style="width:${pct}%"></i></div>
    <div class="body">
      <div class="qwrap">
        ${VIGNETTES[st.id]||""}
        <div class="qtitle">${st.t}</div>
        <div class="qsub">${st.s||""}</div>
        ${body}
      </div>
    </div>
    <div class="foot">
      ${st.skip?`<button class="skip" onclick="obNext(true)">Skip for now</button>`:""}
      ${st.type!=="partner"?`<button class="btn glam" ${canNext?"":"disabled"} onclick="obAdvance('${st.id}')">Continue</button>`:""}
    </div>
  </div>`;
}
function obAdvance(id){
  const a = S.ans;
  if(id==="names"){ a.n1 = document.getElementById("n1").value.trim(); a.n2 = document.getElementById("n2").value.trim(); }
  if(id==="guests"){ a.guests = a.guestsExact? parseInt(a.guestsExact,10) : guestRanges()[a.guestRange].mid; }
  if(id==="budget"){
    const br = budgetRanges();
    const v = a.budgetExact? parseInt(a.budgetExact,10) : (a.budgetRange!=null? br.ranges[a.budgetRange].mid : 0);
    if(v>0){ S.budgetTotal = v; S.budgetEstimated = false; } S.cur = br.cur;
  }
  if(id==="reception"){
    const leans = (a.receptionLeans||[]).map(v=> v==="Other"? (a.receptionLeanOther||"").trim() : v).filter(Boolean);
    a.reception = a.receptionMode==="known"? (a.receptionOther||"Venue booked") : a.receptionMode==="help"? ("Help me choose"+(leans.length? " · leaning "+leans.join(" + ") : "")) : "";
    a.venueDIY = a.receptionMode==="help" && (a.receptionLeans||[]).some(v=>DIY_LEANS.has(v)); }
  if(id==="country"){ S.cur = countryOf(a.country||"GB")[2]; }
  obNext();
}
function obNext(){ S.obIx++; save(); renderOB(); }
function obBack(){ if(S.obIx>0){ S.obIx--; save(); renderOB(); } }
function obPick(stepId, v){
  const st = obSteps().find(s=>s.id===stepId);
  st.set(v); save(); renderOB();
}
function obMix(k, v){ if(!v) return; S.ans[k]=v; if(k==="packId" && S.ans.packId2===v) S.ans.packId2=null; save(); renderOB(); }
function obCountry(stepId, v){ const st = obSteps().find(s=>s.id===stepId); st.set(v); save(); }
function obGuestRange(ix){ S.ans.guestRange = ix; S.ans.guestsExact = null; save(); renderOB(); }
function obGuestExact(v){ S.ans.guestsExact = v; S.ans.guestRange = null; save(); manualSync(v); }
function obBudgetRange(ix){ S.ans.budgetRange = ix; S.ans.budgetExact = null; S.ans.budgetMode = null; save(); renderOB(); }
function obBudgetExact(v){ S.ans.budgetExact = v; S.ans.budgetRange = null; S.ans.budgetMode = null; save(); manualSync(true); }
function obBudgetEstimate(){ S.ans.budgetMode = "estimate"; S.ans.budgetRange = null; S.ans.budgetExact = null; save(); renderOB(); }
function manualSync(v){ /* update button state without re-render (keeps keyboard focus) */
  document.querySelectorAll("#ob .opt.on").forEach(el=>el.classList.remove("on"));
  const b = document.querySelector("#ob .foot .btn"); if(b) b.disabled = !v;
}
function obReception(v){ S.ans.receptionMode = v; save(); renderOB();
  if(v==="known"){ setTimeout(()=>{ const el=document.getElementById("rother"); el&&el.focus(); },50); } }
function obReceptionLean(v){
  const a = S.ans; a.receptionLeans = a.receptionLeans || (a.receptionLean? [a.receptionLean] : []);
  const ix = a.receptionLeans.indexOf(v);
  if(ix>=0){ a.receptionLeans.splice(ix,1); if(a.leanLast===v) a.leanLast=null; }
  else { a.receptionLeans.push(v); a.leanLast=v; }
  save(); renderOB(); }
function obEvent(id){ const a=S.ans; const on = new Set(a.eventsOn||[]); on.has(id)?on.delete(id):on.add(id); a.eventsOn=[...on]; save(); renderOB(); }
function obEvent2(id){ const a=S.ans; const on = new Set(a.events2On||[]); on.has(id)?on.delete(id):on.add(id); a.events2On=[...on]; save(); renderOB(); }
function obMulti(stepId, o){
  const st = obSteps().find(s=>s.id===stepId); const cur = [...st.get()];
  const ix = cur.indexOf(o); if(ix>=0) cur.splice(ix,1); else if(cur.length < (st.max||99)) cur.push(o);
  st.set(cur); save(); renderOB();
}
function finishOB(){
  if(!S.ans.packId){ S.obIx = 1; save(); renderOB(); return; }
  if(S.ans.packId==="civil" && !S.ans.ceremony) S.ans.ceremony = S.ans.variant || "Civil ceremony";
  if(S.ans.budgetMode==="estimate" && !S.budgetTotal){
    S.budgetTotal = estimateBudget(); S.budgetEstimated = true;
    S.cur = countryOf(S.ans.country||"GB")[2];
  }
  buildPlan();
  seedCeremony();
  S.onboarded = true; S.revealSeen = false; save();
  renderReveal();
}
function renderReveal(){
  const p = pack(), pl = S.plan;
  const nm = [S.ans.n1, S.ans.n2].filter(Boolean).join(" & ") || "Your wedding";
  document.getElementById("app").innerHTML = `<div id="ob"><div class="body reveal">
    <div class="qwrap center">
    <div class="script" style="font-size:26px">darlings…</div>
    <div class="big">${esc(nm)}</div>
    <div class="small">${esc(dispName())}${pack2()? " · with "+esc(pack2().shortName)+" woven in":""}${S.ans.country? " · "+esc(countryOf(S.ans.country)[1]):""}</div>
    <div class="revstat">
      <div><b>${pl.events.length}</b>celebrations</div>
      <div><b>${pl.items.filter(i=>i.on).length}</b>budget lines</div>
      <div><b>${pl.timeline.length}</b>tasks</div>
      <div><b>${pl.paperwork.length}</b>paperwork items</div>
    </div>
    ${S.budgetTotal? (()=>{
      const bySec = {}; pl.items.filter(i=>i.on).forEach(i=>{ bySec[i.section]=(bySec[i.section]||0)+(i.alloc||0); });
      const top = Object.entries(bySec).sort((a,b)=>b[1]-a[1]).slice(0,5);
      const g = S.ans.guests||0;
      const pkgName = "The "+([S.ans.n1,S.ans.n2].filter(Boolean).join(" & ")||"Starter")+" Package";
      return `<div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:4px 0 14px;text-align:left">
        <div style="font-family:'Nothing',cursive;color:var(--rose);font-size:17px">${S.budgetEstimated? "built just for you…":"your plan at a glance…"}</div>
        <div style="font-family:'Gloock',serif;font-size:19px;margin-bottom:8px">${esc(pkgName)}</div>
        ${top.map(([s,v])=>`<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:4px 0"><span>${esc(s)}</span><b>${fmt(v)}</b></div>`).join("")}
        <div style="display:flex;justify-content:space-between;font-size:14px;padding:8px 0 0;border-top:1.5px solid var(--line);margin-top:6px"><span><b>${fmt(S.budgetTotal)}</b> all in${g? ` · ${fmt(Math.round(S.budgetTotal/g))} a head`:""}</span>${S.budgetEstimated? `<span class="badge b-amber">sample</span>`:""}</div>
        ${S.budgetEstimated? `<div class="small" style="margin-top:8px">You said you didn't know — so I built this from your ${g? g+" guests, ":""}your tradition and ${esc(countryOf(S.ans.country||"GB")[1])} pricing. React to it, don't obey it.</div>`:""}
      </div>`; })() : ""}
    <p style="font-size:14.5px;color:var(--muted);margin-bottom:26px">Look what we've made already — your traditions, your country, your numbers. Every figure is a starting point, and now we make it magnificent.</p>
    <button class="btn glam" onclick="S.revealSeen=true;S.tab='home';save();render()">Show me my wedding</button>
    </div>
  </div></div>`;
}
