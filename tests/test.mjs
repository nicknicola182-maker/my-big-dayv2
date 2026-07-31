import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page = await browser.newPage({viewport:{width:400,height:800}});
const errors = [];
page.on('pageerror', e=>errors.push("PAGEERROR: "+e.message));
page.on('console', m=>{ if(m.type()==='error') errors.push("CONSOLE: "+m.text()); });
await page.goto('file:///home/claude/wedding-app/dist/index.html');
await page.waitForTimeout(400);

const shot = (n)=>page.screenshot({path:`shots/${n}.png`});
await shot('01-onboarding-names');

// Q1 names
await page.fill('#n1','Andreas'); await page.fill('#n2','Paulina');
await page.click('text=Continue');
// Q2 tradition
await shot('02-tradition');
await page.click('text=Greek Orthodox');
await page.click('text=Continue');
// Q3 variant
await page.click('text=Greek / Cypriot'); await page.click('text=Continue');
// Q4 country -> Cyprus
await page.selectOption('#csel','CY'); await page.click('text=Continue');
// Q5 home -> GB
await page.selectOption('#csel','GB'); await page.click('text=Continue');
// Q6 date
await page.fill('#wdate','2027-06-12'); await page.click('text=Continue');
// Q7 guests
await shot('03-guests');
await page.click('.opt:has-text("Typical —")'); await page.click('text=Continue');
// Q8 budget
await shot('04-budget');
const opts = await page.$$('.opt');
await opts[2].click(); await page.click('text=Continue');
// Q9 ceremony
await page.click('text=Our own church'); await page.click('text=Continue');
// Q10 reception
await page.click('text=Hotel'); await page.click('text=Continue');
// Q11 events
await shot('05-events');
await page.click('text=Continue');
// Q12 priorities
await page.click('text=Food & drink'); await page.click('text=Photography & film'); await page.click('text=Continue');
// Q13 style
await page.click('text=Traditional'); await page.click('text=Continue');
// Q14 partner
await shot('06-partner');
await page.click('text=Maybe later');
await page.waitForTimeout(300);
await shot('07-reveal');
await page.click('text=Open my plan');
await page.waitForTimeout(300);
await shot('08-home');

// budget tab
await page.click('#tabbar >> text=Budget');
await page.waitForTimeout(200);
const firstAcc = await page.$('.acc .head'); await firstAcc.click();
await page.waitForTimeout(200);
await shot('09-budget');

// guests: import
await page.click('#tabbar >> text=Guests');
await page.click('text=Paste a list');
await page.fill('#imp','Maria Georgiou, vegetarian\nCostas Nicola\nEleni Papa, gluten free');
await page.click('text=Add guests');
await page.waitForTimeout(200);
await shot('10-guests');

// checklist
await page.click('#tabbar >> text=Checklist');
await page.waitForTimeout(200);
await shot('11-checklist');

// more: runsheet preview (locked)
await page.click('#tabbar >> text=More');
await page.waitForTimeout(200);
await shot('12-more');
await page.click('text=Run sheet');
await page.waitForTimeout(200);
await shot('13-runsheet-locked');
// unlock via paywall
await page.click('.sheet >> text=Unlock everything');
await page.waitForTimeout(200);
await shot('14-paywall');
await page.click('text=Unlock (simulated in this prototype)');
await page.waitForTimeout(200);
// photos + QR
await page.click('text=Photo album & guest QR');
await page.waitForTimeout(300);
await shot('15-photos-qr');
await page.click('button:has-text("Close")');
// seating
await page.click('text=Seating planner');
await page.waitForTimeout(200);
page.on('dialog', d=>d.accept('Table 1'));
await shot('16-seating');

// state checks
const state = await page.evaluate(()=>({
  items: S.plan.items.length, on: S.plan.items.filter(i=>i.on).length,
  alloc: S.plan.items.filter(i=>i.on).reduce((s,i)=>s+i.alloc,0),
  budget: S.budgetTotal, cur: S.cur, guests: S.guests.length,
  timeline: S.plan.timeline.length, paperwork: S.plan.paperwork.length,
  events: S.plan.events.length, runsheet: S.runsheet.length, unlocked: S.unlocked
}));
console.log("STATE:", JSON.stringify(state,null,1));
console.log("ERRORS:", errors.length? errors.join("\n") : "none");
await browser.close();
