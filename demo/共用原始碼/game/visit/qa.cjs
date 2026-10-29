const {chromium}=require('C:/Users/YOUTH259/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('靶場見習日-導覽展示版.html')).href);
 await page.waitForSelector('body[data-ready="true"]',{timeout:20000});await page.locator('#restartButton').click();await page.waitForTimeout(1500);
 await page.screenshot({path:'靶場見習日-導覽展示版-實機.png'});
 await page.locator('#overviewButton').click();await page.waitForTimeout(1800);await page.screenshot({path:'靶場見習日-導覽展示版-近景.png'});await page.locator('#overviewButton').click();
 await page.locator('#steps button[data-station="safety"]').click();
 await page.waitForSelector('#eventDialog[open]',{timeout:20000});await page.screenshot({path:'靶場見習日-導覽展示版-RPG.png'});
 await page.locator('#eventFooter button').click();await page.locator('#eventChoices button').nth(1).click();
 if(!await page.locator('#eventFeedback').textContent())throw Error('Wrong-answer feedback missing');
 await page.locator('#eventChoices button').nth(0).click();await page.locator('#eventFooter button').click();await page.locator('#eventFooter button').click();
 for(const [station,answers] of [['map',[1,2]],['waiting',[0]]]){
   await page.locator(`#steps button[data-station="${station}"]`).click();await page.waitForSelector('#eventDialog[open]',{timeout:20000});await page.locator('#eventFooter button').click();
   for(const answer of answers){await page.locator('#eventChoices button').nth(answer).click();await page.locator('#eventFooter button').click()}
   await page.locator('#eventFooter button').click();
 }
 await page.waitForSelector('#notebook[open]');if(await page.locator('.note-card.saved').count()!==3)throw Error('Incomplete notebook');
 await page.screenshot({path:'靶場見習日-導覽展示版-手冊.png'});
 await page.reload();await page.waitForSelector('body[data-ready="true"]');if(await page.locator('#progressText').textContent()!=='3 / 3')throw Error('Progress not saved');
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForSelector('body[data-ready="true"]');await page.waitForTimeout(800);await page.screenshot({path:'tmp/靶場見習日-手機.png'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: scene renders, wrong answers can retry, all three stations reachable, notebook complete, saved progress survives reload, mobile screenshot saved.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
