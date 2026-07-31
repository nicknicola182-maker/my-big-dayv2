/* ---------- main app (v20 feel) ---------- */
const SEC_META = {
 "Ceremony":       ["🕊️","#F6ECF1","#8E5A74"],
 "Reception":      ["🥂","#FBE9EC","#9C5A6C"],
 "Attire":         ["👗","#F4ECFA","#7A5580"],
 "Flowers & Styling":["🌸","#FDF1E3","#A66A3C"],
 "Photos & Film":  ["📸","#E9F1F8","#4F7590"],
 "Music & Entertainment":["🎶","#EFEAF8","#6E5A90"],
 "Stationery":     ["💌","#FBF1D8","#8F7431"],
 "Transport":      ["🚗","#E8F1EC","#5A7F66"],
 "Rings & Gifts":  ["💍","#FAEAE4","#A45A44"],
 "Beauty":         ["💄","#FDECEF","#B4485A"],
 "Extras":         ["✨","#EFF6F7","#3F6E78"],
 "Our Own Additions":["🌟","#EAF5F6","#3F6E78"]
};
const MINE = "Our Own Additions";
function secMeta(s){ return SEC_META[s]||["✨","#F3EEEA","#6E5A64"]; }
function cap(s){ return s? s.charAt(0).toUpperCase()+s.slice(1) : s; }

function toast(msg){
  let t = document.getElementById("toast");
  if(!t){ t = document.createElement("div"); t.id="toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm = setTimeout(()=>t.classList.remove("show"), 2200);
}

const ORD = ["","first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelfth","thirteenth","fourteenth","fifteenth","sixteenth","seventeenth","eighteenth","nineteenth","twentieth","twenty-first","twenty-second","twenty-third","twenty-fourth","twenty-fifth","twenty-sixth","twenty-seventh","twenty-eighth","twenty-ninth","thirtieth","thirty-first"];
const TENW = {0:"",1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",10:"ten",11:"eleven",12:"twelve",13:"thirteen",14:"fourteen",15:"fifteen",16:"sixteen",17:"seventeen",18:"eighteen",19:"nineteen",20:"twenty",30:"thirty",40:"forty",50:"fifty",60:"sixty",70:"seventy",80:"eighty",90:"ninety"};
function tensWords(n){ if(TENW[n]!=null) return TENW[n]; const t=Math.floor(n/10)*10; return TENW[t]+"-"+TENW[n-t]; }
function dateInWords(){
  if(!S.ans.dateISO) return "";
  const d = new Date(S.ans.dateISO);
  const wd = d.toLocaleDateString("en-GB",{weekday:"long"});
  const mo = d.toLocaleDateString("en-GB",{month:"long"});
  const y = d.getFullYear();
  const yw = y>=2000&&y<2100? "two thousand"+(y%100? " and "+tensWords(y%100):"") : String(y);
  return `${wd}, the ${ORD[d.getDate()]} of ${mo}, ${yw}`;
}
function planned(){ return S.plan.items.filter(i=>i.on).reduce((s,i)=>s+(i.agreed??i.alloc??0),0); }

/* Any throw in here used to leave #app blank with no route back. */
function render(){
  try{ renderApp(); }
  catch(e){ renderCrash(e); }
}

function renderCrash(err){
  console.error("render failed", err);
  const app = document.getElementById("app");
  if(!app) return;
  let href = "";
  try{ href = "data:application/json;charset=utf-8,"+encodeURIComponent(localStorage.getItem(STORE_KEY)||"{}"); }catch(e){}
  app.innerHTML = `
    <div id="phone"><div class="body" style="padding:34px 22px">
      <h2 style="font-family:Gloock,serif;font-size:26px;margin:0 0 10px">Something went wrong.</h2>
      <p style="color:var(--muted);line-height:1.6;margin:0">Your plan is safe — it's saved on this phone, not lost.
      Take a copy if you'd like one, then reload.</p>
      ${href? `<a href="${href}" download="my-big-day-plan.json" class="btn" style="display:block;text-align:center;margin-top:20px;text-decoration:none">Download my plan</a>`:""}
      <button class="btn" style="margin-top:10px;background:#fff;color:var(--ink);border:1.5px solid var(--line)" onclick="location.reload()">Reload the app</button>
      <p class="small" style="margin-top:20px;color:var(--muted)">If it keeps happening, send us that file and we'll put it right.</p>
      <pre class="small" style="white-space:pre-wrap;opacity:.5;margin-top:12px">${esc(String((err&&err.message)||err))}</pre>
    </div></div>`;
}

function renderApp(){
  if(!S.onboarded){ renderOB(); return; }
  if(!S.revealSeen){ renderReveal(); return; }   // survives a reload mid-reveal
  if(!S.plan) buildPlan();
  const t = S.tab;
  const nm = [S.ans.n1,S.ans.n2].filter(Boolean).join(" & ") || "Our wedding";
  const days = S.ans.dateISO ? Math.ceil((new Date(S.ans.dateISO) - new Date())/86400000) : null;
  const header = t==="home" ? "" : `<header class="app">
        <div class="names">${esc(nm)}</div>
        <div class="sub">${esc(dispName())}${pack2()? " + "+esc(pack2().shortName):""}${days!=null? " · "+(days>0? days+" days to go" : days===0? "It's today!" : "Married!") : ""}${S.unlocked?"":" · Free plan"}</div>
      </header>`;
  document.getElementById("app").innerHTML = `
    <div id="phone">
      ${header}
      <main id="main">${VIEWS[t]? VIEWS[t]() : VIEWS.home()}</main>
      ${t==="budget"? savebar() : ""}
      <nav id="tabbar">
        ${[["home","🏠","Home"],["budget","💷","Budget"],["guests","👥","Guests"],["list","✓","List"],["album","📸","Album"],["more","⋯","More"]].map(([k,i,l])=>
          `<button class="${t===k?"on":""}" style="position:relative" onclick="S.tab='${k}';save();render()"><span class="ico">${i}</span>${l}${k==="album"?'<span class="tabdot"></span>':''}</button>`).join("")}
      </nav>
    </div><div id="sheets"></div>`;
}

const VIEWS = {};

/* ----- HOME ----- */
VIEWS.home = function(){
  const pl = S.plan;
  const plan = planned();
  const paid = pl.items.filter(i=>i.on).reduce((s,i)=>s+(i.paid||0),0);
  const g = guestCount();
  const over = S.budgetTotal? plan - S.budgetTotal : 0;
  const nextTasks = pl.timeline.filter(t=>!t.done).slice(0,3);
  const dues = upcomingPayments().slice(0,3);
  const warns = pack().gotchas.slice(0,2);
  const whereBits = [S.ans.receptionMode==="known"? S.ans.receptionOther : "", S.ans.country? countryOf(S.ans.country)[1] : "", g? g+" of your favourite people":""].filter(Boolean);
  const dw = dateInWords();
  return `
  <div class="hero">
    <div class="eyebrow">Our Wedding</div>
    <div class="couple">${esc(S.ans.n1||"You")}<span class="amp">&</span>${esc(S.ans.n2||"Your love")}</div>
    ${dw? `<div class="when">${esc(dw)}</div>`:""}
    <div class="flourish"></div>
    ${whereBits.length? `<div class="where">${whereBits.map(esc).join(" &nbsp;·&nbsp; ")}</div>`:""}
  </div>
  <div class="statgrid">
    <div class="sc" style="border-top-color:#9BC0A6" onclick="askBudget()">
      <div class="em">💫</div><div class="lb">${S.budgetEstimated?"Sample budget":"Our budget"}</div>
      <div class="val" style="color:#5A7F66">${S.budgetTotal? fmt(S.budgetTotal):"Set it"}</div>
      ${S.budgetEstimated? `<div class="sub2">tap to make it yours</div>`:""}
    </div>
    <div class="sc" style="border-top-color:#DE9AAB">
      <div class="em">🌷</div><div class="lb">Planning to spend</div>
      <div class="val" style="color:#9C5A6C">${fmt(plan)}</div>
    </div>
    <div class="sc" style="border-top-color:${over>0?"#E0B368":"#9BC0A6"}">
      <div class="em">${over>0?"🎀":"🌿"}</div><div class="lb">${!S.budgetTotal? "Paid so far" : over>0? "A little over":"Room to play"}</div>
      <div class="val" style="color:${over>0?"#A66A3C":"#5A7F66"}">${!S.budgetTotal? fmt(paid) : fmt(Math.abs(over))}</div>
    </div>
    <div class="sc" style="border-top-color:#B4A0D4">
      <div class="em">🥂</div><div class="lb">Each guest</div>
      <div class="val" style="color:#6E5A90">${g? fmt(Math.round(plan/g)):"—"}</div>
      ${g? `<div class="sub2">${g} people</div>`:""}
    </div>
  </div>
  ${S.budgetTotal? (()=>{ const max = Math.max(plan, S.budgetTotal)*1.06;
    return `<div class="card"><h2 style="font-size:19px">How we're doing</h2>
    <div class="small" style="margin-top:2px">The soft line is your budget. Everything moves as the numbers move.</div>
    <div class="gbar"><span class="mark" style="left:${Math.min(98,Math.round(S.budgetTotal/max*100))}%"></span></div>
    <div class="gbar-labs"><span>${fmt(plan)} planned</span><span>${fmt(S.budgetTotal)} budget</span></div></div>`; })() : ""}
  ${plan>0? donutCard() : ""}
  ${dues.length? `<div class="card"><h3>Payments coming up</h3>${dues.map(d=>`<div class="row"><span style="font-size:13.5px">${esc(d.name)}<div class="small">${esc(d.label)} · due ${esc(d.due)}</div></span><span class="money">${fmt(d.amt)}</span></div>`).join("")}</div>`:""}
  <div class="card"><h3>Next up</h3>
    ${nextTasks.length? nextTasks.map(t=>`<div class="task ${t.done?"done":""}" onclick="tickTask('${t.id}')"><div class="tick">${t.done?"✓":""}</div><div><div class="tx">${esc(t.task)}</div><div class="meta">${esc(t.when)}${t.critical? " · critical":""}</div></div></div>`).join("") : `<div class="small">All caught up, superstar.</div>`}
    <button style="color:var(--rose);font-weight:600;margin-top:8px" onclick="S.tab='list';save();render()">Full checklist ›</button></div>
  ${warns.map(w=>`<div class="warn"><b>Worth knowing:</b> ${esc(w)}</div>`).join("")}
  <div class="card" style="background:linear-gradient(140deg,#FDF4F6,#fff)"><h3>📸 Wedding-day photo album</h3>
    <div class="small" style="margin:4px 0 10px">Guests scan a QR code and every photo lands in your album — then the best become a printed book.</div>
    <button class="btn sec" onclick="openPhotos()">Open the album tab</button></div>`;
};
function donutCard(){
  const bySec = {};
  S.plan.items.filter(i=>i.on).forEach(i=>{ bySec[i.section]=(bySec[i.section]||0)+(i.agreed??i.alloc??0); });
  const data = Object.entries(bySec).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const total = data.reduce((s,[,v])=>s+v,0); if(!total) return "";
  const R=62, C=2*Math.PI*R; let off=0;
  const segs = data.map(([sec,v])=>{ const dash=v/total*C;
    const el=`<circle r="${R}" cx="90" cy="90" fill="none" stroke="${secMeta(sec)[2]}" stroke-opacity=".55" stroke-width="34" stroke-dasharray="${dash.toFixed(2)} ${(C-dash).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 90 90)"/>`;
    off+=dash; return el; }).join("");
  return `<div class="card"><h2 style="font-size:19px">Where it's all going</h2>
  <div class="small" style="margin:2px 0 6px">${data.length} pieces make the whole day. Tap any to jump straight to it.</div>
  <div class="donutwrap">
    <svg viewBox="0 0 180 180" style="width:210px">${segs}
      <text x="90" y="87" text-anchor="middle" style="font-size:19px;font-weight:700;fill:#33262B">${fmt(total)}</text>
      <text x="90" y="105" text-anchor="middle" style="font-size:8.5px;letter-spacing:.2em;fill:#84717A">IN TOTAL</text></svg>
    <div class="dlegend">${data.map(([sec,v])=>`<div class="dl" onclick="jumpSec('${esc(sec)}')"><span class="dot" style="background:${secMeta(sec)[2]};opacity:.6"></span><span>${esc(sec)}</span><span class="amt" style="color:${secMeta(sec)[2]}">${fmt(v)}</span><span class="pc">${Math.round(v/total*100)}%</span></div>`).join("")}</div>
  </div></div>`;
}
function jumpSec(sec){ S.tab="budget"; save(); render();
  setTimeout(()=>{ const el=document.getElementById("sec-"+sec.replace(/[^a-z]+/gi,"-")); el&&el.scrollIntoView({behavior:"smooth",block:"start"}); },80); }

function upcomingPayments(){
  const out = [];
  S.plan.items.forEach(i=>{
    if(!i.on) return;
    if(i.dep && i.dep.amt && !i.dep.paid) out.push({name:i.name, label:"deposit", amt:i.dep.amt, due:i.dep.due||"no date", dueISO:i.dep.due||"9999"});
    if(i.agreed && i.balDue && (i.paid||0) < i.agreed) out.push({name:i.name, label:"balance", amt:i.agreed-(i.paid||0), due:i.balDue, dueISO:i.balDue});
  });
  return out.sort((a,b)=> a.dueISO<b.dueISO? -1:1);
}
function askBudget(){
  const v = prompt("Total budget ("+(CURSYM[S.cur]||"£")+"):", S.budgetTotal||"");
  if(v===null) return; const n = parseInt(String(v).replace(/[^\d]/g,""),10);
  if(n>0){ S.budgetTotal = n; S.budgetEstimated = false; reallocate(); render(); toast("Budget set — "+fmt(n)); }
}
function tickTask(id){ const t = S.plan.timeline.find(x=>x.id===id); if(t){ t.done=!t.done; save(); render(); } }

/* ----- BUDGET ----- */
function savebar(){
  const plan = planned();
  const over = S.budgetTotal? plan - S.budgetTotal : 0;
  return `<div class="savebar">
    <div><div class="tot">${fmt(plan)}</div>
      <div class="ovr" style="color:${over>0?"#A66A3C":"#5A7F66"}">${S.budgetTotal? (over>0? fmt(over)+" over budget" : fmt(-over)+" under budget") : "no budget set yet"}</div></div>
    <button class="fabplus" onclick="openAddSheet()">+</button>
    <button class="send" onclick="openExport()">${S.unlocked?"":"🔒 "}Share</button>
  </div>`;
}
VIEWS.budget = function(){
  const pl = S.plan, secs = {};
  pl.items.forEach(i=>{ (secs[i.section] = secs[i.section]||[]).push(i); });
  return `
  <div style="padding:20px 22px 4px">
    <h2 style="font-size:23px">Every lovely thing</h2>
    <div class="small" style="margin-top:4px">Tap any number and type. Tap the circle to take something out — tap again to put it back.${S.budgetEstimated? " These figures are your sample — react to them, don't obey them.":""}</div>
  </div>
  ${Object.entries(secs).map(([sec,items])=>{
    const [em,tint,deep] = secMeta(sec);
    const sOn = items.filter(i=>i.on);
    const sTot = sOn.reduce((s,i)=>s+(i.agreed??i.alloc??0),0);
    return `<div class="secpanel" id="sec-${sec.replace(/[^a-z]+/gi,"-")}" style="background:${tint}">
      <div class="shead"><span class="em">${em}</span><span class="nm">${esc(sec)}</span><span class="tot" style="color:${deep}">${fmt(sTot)}</span></div>
      ${items.map(i=>v20item(i,deep)).join("")}
    </div>`;
  }).join("")}
  <div style="height:70px"></div>`;
};
function v20item(i,deep){
  const dep = i.dep||{};
  const cat = i.supplierCategory||"";
  return `<div class="v20item" id="ir-${i.id}">
    <button class="tickc ${i.on?"":"off"}" onclick="toggleItem('${i.id}')">✓</button>
    <div class="bd">
      <div class="nm">${esc(i.name)}${i.custom?` <button style="color:var(--red);font-size:12px" onclick="deleteCustom('${i.id}')">remove</button>`:""}</div>
      ${i.note?`<div class="ds">${esc(i.note)}</div>`:""}
      ${i.on? `
      <div class="sup">${cat? esc(cat):""}${i.religious?`<span class="pill">tradition</span>`:""}<button class="qpill" onclick="openQuotes('${i.id}')">${(i.quotes||[]).length? (i.quotes.length===1?"1 quote":i.quotes.length+" quotes")+((i.docs||[]).length?" · 📎"+(i.docs.length):"")+" ›" : "+ quote"}</button>${cat? `<button class="lockpill" onclick="findMe('${esc(cat)}')">${S.unlocked?"":"🔒 "}find me ${esc(article(cat))} ›</button>`:""}</div>
      <div class="costwrap"><span class="curs">${CURSYM[S.cur]||"£"}</span>
        <input type="number" inputmode="numeric" value="${i.agreed??""}" placeholder="${i.alloc||"0"}" onchange="setItem('${i.id}','agreed',this.value)">
        ${i.alloc && i.agreed!=null && i.agreed!==i.alloc? `<span class="was">suggested ${fmt(i.alloc)}</span>` : i.alloc? `<span class="was">suggested</span>`:""}
      </div>
      <div class="minifields">
        <label>Paid so far<input type="number" inputmode="numeric" value="${i.paid||""}" onchange="setItem('${i.id}','paid',this.value)"></label>
        ${S.unlocked? `<label>Deposit<input type="number" inputmode="numeric" value="${dep.amt||""}" onchange="setDep('${i.id}','amt',this.value)"></label>
        <label>Deposit due<input type="date" value="${dep.due||""}" onchange="setDep('${i.id}','due',this.value)"></label>`:""}
      </div>
      ${S.unlocked? `<div class="minifields"><label>Balance due<input type="date" value="${i.balDue||""}" onchange="setItem('${i.id}','balDue',this.value)"></label>
        ${dep.amt? `<label style="display:flex;align-items:flex-end"><button class="chip ${dep.paid?"on":""}" style="margin:0" onclick="setDepPaid('${i.id}')">${dep.paid?"✓ Deposit paid":"Deposit paid?"}</button></label>`:"<label></label>"}</div>`
      : `<button class="lockline" onclick="openPaywall('Deposits, due dates & payment reminders')">🔒 Deposits, due dates & payment reminders — with the unlock</button>`}
      `:""}
    </div>
  </div>`;
}
function article(cat){ const c = cat.toLowerCase(); return (/^[aeiou]/.test(c)? "an ":"a ")+c; }
function toggleItem(id){ const i = S.plan.items.find(x=>x.id===id); i.on=!i.on; reallocate(); render();
  toast(i.on? "Back in — "+i.name : "Taken out — "+i.name); }
function setItem(id,k,v){ const i = S.plan.items.find(x=>x.id===id);
  i[k] = (k==="balDue")? v : (v===""? null : Math.max(0,parseInt(v,10)||0)); save(); render(); }
function setDep(id,k,v){ const i = S.plan.items.find(x=>x.id===id); i.dep = i.dep||{};
  i.dep[k] = (k==="due")? v : (v===""? null : Math.max(0,parseInt(v,10)||0)); save(); render(); }
function setDepPaid(id){ const i = S.plan.items.find(x=>x.id===id); i.dep.paid=!i.dep.paid;
  if(i.dep.paid) i.paid = (i.paid||0) + (i.dep.amt||0); save(); render(); }
function deleteCustom(id){ const i = S.plan.items.find(x=>x.id===id); if(!i||!i.custom) return;
  S.plan.items = S.plan.items.filter(x=>x.id!==id); save(); render(); toast("Removed — "+i.name); }

/* ----- ADD SHEET (v20 style) ----- */
let addType = "buy";
function openAddSheet(){
  addType = "buy";
  renderAddSheet();
}
function renderAddSheet(){
  const secs = Object.keys(SEC_META).filter(s=>s!==MINE);
  sheet(`<div class="addsheet">
    <h2>Add something of your own</h2>
    <div class="small" style="margin-top:4px">Something to pay for, or something we need to chase.</div>
    <div class="seg">
      <button class="${addType==="buy"?"on":""}" onclick="setAddType('buy')">🛍️ Something to buy</button>
      <button class="${addType==="do"?"on":""}" onclick="setAddType('do')">📋 Something to do</button>
    </div>
    ${addType==="buy"? `
    <div class="flab">What is it?</div>
    <input id="adName" placeholder="Sparklers for the send-off">
    <div class="flab">How much, roughly?</div>
    <input id="adCost" type="number" inputmode="numeric" placeholder="250">
    <div class="flab">Who's it with? (optional)</div>
    <input id="adWho" placeholder="Still looking">
    <div class="flab">Which part of the day?</div>
    <select id="adGrp">${secs.map(s=>`<option>${s}</option>`).join("")}<option value="${MINE}" selected>Somewhere else</option></select>
    ` : `
    <div class="flab">What needs doing?</div>
    <input id="tdName" placeholder="Ask the florist about arch flowers">
    <div class="flab">Whose court is it in?</div>
    <select id="tdWho"><option>Us</option><option>Venue</option><option>Suppliers</option><option>Family</option><option>${esc(cap(term("officiant")))}</option></select>
    <div class="flab">Any notes? (optional)</div>
    <input id="tdDesc" placeholder="">
    `}
    <div class="addrow">
      <button class="btn sec" onclick="closeSheet()">Not now</button>
      <button class="btn go" onclick="doAdd()">Add it</button>
    </div>
  </div>`);
  setTimeout(()=>{ const el = document.getElementById(addType==="buy"?"adName":"tdName"); el&&el.focus(); },200);
}
function setAddType(t){ addType = t; renderAddSheet(); }
function doAdd(){
  if(addType==="do"){
    const nm = (document.getElementById("tdName").value||"").trim();
    if(!nm){ toast("Give it a name first"); return; }
    S.customTodos = S.customTodos||[];
    if(S.customTodos.some(c=>c.name===nm)){ toast("That's already on the list"); return; }
    S.customTodos.push({id:uid(), name:nm, desc:(document.getElementById("tdDesc").value||"").trim(),
      who:(document.getElementById("tdWho")||{}).value||"Us", done:false});
    closeSheet(); save(); toast("Added to the list");
    S.tab="list"; render();
    return;
  }
  const customCount = S.plan.items.filter(i=>i.custom).length;
  if(!S.unlocked && customCount >= FREE_CUSTOM_CAP){ closeSheet(); openPaywall("Unlimited custom items"); return; }
  const nm = (document.getElementById("adName").value||"").trim();
  if(!nm){ toast("Give it a name first"); return; }
  if(S.plan.items.some(i=>i.name.toLowerCase()===nm.toLowerCase())){ toast("There's already one called that"); return; }
  const cost = Math.max(0, parseInt(document.getElementById("adCost").value,10)||0);
  const who = (document.getElementById("adWho").value||"").trim();
  const grp = document.getElementById("adGrp").value;
  S.plan.items.push({id:"c"+uid(), name:nm, section:grp, event:"", note: who? "With "+who+".":"", essential:false,
    unit:"fixed", supplierCategory:"", religious:false, share:0, on:true, custom:true,
    agreed: cost||null, paid:0, dep:null, alloc:0});
  closeSheet(); save(); render(); toast("Added — "+nm);
  setTimeout(()=>jumpSecStay(grp), 150);
}
function jumpSecStay(sec){ const el=document.getElementById("sec-"+sec.replace(/[^a-z]+/gi,"-")); el&&el.scrollIntoView({behavior:"smooth",block:"start"}); }

/* ----- GUESTS ----- */
VIEWS.guests = function(){
  const g = S.guests;
  const yes = g.filter(x=>x.rsvp==="yes"), no = g.filter(x=>x.rsvp==="no");
  const heads = g.reduce((n,x)=> n + (x.rsvp!=="no"? 1+(x.plus||0):0), 0);
  const diet = {}; g.forEach(x=>{ if(x.diet && x.rsvp!=="no") diet[x.diet]=(diet[x.diet]||0)+1+(x.plus||0); });
  return `
  <div class="stat3" style="margin-top:14px">
    <div class="card"><b>${heads}</b><span>expected heads</span></div>
    <div class="card"><b>${yes.length}</b><span>said yes</span></div>
    <div class="card"><b>${g.length-yes.length-no.length}</b><span>awaiting</span></div>
  </div>
  ${Object.keys(diet).length? `<div class="card"><h3>Dietary for the caterer</h3><div style="margin-top:6px">${Object.entries(diet).map(([k,v])=>`<span class="chip">${esc(k)} × ${v}</span>`).join("")}</div></div>`:""}
  <div class="card">
    <div style="display:flex;gap:8px;margin-bottom:4px">
      <button class="btn sec" style="padding:10px" onclick="addGuest()">+ Add guest</button>
      <button class="btn sec" style="padding:10px" onclick="openImport()">Paste a list</button>
    </div>
    <div class="small">Import from your phone contacts arrives with the app-store version.</div>
  </div>
  <div class="card">${g.length? g.map(x=>`
    <div class="grow">
      <span><span class="gname">${esc(x.name)}</span>${x.plus?` <span class="small">+${x.plus}</span>`:""}
        <div class="gmeta">${esc(x.side===1?(S.ans.n1||"Side A"):x.side===2?(S.ans.n2||"Side B"):"Shared")}${x.diet? " · "+esc(x.diet):""}</div></span>
      <span style="display:flex;gap:6px;align-items:center">
        <button class="rsvp ${x.rsvp}" onclick="cycleRSVP('${x.id}')">${x.rsvp==="yes"?"Yes":x.rsvp==="no"?"No":"?"}</button>
        <button class="small" onclick="editGuest('${x.id}')">edit</button></span>
    </div>`).join("") : `<div class="empty">No guests yet, darling. Add them one by one, or paste your whole list at once.</div>`}</div>`;
};
function addGuest(){
  const name = prompt("Guest name:"); if(!name) return;
  S.guests.push({id:uid(), name:name.trim(), side:0, rsvp:"pending", diet:"", plus:0});
  save(); render(); toast("Added — "+name.trim());
}
function editGuest(id){
  const x = S.guests.find(g=>g.id===id); if(!x) return;
  const diet = prompt("Dietary needs for "+x.name+" (blank for none):", x.diet||""); if(diet===null) return;
  const plus = prompt("Plus-ones with "+x.name+"? (0-5):", x.plus||0);
  const side = prompt("Whose side? 1 = "+(S.ans.n1||"partner 1")+", 2 = "+(S.ans.n2||"partner 2")+", 0 = shared:", x.side);
  x.diet = diet.trim(); x.plus = Math.min(5,Math.max(0,parseInt(plus,10)||0)); x.side = [0,1,2].includes(parseInt(side,10))? parseInt(side,10):0;
  save(); render();
}
function cycleRSVP(id){ const x = S.guests.find(g=>g.id===id);
  x.rsvp = x.rsvp==="pending"?"yes":x.rsvp==="yes"?"no":"pending"; save(); render(); }
function openImport(){
  sheet(`<div class="addsheet"><h2>Paste your guest list</h2>
  <p class="small" style="margin:6px 0 10px">One guest per line. Add a comma and any dietary need — e.g. <i>Maria Georgiou, vegetarian</i></p>
  <textarea id="imp" rows="8" placeholder="Andreas Nicola&#10;Maria Georgiou, vegetarian&#10;..."></textarea>
  <div class="addrow"><button class="btn sec" onclick="closeSheet()">Cancel</button>
  <button class="btn go" onclick="doImport()">Add guests</button></div></div>`);
}
function doImport(){
  const raw = document.getElementById("imp").value;
  let n=0;
  raw.split(/\n/).forEach(line=>{
    const [name, diet] = line.split(",").map(s=>s&&s.trim());
    if(name){ S.guests.push({id:uid(), name, side:0, rsvp:"pending", diet:diet||"", plus:0}); n++; }
  });
  closeSheet(); save(); render(); if(n) toast(n+" guests added");
}

/* ----- CHECKLIST ----- */
VIEWS.list = function(){
  const f = S.listFilter||"all";
  const tl = S.plan.timeline, pw = S.plan.paperwork, ct = S.customTodos||[];
  const done = tl.filter(t=>t.done).length + pw.filter(p=>p.done).length + ct.filter(c=>c.done).length;
  const total = tl.length + pw.length + ct.length;
  const groups = {};
  tl.forEach(t=>{ (groups[t.when] = groups[t.when]||[]).push(t); });
  return `
  <div class="card" style="margin-top:14px"><div style="display:flex;justify-content:space-between"><h3>Progress</h3><span class="small">${done} of ${total}</span></div>
    <div class="bar"><i style="width:${Math.round(done/total*100)||0}%"></i></div></div>
  <div style="margin:0 16px 12px">
    ${[["all","Everything"],["tasks","Tasks"],["paper","Paperwork"]].map(([k,l])=>`<button class="chip ${f===k?"on":""}" onclick="S.listFilter='${k}';save();render()">${l}</button>`).join("")}
  </div>
  ${ct.length && f!=="paper"? `<div class="sect"><h3>Your own list</h3><span class="small">${ct.filter(c=>c.done).length}/${ct.length}</span></div>
    <div class="card">${ct.map(c=>`<div class="task ${c.done?"done":""}" onclick="tickCustom('${c.id}')"><div class="tick">${c.done?"✓":""}</div>
      <div><div class="tx">${esc(c.name)}</div><div class="meta">${esc(c.who||"Us")}${c.desc?" · "+esc(c.desc):""}</div></div></div>`).join("")}</div>`:""}
  ${f!=="paper"? Object.entries(groups).map(([when,ts])=>`
    <div class="sect"><h3>${esc(when)}</h3><span class="small">${ts.filter(t=>t.done).length}/${ts.length}</span></div>
    <div class="card">${ts.map(t=>`<div class="task ${t.done?"done":""}" onclick="tickTask('${t.id}')"><div class="tick">${t.done?"✓":""}</div>
      <div><div class="tx">${esc(t.task)}</div>${t.critical?`<div class="meta">critical</div>`:""}</div></div>`).join("")}</div>`).join("") : ""}
  ${f!=="tasks"? `<div class="sect"><h3>Paperwork — the legal must-dos</h3></div>
    <div class="card">${pw.map(p=>`<div class="task ${p.done?"done":""}" onclick="tickPaper('${p.id}')"><div class="tick">${p.done?"✓":""}</div>
      <div><div class="tx">${esc(p.item)}</div><div class="meta">${esc(p.who)}${p.note? " · "+esc(p.note):""}</div></div></div>`).join("")}</div>`:""}`;
};
function tickPaper(id){ const p = S.plan.paperwork.find(x=>x.id===id); if(p){ p.done=!p.done; save(); render(); } }
function tickCustom(id){ const c = (S.customTodos||[]).find(x=>x.id===id); if(c){ c.done=!c.done; save(); render(); } }

/* ----- MORE ----- */
VIEWS.more = function(){
  const lockBadge = S.unlocked? "" : ` <span class="badge b-purple">${PRICE_LABEL}</span>`;
  return `
  <div class="sect" style="margin-top:16px"><h3>Your tradition</h3></div>
  <div class="card" onclick="openTraditions()" style="cursor:pointer"><h3>🕯️ Customs & what catches couples out</h3>
    <div class="small">${pack().customs.length + (pack2()? pack2().customs.length:0)} customs explained · ${pack().gotchas.length} warnings</div></div>
  <div class="sect"><h3>On the day</h3></div>
  <div class="card" onclick="openRunsheet()" style="cursor:pointer"><h3>📋 Run sheet${lockBadge}</h3><div class="small">Minute-by-minute schedule built from your occasions — print it for the photographer, DJ and family.</div></div>
  <div class="card" onclick="openSeating()" style="cursor:pointer"><h3>🪑 Seating planner${S.unlocked? "":` <span class="badge b-purple">${FREE_TABLE_CAP} tables free</span>`}</h3><div class="small">Tables, seats and dietary counts per table.</div></div>
  <div class="sect"><h3>Suppliers & sharing</h3></div>
  <div class="card" onclick="openSuppliers()" style="cursor:pointer"><h3>🔎 Supplier directory${lockBadge}</h3><div class="small">Find and enquire in your area, matched to your tradition.</div></div>
  <div class="card" onclick="openExport()" style="cursor:pointer"><h3>📄 Export${lockBadge}</h3><div class="small">Budget and plan as a printable summary for parents and planners.</div></div>
  <div class="card" onclick="openPartner()" style="cursor:pointer"><h3>💞 Partner sync${lockBadge}</h3><div class="small">Both phones, one plan.</div></div>
  <div class="sect"><h3>App</h3></div>
  ${S.unlocked? `<div class="card"><h3>✓ Everything unlocked</h3><div class="small">Thanks for supporting the app, darling.</div></div>`
    : `<div class="card" onclick="openPaywall()" style="cursor:pointer;background:linear-gradient(140deg,#F2EAF7,#fff)"><h3>Unlock everything — ${PRICE_LABEL}, once</h3><div class="small">No subscription. Yours forever.</div></div>`}
  <div class="card" onclick="restartOB()" style="cursor:pointer"><h3>↻ Change my answers</h3><div class="small">Re-run the questions — your guests, payments and ticks are kept where possible.</div></div>
  <div class="card" onclick="if(confirm('Really start completely fresh? Everything goes.')){localStorage.removeItem('weddingapp');location.reload();}" style="cursor:pointer"><h3 style="color:var(--red)">Start over</h3></div>
  <div class="small center" style="padding:10px 0 20px">My Big Day · prototype v0.24 · packs v1 · engine v1</div>`;
};
function restartOB(){ S.onboarded=false; obIx=0; S.plan=null; save(); render(); }

/* ----- sub-screens (sheets) ----- */
function sheet(html){ document.getElementById("sheets").innerHTML =
  `<div class="sheetwrap" onclick="if(event.target===this)closeSheet()"><div class="sheet">${html}</div></div>`; }
function closeSheet(){ document.getElementById("sheets").innerHTML=""; }

function openTraditions(){
  const p = pack(), p2 = pack2();
  sheet(`<h2>${esc(p.shortName)} customs</h2>
  ${p.customs.map(c=>`<div style="padding:10px 0;border-top:1px solid var(--line)"><b style="font-size:14px">${esc(c.name)}</b>${c.optional?` <span class="badge b-grey">optional</span>`:""}<div class="small" style="margin-top:2px">${esc(c.description)}</div></div>`).join("")}
  ${p2? `<h2 style="margin-top:18px">${esc(p2.shortName)} customs</h2>`+p2.customs.slice(0,12).map(c=>`<div style="padding:10px 0;border-top:1px solid var(--line)"><b style="font-size:14px">${esc(c.name)}</b><div class="small" style="margin-top:2px">${esc(c.description)}</div></div>`).join(""):""}
  <h2 style="margin-top:18px">What catches couples out</h2>
  ${p.gotchas.map(g=>`<div class="warn" style="margin:8px 0">${esc(g)}</div>`).join("")}
  <button class="btn sec" style="margin-top:10px" onclick="closeSheet()">Close</button>`);
}

function openRunsheet(){
  if(!S.unlocked){
    sheet(`<h2>Run sheet <span class="badge b-purple">preview</span></h2>
    <p class="small" style="margin:4px 0 12px">Built from your occasions. Unlock to edit times, add entries and print copies for your suppliers.</p>
    ${S.runsheet.map(r=>`<div class="rs"><div class="time"><b>${esc(r.time||"—")}</b></div><div class="what"><div class="nm">${esc(r.name)}</div><div class="small">${esc(r.when)}</div></div></div>`).join("")}
    <button class="btn rose" style="margin-top:14px" onclick="openPaywall('Run sheet editing & print')">Unlock everything — ${PRICE_LABEL}</button>
    <button class="btn sec" style="margin-top:8px" onclick="closeSheet()">Close</button>`);
    return;
  }
  sheet(`<h2>Run sheet</h2>
  <p class="small" style="margin:4px 0 12px">Times are suggestions — adjust to your day. Print gives you a clean copy per supplier.</p>
  <div class="printarea">${S.runsheet.map(r=>`
    <div class="rs"><div class="time"><input value="${esc(r.time)}" onchange="rsSet('${r.id}','time',this.value)"></div>
    <div class="what"><div class="nm">${esc(r.name)}</div><div class="small">${esc(r.when)}</div>
    <input style="margin-top:5px" value="${esc(r.note||"")}" placeholder="note for suppliers" onchange="rsSet('${r.id}','note',this.value)"></div>
    <button onclick="rsDel('${r.id}')" style="color:var(--red)">✕</button></div>`).join("")}</div>
  <div style="display:flex;gap:10px;margin-top:14px">
    <button class="btn sec" onclick="rsAdd()">+ Add entry</button>
    <button class="btn" onclick="window.print()">Print</button></div>
  <button class="btn sec" style="margin-top:8px" onclick="closeSheet()">Close</button>`);
}
function rsSet(id,k,v){ const r = S.runsheet.find(x=>x.id===id); r[k]=v; save(); }
function rsDel(id){ S.runsheet = S.runsheet.filter(x=>x.id!==id); save(); openRunsheet(); }
function rsAdd(){ const name = prompt("What happens?"); if(!name) return;
  S.runsheet.push({id:uid(), name, when:"Wedding day", time:"", note:"", track:"Everyone"}); save(); openRunsheet(); }

function openSeating(){
  const unassigned = S.guests.filter(g=>g.rsvp!=="no" && !S.tables.some(t=>t.g.includes(g.id)));
  sheet(`<h2>Seating planner</h2>
  <p class="small" style="margin:4px 0 12px">${S.unlocked? "Add tables, then tap guests into them." : `Two tables free — the unlock removes the limit (${PRICE_LABEL}, once).`}</p>
  ${S.tables.map(t=>{
    const members = t.g.map(id=>S.guests.find(g=>g.id===id)).filter(Boolean);
    const diet = members.filter(m=>m.diet).length;
    return `<div class="tbl" style="margin:0 0 10px"><div class="head"><b>${esc(t.name)}</b><span class="small">${members.reduce((n,m)=>n+1+(m.plus||0),0)}/${t.cap} seats${diet? " · "+diet+" dietary":""}</span></div>
    <div>${members.map(m=>`<span class="seat" onclick="unseat('${t.id}','${m.id}')">${esc(m.name)}${m.plus?" +"+m.plus:""} ✕</span>`).join("")||'<span class="small">Empty</span>'}</div>
    ${unassigned.length? `<div style="margin-top:8px"><select onchange="seatGuest('${t.id}',this.value)"><option value="">Seat a guest…</option>${unassigned.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></div>`:""}
    </div>`;}).join("")}
  <button class="btn sec" onclick="addTable()">+ Add table</button>
  ${unassigned.length? `<p class="small" style="margin-top:10px">${unassigned.length} guest${unassigned.length>1?"s":""} not seated yet.</p>`:""}
  <button class="btn sec" style="margin-top:8px" onclick="closeSheet()">Close</button>`);
}
function addTable(){
  if(!S.unlocked && S.tables.length >= FREE_TABLE_CAP){ openPaywall("Unlimited tables"); return; }
  const name = prompt("Table name:", "Table "+(S.tables.length+1)); if(!name) return;
  const cap = parseInt(prompt("Seats at this table:", "10"),10)||10;
  S.tables.push({id:uid(), name, cap, g:[]}); save(); openSeating();
}
function seatGuest(tid, gid){ if(!gid) return; const t = S.tables.find(x=>x.id===tid);
  t.g.push(gid); save(); openSeating(); }
function unseat(tid, gid){ const t = S.tables.find(x=>x.id===tid);
  t.g = t.g.filter(x=>x!==gid); save(); openSeating(); }

/* ----- ALBUM (tab) ----- */
function openPhotos(){ S.tab="album"; save(); render(); }
VIEWS.album = function(){
  S.photos = S.photos||[]; S.albumCode = S.albumCode || (Math.random().toString(36).slice(2,8).toUpperCase());
  const live = !!S.cloud;
  const url = live ? API_BASE+"/album/"+S.cloud.id : "https://ourwedding.app/album/"+S.albumCode;
  const qr = makeQR(url);
  return `
  <div style="padding:20px 22px 4px">
    <h2 style="font-size:23px">Every photo, yours</h2>
    <div class="small" style="margin-top:4px">Print this code on the tables. Guests scan it — no app, no sign-up — and everything they shoot lands here while you're still dancing.</div>
  </div>
  <div class="card center" style="margin-top:12px;padding:18px">
    ${qr}
    <div class="small" style="margin-top:8px">${esc(url)}</div>
    ${live? `<div class="badge b-green" style="margin-top:8px">LIVE — scan it right now and try</div>`
      : S.unlocked? `<div class="small" style="margin-top:6px">Turn on cloud sync (More → Partner sync) and this code goes live for real guest uploads.</div>`
      : `<button class="lockline" style="margin-top:10px" onclick="openPaywall('Guest QR photo uploads')">🔒 Live guest uploads are part of the unlock</button>`}
  </div>
  <div class="sect"><h3>Your photos (${S.photos.length}${S.unlocked?"":"/"+FREE_CUSTOM_CAP+" free"})</h3></div>
  <div class="card">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${S.photos.map((p,ix)=>`<img src="${p}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px" onclick="if(confirm('Remove this photo?')){S.photos.splice(${ix},1);save();render();}">`).join("")}
      <label style="display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:1.5px dashed var(--line);border-radius:8px;font-size:22px;color:var(--muted);cursor:pointer">+<input type="file" accept="image/*" multiple style="display:none" onchange="addPhotos(this.files)"></label>
    </div>
  </div>
  <div class="card" style="background:linear-gradient(140deg,#FDF4F6,#fff)"><h3>📖 Your photo book</h3>
    <div class="small" style="margin:4px 0 10px">After the day, choose your favourites and we lay them out as a printed book, delivered to your door. Coming after launch.</div>
    <button class="btn sec" onclick="toast('On the list — your album will be ready for it.')">Join the waiting list</button></div>`;
};
function addPhotos(files){
  const room = S.unlocked? 99 : FREE_CUSTOM_CAP - S.photos.length;
  if(room<=0){ openPaywall("Unlimited photos"); return; }
  [...files].slice(0,room).forEach(f=>{
    const img = new Image(); const rd = new FileReader();
    rd.onload = e=>{ img.onload = ()=>{
      const c = document.createElement("canvas"); const k = Math.min(1, 480/Math.max(img.width,img.height));
      c.width = img.width*k; c.height = img.height*k;
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      S.photos.push(c.toDataURL("image/jpeg",0.7)); save(); render();
    }; img.src = e.target.result; };
    rd.readAsDataURL(f);
  });
}
function makeQR(text){
  try{ const q = qrcode(0,"M"); q.addData(text); q.make();
    return q.createSvgTag({cellSize:4, margin:2}); }
  catch(e){ return `<div class="small">[QR: ${esc(text)}]</div>`; }
}

/* ----- QUOTES & DOCUMENT SCAN ----- */
function openQuotes(id){
  const i = S.plan.items.find(x=>x.id===id); if(!i) return;
  const qs = i.quotes||[], docs = i.docs||[];
  sheet(`<div class="addsheet">
    <h2 style="font-size:21px">${esc(i.name)}</h2>
    <div class="small" style="margin-top:2px">Collect quotes, pick your winner, keep the paperwork — all in one place.</div>
    <div class="flab" style="margin-top:16px">Quotes${qs.length? " ("+qs.length+")":""}</div>
    ${qs.length? qs.map(q=>`<div class="quoterow">
      <div class="bd"><div class="who">${esc(q.who)}</div>${q.note?`<div class="nt">${esc(q.note)}</div>`:""}</div>
      <div style="text-align:right"><div class="amt">${fmt(q.amt)}</div>
        <button class="usebtn ${q.chosen?"on":""}" onclick="useQuote('${i.id}','${q.id}')">${q.chosen?"✓ Using":"Use this"}</button>
        <button style="color:var(--red);font-size:12px;margin-left:4px" onclick="delQuote('${i.id}','${q.id}')">✕</button></div>
    </div>`).join("") : `<div class="small" style="padding:6px 0 2px">Nothing in yet — add the first quote below, or scan one straight in.</div>`}
    <div class="flab" style="margin-top:14px">Add a quote</div>
    <input id="qWho" placeholder="Who's it from?">
    <div style="display:flex;gap:8px;margin-top:8px">
      <input id="qAmt" type="number" inputmode="numeric" placeholder="Amount" style="flex:1">
      <button class="btn go" style="flex:none;width:auto;padding:12px 18px;border-radius:16px;background:#9BC0A6;color:#fff;font-weight:700" onclick="addQuote('${i.id}')">Add</button>
    </div>
    <div class="flab" style="margin-top:16px">Documents${docs.length? " ("+docs.length+")":""}</div>
    ${docs.map(d=>`<div class="docrow">📎 <span style="flex:1">${esc(d.name)}</span>
      ${d.img?`<button style="color:var(--rose);font-weight:600" onclick="viewDoc('${i.id}','${d.id}')">view</button>`:""}
      <button style="color:var(--red)" onclick="delDoc('${i.id}','${d.id}')">✕</button></div>`).join("")}
    <label class="btn sec" style="margin-top:10px;display:block;text-align:center">${S.unlocked? "📷 Scan a quote or invoice" : `🔒 Scan a quote or invoice — with the unlock`}
      ${S.unlocked? `<input type="file" accept="image/*,.pdf" style="display:none" onchange="scanFile('${i.id}', this.files)">`:""}</label>
    ${S.unlocked? "" : `<div class="small center" style="margin-top:6px" onclick="openPaywall('Scan quotes & invoices')">Upload a photo of any quote, invoice or receipt and it files itself into the budget, the payments and the list.</div>`}
    <button class="btn sec" style="margin-top:14px" onclick="closeSheet();render()">Done</button>
  </div>`);
  if(!S.unlocked){ const lab = document.querySelector('.addsheet label.btn');
    lab && lab.addEventListener('click', ()=>openPaywall('Scan quotes & invoices')); }
}
function addQuote(id){
  const i = S.plan.items.find(x=>x.id===id);
  const who = (document.getElementById("qWho").value||"").trim();
  const amt = Math.max(0, parseInt(document.getElementById("qAmt").value,10)||0);
  if(!who && !amt){ toast("Give me a name or a number, darling"); return; }
  i.quotes = i.quotes||[];
  i.quotes.push({id:uid(), who:who||"Unnamed quote", amt, note:"", chosen:false});
  save(); openQuotes(id); toast("Quote in — "+(who||fmt(amt)));
}
function useQuote(id,qid){
  const i = S.plan.items.find(x=>x.id===id);
  (i.quotes||[]).forEach(q=>{ q.chosen = q.id===qid; if(q.chosen){ i.agreed = q.amt; } });
  save(); openQuotes(id); toast("Agreed price set — "+fmt(i.agreed));
}
function delQuote(id,qid){
  const i = S.plan.items.find(x=>x.id===id);
  i.quotes = (i.quotes||[]).filter(q=>q.id!==qid);
  save(); openQuotes(id);
}
function delDoc(id,did){
  const i = S.plan.items.find(x=>x.id===id);
  i.docs = (i.docs||[]).filter(d=>d.id!==did);
  save(); openQuotes(id);
}
function viewDoc(id,did){
  const i = S.plan.items.find(x=>x.id===id);
  const d = (i.docs||[]).find(x=>x.id===did);
  if(!d) return;
  if(d.sample || !d.img){ toast("Sample document — scan your own to replace it"); return; }
  sheet(`<img src="${d.img}" style="width:100%;border-radius:14px"><button class="btn sec" style="margin-top:12px" onclick="openQuotes('${id}')">Back</button>`);
}
let _scanTmp = null;
function scanFile(id, files){
  const f = files && files[0]; if(!f) return;
  const digits = (f.name.match(/\d{2,6}/)||[])[0];
  const finish = async (img)=>{ _scanTmp = {name:f.name, img};
    let ext = null;
    if(img && S.cloud){
      toast("Reading it for you, darling…");
      ext = await aiScan(id, img.split(",")[1], "image/jpeg");
    }
    scanConfirm(id, ext? (ext.amount||"") : (digits? parseInt(digits,10):""), ext); };
  if(/^image\//.test(f.type)){
    const rd = new FileReader(); const im = new Image();
    rd.onload = e=>{ im.onload = ()=>{
      const c = document.createElement("canvas"); const k = Math.min(1, 900/Math.max(im.width,im.height));
      c.width = im.width*k; c.height = im.height*k;
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      finish(c.toDataURL("image/jpeg",0.72)); }; im.src = e.target.result; };
    rd.readAsDataURL(f);
  } else finish(null);
}
function scanConfirm(id, guessAmt, ext){
  const i = S.plan.items.find(x=>x.id===id);
  const typeMap = {"quote":"quote","deposit-invoice":"dep","balance-invoice":"bal","receipt":"rec"};
  const selType = ext && typeMap[ext.type] || "quote";
  sheet(`<div class="addsheet">
    <h2 style="font-size:21px">${ext? "Read it — check my work" : "Filed — now tell me what it is"}</h2>
    <div class="small" style="margin-top:2px">${ext? "I've read the document and filled everything in — glance over it and I'll file the numbers where they belong."+(ext.summary? " It looks like: <i>"+esc(ext.summary)+"</i>":"") : "I've kept the document with <b>"+esc(i.name)+"</b>. Confirm the details and I'll put the numbers where they belong."+(S.cloud? "" : " Turn on cloud sync and I'll read documents for you automatically.")}</div>
    <div class="flab" style="margin-top:14px">Who's it from?</div>
    <input id="scWho" placeholder="The supplier" value="${ext&&ext.supplier? esc(ext.supplier):""}">
    <div class="flab">Amount</div>
    <input id="scAmt" type="number" inputmode="numeric" value="${guessAmt||""}" placeholder="0">
    <div class="flab">What is it?</div>
    <select id="scType">${[["quote","A quote"],["dep","Deposit invoice"],["bal","Balance invoice"],["rec","Receipt — already paid"]].map(([v,l])=>`<option value="${v}" ${v===selType?"selected":""}>${l}</option>`).join("")}</select>
    <div class="flab">Due date (if any)</div>
    <input id="scDue" type="date" value="${ext&&ext.dueDate? esc(ext.dueDate):""}">
    <div style="display:flex;align-items:center;gap:8px;margin-top:12px" onclick="this.querySelector('input').checked=!this.querySelector('input').checked;event.stopPropagation()">
      <input type="checkbox" id="scRem" checked style="width:auto" onclick="event.stopPropagation()"><span style="font-size:13.5px">Pop a reminder on the list before it's due</span></div>
    <div class="addrow">
      <button class="btn sec" onclick="openQuotes('${id}')">Cancel</button>
      <button class="btn go" onclick="saveScan('${id}')">File it</button>
    </div>
  </div>`);
}
function saveScan(id){
  const i = S.plan.items.find(x=>x.id===id);
  const who = (document.getElementById("scWho").value||"").trim() || "Supplier";
  const amt = Math.max(0, parseInt(document.getElementById("scAmt").value,10)||0);
  const type = document.getElementById("scType").value;
  const due = document.getElementById("scDue").value;
  const rem = document.getElementById("scRem").checked;
  i.docs = i.docs||[];
  i.docs.push({id:uid(), name:_scanTmp? _scanTmp.name : "document", img:_scanTmp? _scanTmp.img : null});
  if(type==="quote" && amt){ i.quotes = i.quotes||[]; i.quotes.push({id:uid(), who, amt, note:"From a scanned quote", chosen:false}); }
  if(type==="dep"){ i.dep = {amt:amt||null, due:due||null, paid:false}; }
  if(type==="bal"){ if(amt) i.agreed = amt; if(due) i.balDue = due; }
  if(type==="rec" && amt){ i.paid = (i.paid||0) + amt; }
  if(rem && due){ S.customTodos = S.customTodos||[];
    S.customTodos.push({id:uid(), name:"Pay "+who+(amt?" — "+fmt(amt):""), who:"Us", desc:"due "+due+" · "+i.name, done:false}); }
  _scanTmp = null;
  save(); openQuotes(id); toast("Filed — everything's where it belongs");
}

/* ----- suppliers / export / partner / paywall ----- */
/* Same search parameters everywhere — the geographic answer supplies the where. */
const CAT_SEARCH = {
 "Church":"church", "Synagogue":"synagogue", "Mosque":"mosque", "Temple":"Hindu temple",
 "Gurdwara":"gurdwara", "Officiant":"wedding officiant", "Celebrant":"wedding celebrant",
 "Register office":"register office", "Florist":"wedding florist", "Photographer":"wedding photographer",
 "Videographer":"wedding videographer", "Caterer":"wedding caterer", "Venue":"wedding venue",
 "DJ":"wedding DJ", "Band":"wedding band", "Musicians":"wedding musicians",
 "Cake maker":"wedding cake maker", "Stationer":"wedding stationery", "Transport":"wedding car hire",
 "Marquee hire":"marquee hire", "Event services":"event hire services", "Jeweller":"jeweller wedding rings",
 "Bridal boutique":"bridal shop", "Tailor":"wedding suit hire", "Stylist":"bridal hair and makeup",
 "Decorator":"wedding decorator", "Planner":"wedding planner"
};
function searchWhere(){
  const c = countryOf(S.ans.country||"GB")[1];
  return (S.ans.city? S.ans.city+", " : "") + c;
}
function searchTermFor(cat){
  if(CAT_SEARCH[cat]) return CAT_SEARCH[cat];
  const c = cat.toLowerCase();
  if(/church|synagogue|mosque|temple|gurdwara|mandir|parish|registr/.test(c)) return c;
  return (/wedding|marquee|event|bridal/.test(c)? c : "wedding "+c);
}
function findMe(cat){
  if(!S.unlocked){ openPaywall("Find me "+article(cat)); return; }
  const term = searchTermFor(cat), where = searchWhere();
  const url = "https://www.google.com/maps/search/"+encodeURIComponent(term+" near "+where);
  sheet(`<div class="addsheet"><h2 style="font-size:21px">Find me ${esc(article(cat))}</h2>
  <p class="small" style="margin:6px 0 4px">Searching for <b>${esc(term)}</b> near <b>${esc(where)}</b> — same search, wherever in the world your wedding is.</p>
  ${S.ans.city? "" : `<p class="small" style="margin:4px 0">Add your town in Settings and I'll search tighter than the whole country, darling.</p>`}
  <a class="btn rose" style="margin-top:12px;text-decoration:none" href="${url}" target="_blank" rel="noopener">Open the search</a>
  <p class="small" style="margin-top:10px">In-app results with ratings and one-tap enquiries arrive with cloud accounts — same search, no leaving the app.</p>
  <button class="btn sec" style="margin-top:8px" onclick="closeSheet()">Close</button></div>`);
}
function openSuppliers(){
  if(!S.unlocked){ openPaywall("Supplier directory & enquiries"); return; }
  const cats = [...new Set(S.plan.items.filter(i=>i.on&&i.supplierCategory).map(i=>i.supplierCategory))];
  sheet(`<h2>Suppliers</h2>
  <p class="small" style="margin:4px 0 12px">Every category your wedding actually needs, searched near <b>${esc(searchWhere())}</b>.</p>
  ${cats.map(c=>`<div class="row"><span style="font-size:14px">${esc(c)}</span>
    <a style="color:var(--rose);font-weight:700;font-size:13px;text-decoration:none" href="https://www.google.com/maps/search/${encodeURIComponent(searchTermFor(c)+" near "+searchWhere())}" target="_blank" rel="noopener">search ›</a></div>`).join("")}
  <button class="btn sec" style="margin-top:12px" onclick="closeSheet()">Close</button>`);
}
function openExport(){
  if(!S.unlocked){ openPaywall("PDF & print export"); return; }
  const on = S.plan.items.filter(i=>i.on);
  sheet(`<div class="printarea"><h2>${esc([S.ans.n1,S.ans.n2].filter(Boolean).join(" & "))} — wedding plan</h2>
  <p class="small">${esc(dispName())} · ${S.ans.dateISO? new Date(S.ans.dateISO).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"date TBC"} · ${guestCount()} guests</p>
  ${on.map(i=>`<div class="row"><span style="font-size:13px">${esc(i.name)}</span><span class="money" style="font-size:13px">${fmt(i.agreed??i.alloc)}</span></div>`).join("")}
  <div class="row" style="border-top:2px solid var(--ink)"><b>Total</b><b class="money">${fmt(on.reduce((s,i)=>s+(i.agreed??i.alloc??0),0))}</b></div></div>
  <div style="display:flex;gap:10px;margin-top:14px"><button class="btn sec" onclick="closeSheet()">Close</button>
  <button class="btn" onclick="window.print()">Print / save as PDF</button></div>`);
}
/* openPartner is defined in the CLOUD section below */
function openPaywall(hint){
  sheet(`<h2>The full fantasy — once, ${PRICE_LABEL}</h2>
  ${hint? `<p class="small" style="margin-top:4px">You tapped: <b>${esc(hint)}</b> — it's included, darling.</p>`:""}
  <div class="paylist">
    ${["“Find me a…” supplier matching & enquiries","Scan quotes & invoices straight into the plan","Deposits, due dates & payment reminders","Run sheet editing & printing","Unlimited seating tables","Guest QR photo uploads & unlimited photos","PDF & print export","Partner sync — both phones, one plan","Unlimited custom budget items"].map(f=>`<div><span class="pi">✓</span><span>${f}</span></div>`).join("")}
  </div>
  <div class="price">${PRICE_LABEL}</div>
  <div class="small center" style="margin-bottom:14px">One payment. No subscription. Yours forever.</div>
  <button class="btn rose" onclick="S.unlocked=true;save();closeSheet();render();toast('Everything unlocked — enjoy, darlings')">Unlock (simulated in this prototype)</button>
  <button class="btn sec" style="margin-top:8px" onclick="closeSheet()">Not now</button>
  <div class="small center" style="margin-top:10px"><u>Restore purchase</u></div>`);
}

/* ---------- CLOUD (Cloudflare Worker backend) ---------- */
const API_BASE = (function(){ try{ return localStorage.getItem("weddingapi") || "https://wedding-app-api.nicknicola182.workers.dev"; }catch(e){ return "https://wedding-app-api.nicknicola182.workers.dev"; } })();
let _pushTimer = null, _lastPush = 0;
async function api(path, opts={}){
  const headers = Object.assign({"Content-Type":"application/json"}, opts.headers||{});
  if(S.cloud) headers["Authorization"] = "Bearer "+S.cloud.id+":"+S.cloud.token;
  const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), opts.timeout||8000);
  try{
    const r = await fetch(API_BASE+path, Object.assign({}, opts, {headers, signal:ctrl.signal}));
    clearTimeout(t);
    return {ok:r.ok, status:r.status, body: await r.json().catch(()=>null)};
  }catch(e){ clearTimeout(t); return {ok:false, status:0, body:null}; }
}
function cloudPayload(){ const c = Object.assign({}, S); delete c.photos; return c; }
function schedulePush(){
  if(!S.cloud) return;
  clearTimeout(_pushTimer);
  _pushTimer = setTimeout(async ()=>{
    S._pushedAt = Date.now();
    const r = await api("/api/plan", {method:"PUT", body: JSON.stringify({data: cloudPayload(), device: navigator.platform||"web"})});
    if(r.ok) _lastPush = Date.now();
  }, 1500);
}
const _save0 = save;
save = function(){ _save0(); schedulePush(); };
async function enableCloud(){
  const names = [S.ans.n1,S.ans.n2].filter(Boolean).join(" & ");
  const r = await api("/api/couple", {method:"POST", body: JSON.stringify({names})});
  if(!r.ok || !r.body || !r.body.id){ toast("Can't reach the cloud right now — try again in a moment"); return false; }
  S.cloud = {id:r.body.id, token:r.body.token, pair:r.body.pairCode};
  _save0(); schedulePush(); return true;
}
async function joinWithCode(code){
  const r = await api("/api/pair", {method:"POST", body: JSON.stringify({code})});
  if(!r.ok || !r.body || !r.body.id){ toast(r.body && r.body.error || "That code didn't work, darling"); return; }
  S.cloud = {id:r.body.id, token:r.body.token, pair:String(code).toUpperCase().trim()};
  const plan = await api("/api/plan");
  if(plan.ok && plan.body && plan.body.data){
    const keepPhotos = S.photos||[];
    S = Object.assign(plan.body.data, {photos:keepPhotos});
    S.cloud = {id:r.body.id, token:r.body.token, pair:String(code).toUpperCase().trim()};
  }
  _save0(); closeSheet(); render(); toast("You're in — one plan, both phones 💞");
}
async function cloudPullOnBoot(){
  if(!S.cloud) return;
  const r = await api("/api/plan", {timeout:5000});
  if(r.ok && r.body && r.body.data && r.body.updatedAt){
    const remote = r.body.data;
    if((remote._pushedAt||0) > (S._pushedAt||0)){
      const keepPhotos = S.photos||[], cloud = S.cloud;
      S = Object.assign(remote, {photos:keepPhotos, cloud});
      _save0(); render();
    }
  }
}
function openPartner(){
  if(!S.unlocked){ openPaywall("Partner sync"); return; }
  const status = S.cloud
    ? `<div class="card" style="margin:14px 0;background:var(--green-bg)"><h3>✓ Cloud sync is on</h3>
       <div class="small" style="margin-top:4px">Your pairing code — your partner taps “I have a code” on their phone and types it in:</div>
       <div class="price" style="letter-spacing:.2em">${esc(S.cloud.pair||"—")}</div></div>`
    : `<button class="btn rose" style="margin:14px 0" onclick="enableCloud().then(ok=>{if(ok){openPartner();toast('Cloud sync on — plan safely backed up')}})">Turn on cloud sync & get our code</button>`;
  sheet(`<div class="addsheet"><h2>Partner sync</h2>
  <p class="small" style="margin-top:4px">One plan, both phones, every change everywhere. Backed up in the cloud while we're at it.</p>
  ${status}
  <div class="flab">I have a code</div>
  <input id="pairIn" placeholder="e.g. 55Z6UW" style="text-transform:uppercase">
  <div class="addrow">
    <button class="btn sec" onclick="closeSheet()">Close</button>
    <button class="btn go" onclick="joinWithCode(document.getElementById('pairIn').value)">Join our plan</button>
  </div></div>`);
}
async function aiScan(itemId, base64, mediaType){
  if(!S.cloud) return null;
  const r = await api("/api/scan", {method:"POST", timeout:25000, body: JSON.stringify({image:base64, mediaType})});
  return (r.ok && r.body && r.body.extracted) ? r.body.extracted : null;
}
/* ---------- boot ---------- */
load();
render();
if(S && S.cloud) cloudPullOnBoot();
