import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL='http://127.0.0.1:8098/index.html';
const b=await chromium.launch();
let fail=0; const ok=(n,c,d='')=>{ console.log((c?'  ok   ':'  FAIL ')+n+(d?' :: '+d:'')); if(!c)fail++; };

// ---- language round trips, every direction, headlines included
{
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(2200);
  const read=()=>p.evaluate(()=>({
    lang:document.documentElement.lang,
    title:document.title,
    desc:document.querySelector('meta[name=description]').content.slice(0,50),
    hero:document.querySelector('.hero h1').textContent.replace(/\s+/g,' ').trim(),
    chain:document.querySelector('#chain h2').textContent.replace(/\s+/g,' ').trim(),
    nav:document.querySelector('.nav a').textContent.trim(),
    spec:document.querySelector('.spec td').textContent.trim(),
    ph:document.querySelector('#f-name').placeholder,
    dupLines:document.querySelectorAll('.sline').length
  }));
  const langs=['en','fr','es']; const seen={};
  for(const a of langs){ for(const c of langs){ if(a===c) continue;
    await p.click(`.lang button[data-lang="${a}"]`); await p.waitForTimeout(450);
    await p.click(`.lang button[data-lang="${c}"]`); await p.waitForTimeout(450);
    const r=await read(); seen[c]=r;
    ok(`switch ${a} to ${c}`, r.lang===c && r.hero.length>10 && !/undefined|null/.test(r.hero), r.hero.slice(0,44));
  }}
  ok('headlines differ across languages',
     new Set([seen.en.hero,seen.fr.hero,seen.es.hero]).size===3);
  ok('titles and meta follow the language',
     new Set([seen.en.title,seen.fr.title,seen.es.title]).size===3 &&
     new Set([seen.en.desc,seen.fr.desc,seen.es.desc]).size===3);
  ok('nav, spec cells and placeholders follow',
     new Set([seen.en.nav,seen.fr.nav,seen.es.nav]).size===3 &&
     new Set([seen.en.spec,seen.fr.spec,seen.es.spec]).size===3 &&
     new Set([seen.en.ph,seen.fr.ph,seen.es.ph]).size===3);
  await p.click('.lang button[data-lang="en"]'); await p.waitForTimeout(500);
  const back=await read();
  ok('returns cleanly to English', back.hero==='The metal we sell is metal we made.', back.hero);
  ok('split lines do not accumulate', back.dupLines>0 && back.dupLines<60, String(back.dupLines));
  ok('no script errors during switching', errs.length===0, errs.join(' | '));
  await p.close();
}

// ---- JavaScript disabled
{
  const ctx=await b.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
    const vis=el=>{const s=getComputedStyle(el);const b=el.getBoundingClientRect();
      return s.opacity!=='0'&&s.display!=='none'&&s.visibility!=='hidden'&&b.height>0;};
    const anims=[...document.querySelectorAll('.anim')];
    return {sections:document.querySelectorAll('section').length,
      hiddenAnims:anims.filter(e=>!vis(e)).length, totalAnims:anims.length,
      heroText:document.querySelector('.hero h1').textContent.replace(/\s+/g,' ').trim(),
      specRows:document.querySelectorAll('.spec tbody tr').length,
      words:document.body.innerText.trim().split(/\s+/).length};
  });
  ok('JS off: every section renders', r.sections>=9, String(r.sections));
  ok('JS off: no content hidden by motion gates', r.hiddenAnims===0, `${r.hiddenAnims}/${r.totalAnims} hidden`);
  ok('JS off: headline and spec table readable', r.heroText.length>20 && r.specRows===8);
  ok('JS off: full copy present', r.words>700, r.words+' words');
  await ctx.close();
}

// ---- viewport extremes, video files absent throughout
for (const w of [390,1920]) {
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1800);
  const h=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=800){await p.evaluate(v=>window.scrollTo(0,v),y);await p.waitForTimeout(90);}
  await p.waitForTimeout(600);
  const r=await p.evaluate(()=>({
    ox:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    body:document.body.className,
    fallback:getComputedStyle(document.querySelector('.hero-fallback')).display,
    overflowing:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+2)
      .slice(0,4).map(e=>e.className||e.tagName)
  }));
  ok(`${w}px: no horizontal scroll`, r.ox===0, 'overflow '+r.ox+' '+JSON.stringify(r.overflowing));
  ok(`${w}px: video absent, coded fallback shown`, r.body.includes('no-video')&&r.fallback!=='none', r.body);
  await p.screenshot({path:`acc-${w}.png`, fullPage:w===390?false:false});
  await p.close();
}

// ---- keyboard and focus
{
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);
  const seq=[];
  for(let i=0;i<12;i++){ await p.keyboard.press('Tab');
    seq.push(await p.evaluate(()=>{const a=document.activeElement;
      const s=getComputedStyle(a); return {tag:a.tagName, outline:s.outlineStyle+' '+s.outlineWidth};}));
  }
  ok('tab reaches interactive elements', seq.filter(s=>['A','BUTTON','INPUT','SELECT','TEXTAREA'].includes(s.tag)).length>=10);
  ok('focus ring is visible', seq.every(s=>s.outline!=='none 0px'), JSON.stringify(seq[1]));
  await p.close();
}
await b.close();
console.log(fail? `\n${fail} FAILURES` : '\nAll runtime checks pass.');
process.exit(fail?1:0);
