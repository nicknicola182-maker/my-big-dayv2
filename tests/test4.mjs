import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page = await browser.newPage({viewport:{width:400,height:820}});
const errors = [];
page.on('pageerror', e=>errors.push("PAGEERROR: "+e.message));
page.on('console', m=>{ if(m.type()==='error') errors.push("CONSOLE: "+m.text()); });
await page.goto('file:///home/claude/wedding-app/dist/index.html');
await page.waitForTimeout(500);
await page.click("text=Let's begin, my loves");
await page.fill('#n1','Nick'); await page.fill('#n2','Paulina'); await page.click('text=Continue');
await page.click('.opt:has-text("Yes — a religious")'); await page.click('text=Continue');
await page.click('.opt:has-text("Christian")'); await page.click('text=Continue');
await page.click('.opt:has-text("Orthodox")'); await page.click('text=Continue');
await page.click('.opt:has-text("Greek / Cypriot")'); await page.click('text=Continue');
await page.selectOption('#csel','CY'); await page.click('text=Continue');
await page.click('text=Skip for now');
await page.fill('#wdate','2027-09-18'); await page.click('text=Continue');
await page.screenshot({path:'shots/40-guest-ranges.png'});
await page.click('.opt:has-text("151 – 300")'); await page.click('text=Continue');
await page.screenshot({path:'shots/41-budget-ranges.png'});
// don't know -> estimate
await page.click('.opt:has-text("I honestly don")'); await page.click('text=Continue');
await page.click('.opt:has-text("Our own church")'); await page.click('text=Continue');
await page.click('.opt:has-text("Help me choose")'); await page.click('.chip:has-text("Marquee")'); await page.click('text=Continue');
await page.click('text=Continue'); // events
await page.click('text=Skip for now'); // priorities
await page.click('text=Skip for now'); // style
await page.click('text=Just me for now');
await page.waitForTimeout(300);
await page.screenshot({path:'shots/42-reveal-sample.png'});
const st = await page.evaluate(()=>({guests:S.ans.guests, budget:S.budgetTotal, est:S.budgetEstimated, cur:S.cur}));
console.log(JSON.stringify(st));
await page.click('text=Show me my wedding');
await page.waitForTimeout(300);
await page.screenshot({path:'shots/43-home-sample.png'});
console.log("ERRORS:", errors.length? errors.join("\n") : "none");
await browser.close();
