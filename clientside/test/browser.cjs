const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.A3_BASE_URL||'http://localhost:4201';
const output=path.resolve(process.env.A3_BROWSER_OUTPUT||path.join(__dirname,'../../tmp/browser'));fs.mkdirSync(output,{recursive:true});
const guest='Browser Verification '+Date.now();
const results=[];const email=`browser.${Date.now()}@example.invalid`;
async function check(name,run){await run();results.push({name,status:'passed'});console.log('PASS',name);}
async function main(){
 const browser=await chromium.launch({headless:true,channel:process.env.A3_BROWSER_CHANNEL||'msedge'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try {
  await check('Home displays 10 database-backed public events and all illustrations load',async()=>{
   await page.goto(base);await page.getByRole('heading',{name:'Neighbourhood Lantern Walk'}).waitFor();assert.equal(await page.locator('event-card').count(),10);
   await page.locator('img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));
   await page.screenshot({path:path.join(output,'home-desktop.png'),fullPage:true});
  });
  await check('Distinct real photographs and public author/source credits are present',async()=>{
   const paths=await page.locator('event-card img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
   assert(paths.every(p=>/^assets\/photos\/.+\.jpg$/.test(p)));assert.equal(new Set(paths).size,10);
   await page.getByRole('link',{name:'Photo credits & sources',exact:true}).click();await page.getByRole('heading',{name:'Photo credits & sources',exact:true}).waitFor();assert.equal(await page.locator('article').count(),13);
   await page.locator('img').evaluateAll(images=>images.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));
   await page.goto(base);await page.getByRole('heading',{name:'Neighbourhood Lantern Walk'}).waitFor();
  });
  await check('Photo load failure shows a local illustration fallback',async()=>{
   await context.route('**/assets/photos/lantern-walk.jpg',route=>route.abort());await page.goto(base+'/#/events/1');
   await page.waitForFunction(()=>{const img=document.querySelector('.detail-image');return img&&img.getAttribute('src')==='assets/community.svg'&&img.complete&&img.naturalWidth>0});
   assert.equal(await page.locator('.detail-image').getAttribute('alt'),'Community illustration; photograph unavailable');
   await context.unroute('**/assets/photos/lantern-walk.jpg');await page.goto(base);await page.getByRole('heading',{name:'Neighbourhood Lantern Walk'}).waitFor();
  });
  await check('Combined filters, clear filters and no-result recovery',async()=>{
   await page.getByRole('link',{name:'Find an event',exact:true}).click();await page.getByLabel('Date',{exact:true}).fill('2026-10-23');await page.getByLabel('Location',{exact:true}).fill('Sydney');await page.getByLabel('Category',{exact:true}).selectOption('1');await page.getByRole('button',{name:'Find events'}).click();await page.getByText('1 events found',{exact:true}).waitFor();assert.equal(await page.locator('event-card').count(),1);
   await page.reload();await page.getByText('1 events found',{exact:true}).waitFor();assert.equal(await page.getByLabel('Location',{exact:true}).inputValue(),'Sydney');
   await page.getByRole('button',{name:'Clear filters'}).click();await page.getByText('10 events found',{exact:true}).waitFor();assert.equal(await page.getByLabel('Location',{exact:true}).inputValue(),'');
   await page.getByLabel('Location',{exact:true}).fill('A place that does not exist');await page.getByRole('button',{name:'Find events'}).click();await page.getByRole('heading',{name:'No events match just yet.'}).waitFor();
   await page.getByRole('button',{name:'Show all events'}).click();await page.getByText('10 events found',{exact:true}).waitFor();
  });
  await check('Selected event details and registration form validation',async()=>{
   await page.goto(base+'/#/events/1');await page.getByRole('heading',{name:'Neighbourhood Lantern Walk'}).waitFor();await page.getByRole('link',{name:'Register for this event'}).click();await page.getByRole('button',{name:'Confirm registration'}).click();await page.getByText('Please correct the highlighted fields.').waitFor();
   await page.getByLabel('Full name',{exact:true}).fill(guest);await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Phone number',{exact:true}).fill('0400000000');await page.getByLabel('Number of tickets',{exact:true}).fill('2');
   await page.screenshot({path:path.join(output,'registration-desktop.png'),fullPage:true});
  });
  await check('Registration submission persists and returns to the event registration list',async()=>{
   await page.getByRole('button',{name:'Confirm registration'}).click();await page.getByRole('heading',{name:'You’re on the list.'}).waitFor();await page.getByRole('link',{name:'See your registration'}).click();await page.getByRole('cell',{name:guest,exact:true}).waitFor();
   assert.equal(await page.locator('tbody tr').first().locator('td').first().innerText(),guest);
  });
  await check('Duplicate registration gives useful feedback and preserves input',async()=>{
   await page.goto(base+'/#/register/1');await page.getByLabel('Full name',{exact:true}).fill(guest);await page.getByLabel('Email address',{exact:true}).fill(email.toUpperCase());await page.getByLabel('Phone number',{exact:true}).fill('0400000000');await page.getByRole('button',{name:'Confirm registration'}).click();await page.getByText('This email is already registered for this event.').waitFor();assert.equal(await page.getByLabel('Full name',{exact:true}).inputValue(),guest);
  });
  await check('Invalid, suspended and past event states',async()=>{
   await page.goto(base+'/#/events/abc');await page.getByText('A valid positive event ID is required.').waitFor();
   await page.goto(base+'/#/events/11');await page.getByRole('alert').filter({hasText:'Event not found.'}).waitFor();
   await page.goto(base+'/#/events/12');await page.getByText('Registration is closed for this event.').waitFor();assert.equal(await page.getByRole('link',{name:'Register for this event'}).count(),0);
  });
  await check('Network failure shows an error and retry recovers',async()=>{
   await context.route('**/api/events*',route=>route.abort());await page.goto(base+'/#/search');await page.getByText('The service is unavailable. Please try again.').waitFor();await context.unroute('**/api/events*');await page.getByRole('button',{name:'Try again'}).click();await page.getByText('10 events found',{exact:true}).waitFor();
  });
  await check('Mobile layout, detail and registration do not overflow horizontally',async()=>{
   await page.setViewportSize({width:390,height:844});
   for(const route of ['/','/#/search','/#/events/1','/#/register/1']){
    await page.goto(base+route);await page.waitForLoadState('networkidle');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route+' overflows');
   }
   await page.screenshot({path:path.join(output,'registration-mobile.png'),fullPage:true});
   await page.goto(base);await page.getByRole('heading',{name:'Neighbourhood Lantern Walk'}).waitFor();await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));await page.screenshot({path:path.join(output,'home-mobile.png'),fullPage:true});
  });
  await check('Keyboard skip navigation and runtime errors',async()=>{
   await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').innerText(),'Skip to content');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main');assert.deepEqual(errors,[]);
  });
  if(process.env.AXE_PATH){await check('Automated accessibility scan has no serious or critical violations',async()=>{
   await page.setViewportSize({width:1440,height:1000});
   for(const route of ['/','/#/search','/#/events/1','/#/register/1']){await page.goto(base+route);await page.waitForLoadState('networkidle');await page.addScriptTag({path:process.env.AXE_PATH});const result=await page.evaluate(()=>window.axe.run());const violations=result.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],route);}
  });}
 } finally {
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({date:new Date().toISOString(),base,email,channel:process.env.A3_BROWSER_CHANNEL||'msedge',results,errors},null,2));await browser.close();
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});

