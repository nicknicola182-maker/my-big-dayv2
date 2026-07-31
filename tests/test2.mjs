import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page = await browser.newPage({viewport:{width:400,height:800}});
const errors = [];
page.on('pageerror', e=>errors.push("PAGEERROR: "+e.message));
page.on('console', m=>{ if(m.type()==='error') errors.push("CONSOLE: "+m.text()); });
await page.goto('file:///home/claude/wedding-app/dist/index.html');
await page.waitForTimeout(300);
// Hindu, skip most things
await page.fill('#n1','Priya'); await page.fill('#n2','Raj'); await page.click('text=Continue');
await page.click('.opt:has-text("Hindu")'); await page.click('text=Continue');
await page.click('.opt:has-text("Gujarati")'); await page.click('text=Continue');
await page.selectOption('#csel','GB'); await page.click('text=Continue');     // wedding country
await page.click('text=Skip for now');                                        // home
await page.click('text=Skip for now');                                        // date
await page.click('.opt:has-text("Large —")'); await page.click('text=Continue'); // guests
await page.click('text=Skip for now');                                        // budget skipped
await page.click('text=Skip for now');                                        // ceremony
await page.click('text=Skip for now');                                        // reception
await page.screenshot({path:'shots/20-hindu-events.png'});                    // events (multi-day)
await page.click('text=Continue');
await page.click('text=Skip for now');                                        // priorities
await page.click('text=Skip for now');                                        // style
await page.click('text=Maybe later');
await page.waitForTimeout(300);
await page.click('text=Open my plan');
await page.waitForTimeout(300);
await page.screenshot({path:'shots/21-hindu-home-nobudget.png'});
const st = await page.evaluate(()=>({events:S.plan.events.map(e=>e.name), items:S.plan.items.length,
  alloc:S.plan.items.filter(i=>i.on).reduce((s,i)=>s+i.alloc,0), budget:S.budgetTotal,
  timelineWhen:S.plan.timeline[0].when, runsheet:S.runsheet.length}));
console.log(JSON.stringify(st,null,1));
// mixed traditions path
await page.evaluate(()=>{localStorage.removeItem('weddingapp')});
await page.reload(); await page.waitForTimeout(300);
await page.fill('#n1','Sara'); await page.fill('#n2','Tom'); await page.click('text=Continue');
await page.click('.opt:has-text("blending two traditions")'); await page.click('text=Continue');
await page.click('#ob .body >> .opt:has-text("Jewish")'); // lead
await page.waitForTimeout(150);
const civ = await page.$$('.opt:has-text("Civil / Non-religious")'); await civ[1].click(); // second
await page.waitForTimeout(150);
await page.screenshot({path:'shots/22-mixed.png'});
await page.click('text=Continue');
const mixed = await page.evaluate(()=>({p1:S.ans.packId,p2:S.ans.packId2}));
console.log("mixed:", JSON.stringify(mixed));
console.log("ERRORS:", errors.length? errors.join("\n") : "none");
await browser.close();
