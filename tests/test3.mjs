import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page = await browser.newPage({viewport:{width:400,height:820}});
const errors = [];
page.on('pageerror', e=>errors.push("PAGEERROR: "+e.message));
page.on('console', m=>{ if(m.type()==='error') errors.push("CONSOLE: "+m.text()); });
await page.goto('file:///home/claude/wedding-app/dist/index.html');
await page.waitForTimeout(600);
const shot = n=>page.screenshot({path:`shots/${n}.png`});
await shot('30-landing');
await page.click('text=Let\'s begin, my loves');
await page.waitForTimeout(300);
await shot('31-names');
await page.fill('#n1','Nick'); await page.fill('#n2','Paulina');
await page.click('text=Continue');
await shot('32-gate');
// religious yes
await page.click('.opt:has-text("Yes — a religious")'); await page.click('text=Continue');
await shot('33-picker');
await page.click(".opt:has-text(\"Christian\")"); await page.click("text=Continue"); await page.click(".opt:has-text(\"Orthodox\")"); await page.click("text=Continue");
await page.click('.opt:has-text("Greek / Cypriot")'); await page.click('text=Continue');
await page.selectOption('#csel','CY'); await page.click('text=Continue');
await page.click('text=Skip for now'); // home
await page.fill('#wdate','2027-09-18'); await page.click('text=Continue');
await shot('34-guests');
// manual guest entry 250
await page.fill('#gexact','250'); await page.click('text=Continue');
await shot('35-budget');
// budget range 3rd
const opts = await page.$$('.opt');
await opts[2].click(); await page.click('text=Continue');
await page.click('.opt:has-text("Our own church")'); await page.click('text=Continue');
await shot('36-reception');
await page.click(".opt:has-text(\"I've got the place\")");
await page.fill('#rother','Ktima Oasis Limassol');
await page.click('text=Continue');
await page.click('text=Continue'); // events defaults
await page.click('text=Food & drink'); await page.click('text=Photography & film'); await page.click('text=Continue');
await page.click('.opt:has-text("Glamorous")'); await page.click('text=Continue');
await page.click('text=Just me for now');
await page.waitForTimeout(300);
await shot('37-reveal');
await page.click('text=Show me my wedding');
await page.waitForTimeout(300);
await shot('38-home');
// budget tab: check lockline + findme
await page.click('#tabbar >> text=Budget');
await page.waitForTimeout(200);
// sections always open now
await page.waitForTimeout(200);
await shot('39-budget-locked');
const st = await page.evaluate(()=>({
  guests:S.ans.guests, budget:S.budgetTotal, cur:S.cur, reception:S.ans.reception,
  items:S.plan.items.length, on:S.plan.items.filter(i=>i.on).length,
  alloc:S.plan.items.filter(i=>i.on).reduce((s,i)=>s+i.alloc,0),
  lock: !!document.querySelector('.lockline'), findme: !!document.querySelector('.lockpill')
}));
console.log(JSON.stringify(st));
// civil fast path
await page.evaluate(()=>localStorage.removeItem('weddingapp'));
await page.reload(); await page.waitForTimeout(500);
await page.click('text=Let\'s begin, my loves');
await page.click('text=Continue'); // blank names ok
await page.click('.opt:has-text("No — we")'); await page.click('text=Continue');
const q = await page.evaluate(()=>document.querySelector('.qtitle').textContent);
console.log("after gate-no next Q:", q);
const st2 = await page.evaluate(()=>({pack:S.ans.packId, steps:document.querySelector('#ob .small').textContent}));
console.log(JSON.stringify(st2));
console.log("ERRORS:", errors.length? errors.join("\n") : "none");
await browser.close();
