function validateSourceCatalog(value,origin="https://cmwi896qj006o01mibk3t5qq5.wuiltstore.com"){
  if(!Array.isArray(value)||!value.length||value.length>5000)throw new Error('catalog_missing');
  const seen=new Set();
  return value.map(p=>{
    if(!p||typeof p.n!=='string'||!p.n.trim()||typeof p.u!=='string'||typeof p.p!=='number'||!Number.isFinite(p.p)||p.p<0)throw new Error('catalog_invalid');
    const url=new globalThis.URL(p.u);if(url.origin!==origin||!url.pathname.startsWith('/ar/product/'))throw new Error('catalog_foreign');
    if(seen.has(url.href))throw new Error('catalog_duplicate');seen.add(url.href);
    if(p.i&&new globalThis.URL(p.i).protocol!=='https:')throw new Error('catalog_image');
    return {n:p.n,u:url.href,i:typeof p.i==='string'?p.i:'',p:p.p,o:typeof p.o==='string'?p.o:'',d:typeof p.d==='string'?p.d:''};
  });
}
function readSourceCatalog(srcdoc,origin){
  const match=String(srcdoc||'').match(/\bconst catalog\s*=\s*(\[[^\r\n]*\]);\s*(?:\r?\n|$)/);
  if(!match)throw new Error('catalog_source_missing');
  return validateSourceCatalog(JSON.parse(match[1]),origin);
}
function readPublicCatalog(html,origin,parseCatalog){
  if(typeof html!=='string'||html.length>5000000)throw new Error('catalog_public_markup_invalid');
  const decode=text=>text.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi,(entity,key)=>{const named={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'};if(key[0]==='#'){const n=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):parseInt(key.slice(1),10);return n>=0&&n<=0x10ffff?String.fromCodePoint(n):entity;}return named[key.toLowerCase()]||entity;});
  function fromMarkup(markup){
    if(!markup.includes('q8-helper-host'))return null;
    const tag=markup.match(/<iframe\b[^>]*\bsrcdoc=("|')([\s\S]*?)\1/i);
    if(!tag)return null;try{return parseCatalog(decode(tag[2]),origin);}catch{return null;}
  }
  const direct=fromMarkup(html);if(direct)return direct;
  // The public homepage may serialize CMS HTML inside JSON strings. Parse only
  // those strings containing our widget; never evaluate or execute returned code.
  for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
    if(!script[1].includes('q8-helper-host')||!script[1].includes('srcdoc='))continue;
    let layer=[script[1]];
    for(let depth=0;depth<4&&layer.length;depth++){
      const next=[];
      for(const text of layer){
        const found=fromMarkup(text);if(found)return found;
        for(const literal of text.matchAll(/"(?:\\[\s\S]|[^"\\])*"/g)){
          let value;try{value=JSON.parse(literal[0]);}catch{continue;}
          if(typeof value==='string'&&value.includes('q8-helper-host')&&value.includes('srcdoc='))next.push(value);
        }
      }
      layer=next;
    }
  }
  throw new Error('catalog_public_markup_missing');
}
async function installQ8GlobalWidget(config,wire){
  if(window.top!==window||new globalThis.URLSearchParams(location.search).has('__q8CatalogSource'))return false;
  if(window.__q8GlobalState==='loading'||window.__q8GlobalState==='ready')return false;
  window.__q8GlobalState='loading';
  const cacheKey='q8.catalog.snapshot.v1';
  const fromDocument=doc=>{const frame=doc.querySelector('.q8-helper-host iframe');return frame?readSourceCatalog(frame.getAttribute('srcdoc'),location.origin):null;};
  function remember(items){try{sessionStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),items}));}catch{}}
  async function getCatalog(){
    const current=fromDocument(document);if(current){remember(current);return current;}
    try{const cached=JSON.parse(sessionStorage.getItem(cacheKey));if(cached&&Date.now()-cached.at<1800000&&Date.now()>=cached.at)return validateSourceCatalog(cached.items,location.origin);}catch{}
    const home=new globalThis.URL(config.home,location.origin);
    if(home.origin!==location.origin)throw new Error('catalog_source_origin');
    const response=await fetch(home.href,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('catalog_source_unavailable');
    const items=readPublicCatalog(await response.text(),location.origin,readSourceCatalog);
    remember(items);return items;
  }
  try{
    const catalog=await getCatalog();
    const template=document.createElement('template');template.innerHTML=config.markup;
    const host=template.content.querySelector('.q8-helper-host'),frame=host?.querySelector('iframe');
    if(!host||!frame)throw new Error('widget_template_invalid');
    frame.onload=()=>{if(frame.dataset.q8Wired)return;frame.dataset.q8Wired='1';wire(frame);};
    frame.srcdoc=config.framePrefix+JSON.stringify(catalog).replaceAll('<','\\u003c')+config.frameSuffix;
    const oldHosts=[...document.querySelectorAll('.q8-helper-host')];
    // Build and validate the replacement before removing the previous widget.
    oldHosts.forEach(old=>old.remove());document.body.append(template.content);
    const hideDuplicates=()=>{
      document.querySelectorAll('.q8-helper-host').forEach(old=>{if(old!==host)old.remove();});
      document.querySelectorAll('.q8-help-launch').forEach(link=>link.style.setProperty('display','none','important'));
    };
    hideDuplicates();
    const observer=new MutationObserver(hideDuplicates);observer.observe(document.documentElement,{childList:true,subtree:true});
    window.__q8GlobalState='ready';return true;
  }catch(error){
    window.__q8GlobalFailure=String(error?.message||'widget_unavailable').slice(0,100);
    window.__q8GlobalState='failed';
    // Keep the original helper or its homepage link available if the source cannot load.
    return false;
  }
}
installQ8GlobalWidget({"home":"/ar","markup":"<style>.q8-assistant-dock{display:flex;align-items:center;flex:none;max-width:140px;margin-inline:8px;direction:rtl}\n.q8-assistant-dock[hidden]{display:none!important}\n.q8-assistant-dock .q8-widget-launch{position:static!important;inset:auto!important;transform:none!important;display:flex!important;align-items:center;padding:8px 10px!important;border:1px solid #bae6fd;border-radius:30px!important;background:linear-gradient(110deg,#0369a1,#0054e6)!important;box-shadow:0 2px 6px #0369a120;max-width:140px}\n.q8-assistant-dock .q8-widget-launch>a{display:flex;align-items:center;gap:5px;color:#fff!important;text-decoration:none;font:700 11px Alexandria,Tahoma,sans-serif}\n.q8-assistant-dock .q8-widget-launch small{display:none!important}\n.q8-assistant-dock .q8-widget-launch>a:before{display:none!important}\n.q8-assistant-dock #q8-bubble-grip,.q8-assistant-dock [data-q8-hide]{display:none!important}\n.q8-product-intro{padding:12px 14px;margin-bottom:16px;border:1px solid #bae6fd;border-radius:14px;background:#f0f9ff;direction:rtl;max-width:100%;box-sizing:border-box}\n.q8-product-intro p{font:500 12px/1.9 Alexandria,Tahoma,sans-serif;color:#075985;margin:0 0 8px;overflow-wrap:anywhere}\n.q8-product-intro button{font:700 11px Alexandria,Tahoma,sans-serif;border:0;border-radius:8px;padding:9px 12px;background:#0369a1;color:white;cursor:pointer}\n@media(max-width:767px){.q8-assistant-dock{margin-inline:4px;max-width:42px}.q8-assistant-dock .q8-widget-launch{padding:8px!important;width:38px;min-height:38px;justify-content:center;box-sizing:border-box}.q8-assistant-dock .q8-widget-launch>a>span:last-child{display:none!important}.q8-assistant-dock .q8-widget-launch>a>span:first-child{font-size:21px}}\n</style><style>/* Stable, discoverable launcher across the whole storefront. */\n.q8-helper-host .q8-widget-launch{position:fixed!important;top:12px!important;left:12px!important;right:auto!important;bottom:auto!important;z-index:5000;display:flex!important;align-items:center;gap:8px;padding:10px 14px!important;border:1px solid #ffffff40;border-radius:999px!important;background:linear-gradient(110deg,#0369a1,#0054e6)!important;box-shadow:0 5px 20px #0369a140;max-width:calc(100vw - 24px)}\n.q8-helper-host .q8-widget-launch>a{display:flex;align-items:center;gap:8px;color:#fff!important;text-decoration:none;font:700 12px Alexandria,Tahoma,sans-serif;cursor:pointer!important;touch-action:manipulation!important}.q8-widget-launch small{display:block;font-size:9px;margin-top:4px;color:#e0f2fe}.q8-widget-launch>a>span:first-child{font-size:24px}.q8-widget-launch>a:before{content:'';width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 0 4px #34d39925}\n.q8-helper-host #q8-bubble-grip,.q8-helper-host #q8-bubble>[data-q8-hide],.q8-helper-host #q8-restore{display:none!important}\n.q8-helper-host button.q8-control{display:inline-flex;align-items:center;justify-content:center;flex:none;width:27px;height:28px;border:0!important;border-radius:8px;background:#ffffff20!important;color:white!important;font:18px Tahoma,sans-serif!important;cursor:pointer;padding:0!important}\n.q8-helper-host button.q8-control:hover{background:#ffffff40!important}.q8-helper-host .q8-grip{cursor:grab;touch-action:none;user-select:none}\n.q8-helper-host .q8-helper-panel{display:none;position:fixed;top:84px;left:10px;bottom:auto;width:400px;height:min(650px,calc(100dvh - 110px));max-height:calc(100dvh - 100px);max-width:calc(100vw - 20px);min-width:0;z-index:5001;border-radius:20px;border:1px solid #bae6fd;background:white;box-shadow:0 18px 65px #0f172a40;overflow:hidden;direction:rtl}\n.q8-helper-host .q8-helper-panel>header{display:flex;align-items:center;gap:7px;padding:12px;background:linear-gradient(120deg,#0369a1,#0054e6);color:white}.q8-helper-host .q8-panel-title{flex:1;min-width:0;touch-action:none;user-select:none;cursor:grab}.q8-panel-title b{font:700 12px Alexandria,Tahoma,sans-serif}.q8-panel-title small{display:block;font-size:9px;line-height:1.7;color:#e0f2fe;margin-top:5px}.q8-helper-panel iframe{border:0;flex:1;width:100%;min-height:0}\n.q8-helper-host .q8-tools{display:flex;gap:4px;flex:none}.q8-helper-host .q8-panel-open{display:flex!important;flex-direction:column}.q8-helper-host .q8-collapsed{display:none!important}.q8-helper-host button:focus-visible,.q8-helper-host a:focus-visible{outline:3px solid #7dd3fc;outline-offset:3px}\n@media(max-width:480px){.q8-helper-host .q8-widget-launch{top:8px!important;left:8px!important;padding:8px 12px!important}.q8-helper-host .q8-panel-title b{font-size:11px}.q8-helper-host .q8-panel-title small{font-size:8px}.q8-helper-host .q8-tools{gap:2px}.q8-helper-host button.q8-control{width:24px}}\r\n</style><div class=\"q8-helper-host\"><div id=\"q8-bubble\" class=\"q8-widget-launch\"><button type=\"button\" id=\"q8-bubble-grip\" class=\"q8-control q8-grip\" aria-label=\"فتح رفيج المكتبة\" title=\"اسحب للتحريك، أو استخدم أسهم لوحة المفاتيح\">⠿</button><a id=\"q8-assistant-open\" href=\"#q8-helper\" aria-expanded=\"false\"><span>✦</span><span>رفيج المكتبة<small>سوالف وتسوق كويتي</small></span></a><button type=\"button\" class=\"q8-control\" data-q8-hide aria-label=\"إغلاق نافذة المساعد\" title=\"إغلاق النافذة\">×</button></div><button type=\"button\" id=\"q8-restore\">✦ إظهار المساعد</button><section id=\"q8-helper\" class=\"q8-helper-panel\" aria-label=\"مساعد المكتبة\"><header><button type=\"button\" id=\"q8-panel-grip\" class=\"q8-control q8-grip\" aria-label=\"تحريك نافذة المساعد\" title=\"اسحب النافذة، أو استخدم الأسهم\">⠿</button><div id=\"q8-panel-handle\" class=\"q8-panel-title\"><b>رفيج المكتبة 🌊</b><small>سوالف، أفكار، وخوش بضاعة</small></div><div class=\"q8-tools\"><button type=\"button\" id=\"q8-reset\" class=\"q8-control\" aria-label=\"إعادة موضع المساعد\" title=\"إعادة المكان الافتراضي\">↺</button><button type=\"button\" id=\"q8-minimize\" class=\"q8-control\" aria-label=\"تصغير المساعد\" title=\"تصغير النافذة\">−</button><button type=\"button\" class=\"q8-control\" data-q8-hide aria-label=\"إغلاق نافذة المساعد\" title=\"إغلاق النافذة\">×</button></div></header><iframe title=\"محادثة مساعد المكتبة\" sandbox=\"allow-scripts allow-forms allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox\"></iframe></section></div>","framePrefix":"<!doctype html><html lang=\"ar\" dir=\"rtl\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>مساعد مكتبة الشاطئ الأزرق</title><style>*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#f6f9fd;color:#172554;font-size:14px;direction:rtl}main{height:100dvh;display:flex;flex-direction:column}#messages{flex:1;overflow:auto;padding:18px}p{line-height:1.9;margin:0}.msg{max-width:96%;padding:13px 15px;border-radius:18px 18px 4px 18px;background:white;border:1px solid #e2e8f0;margin-bottom:14px}.user{background:#0369a1;color:white;border:0;border-radius:18px 18px 18px 4px;margin-right:auto;width:fit-content;max-width:85%}.intro{background:linear-gradient(135deg,#e0f2fe,#eef2ff);border-color:#bae6fd}.chips{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}button{font:inherit;cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}.chips button{padding:8px 11px;border:1px solid #bfdbfe;border-radius:22px;background:white;color:#0369a1;font-size:12px}.card{display:grid;grid-template-columns:64px 1fr;gap:12px;background:white;border:1px solid #dbeafe;border-radius:14px;padding:11px;margin-top:9px;text-decoration:none;color:#172554}.card img{width:64px;height:74px;object-fit:contain;border-radius:9px}.card b{font-size:12px;line-height:1.7;display:block}.card strong{color:#0284c7;font-size:14px;display:block;margin:6px 0}.card small{display:block;font-size:10px;color:#64748b;line-height:1.7;max-height:35px;overflow:hidden}.card em{font-style:normal;color:#0369a1;font-size:11px;display:block;margin-top:7px}.note{font-size:10px;color:#64748b;margin-top:10px;line-height:1.7}form{display:flex;gap:7px;background:white;padding:12px;border-top:1px solid #e2e8f0}input{min-width:0;flex:1;border:1px solid #cbd5e1;border-radius:13px;padding:12px;font:inherit;font-size:12px}form button{border:0;border-radius:12px;padding:0 15px;color:white;background:#0284c7}.links a{color:#0369a1;display:block;line-height:2.2;font-size:12px}footer{text-align:center;font-size:10px;color:#64748b;background:white;padding:0 12px 9px}.q8-product-results{margin:10px 0 18px}.q8-product-card{display:grid;grid-template-columns:86px minmax(0,1fr);gap:12px;padding:12px;margin:10px 0;background:#fff;border:1px solid #dbeafe;border-radius:17px;box-shadow:0 4px 14px #0f172a06}.q8-product-image{border:0;background:#f8fafc;border-radius:11px;padding:4px;min-height:110px;font-size:30px}.q8-product-image img{width:100%;height:110px;object-fit:contain}.q8-product-info b{display:block;font-size:12px;line-height:1.7}.q8-product-info strong{display:block;color:#0284c7;font-size:15px;margin:6px 0}.q8-product-description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#64748b;font-size:10px;line-height:1.8}.q8-product-actions{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap}.q8-product-actions button,.q8-catalog-more{border:1px solid #bae6fd;border-radius:9px;padding:8px;color:#0369a1;background:#f0f9ff;font-size:11px}.q8-product-actions .q8-product-buy{background:#0284c7;color:#fff;border-color:#0284c7}.q8-catalog{border-top:1px solid #dbeafe;padding-top:14px;margin-top:14px}.q8-catalog>b{font-size:13px}.q8-catalog-search{padding:10px 0;border:0;background:none}.q8-catalog-search input{width:100%;padding:10px}.q8-catalog-search button{padding:0 12px}.q8-catalog-more{width:100%}\n\nbody{font-family:Alexandria,Tahoma,sans-serif}.intro{background:linear-gradient(130deg,#e0f2fe,#fffbeb);border-color:#bae6fd}.q8-retry{padding:10px 14px;border:1px solid #7dd3fc;border-radius:12px;background:#f0f9ff;color:#0369a1;margin-bottom:10px}.chips button:hover{background:#fffbeb;border-color:#fbbf24}</style><main><div id=\"messages\" aria-live=\"polite\"></div><form id=\"chat\"><input id=\"question\" aria-label=\"اسألني أو سولف معاي\" placeholder=\"شنو ودّك تسألني؟\" autocomplete=\"off\"><button type=\"submit\">إرسال</button></form><footer>مساعد ذكاء اصطناعي · ممكن يخطئ، تأكد من المعلومات المهمة</footer></main><script>const catalog = ","frameSuffix":";\n\nconst normalize = value => String(value).normalize('NFKC')\n  .replace(/[\\u064b-\\u065f\\u200e\\u200f\\u202a-\\u202e\\u2066-\\u2069]/g, '')\n  .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')\n  .replace(/[٠-٩]/g, n => String('٠١٢٣٤٥٦٧٨٩'.indexOf(n))).toLowerCase();\nconst groups = [\n  ['شنط','شنطه','حقيبه','حقايب','حقائب','شنتط'], ['اكريليك','اكرليك','اكريلك','acrylic'],\n  ['الوان','لون','تلوين'], ['دفتر','دفاتر','نوت','ملاحظات'], ['قلم','اقلام'],\n  ['لعبه','العاب','بزل'], ['حبر','احبار'], ['ترولي','عجلات'],['برايه','مبراه'],\n  ['محايه','ممحاه','استيكه'],['طابعه','طابعات'],['حراري','حراريه'],['دباسه','دباسات'],\n  ['حاسبه','حاسبات','calculator'],['فابر','فيبر','كاستل','فيبركاستل','faber','castell'],\n];\nconst stop = new Set('ابي ابغي اريد عندكم شنو بكم كم ممكن لو سمحت عطني اقل تحت من حدود ميزانيه دينار دنانير كويتي كويتيه في عندي ابحث عن سعر اسعار هذا هذه هذي هذيك هالمنتج او و لي مع شلون شلونك هلا والله زين حلو حلوه اشرح اكتب شرايك فيها فيه عنده وصف وصفه رابط رابطها اعرض اشوف تبي تقول شي اعرف عطيني قط نكته نكت ضحكني سولف سوالف يميز بضاعتنا'.split(' '));\nconst clean = t => t.startsWith('ال') && t !== 'الوان' ? t.slice(2) : t;\nfunction findProducts(catalog, messages, limit = 6) {\n  const users=messages.filter(m=>m.role==='user');\n  const latest=normalize(users.at(-1)?.content||'');\n  const tokensOf=t=>[...new Set(normalize(t).replace(/[^\\p{L}\\p{N}\\s]/gu,' ').split(/\\s+/).filter(t=>t.length>1&&!stop.has(t)).map(clean))];\n  const latestTokens=tokensOf(latest);\n  const followup=/(?:هذي|هال|هذا|فيها|نفسه|نفسها|اللي|الخيارات|مقاساتها|مقاسه|مدحها|امدحها|عنها|الثاني|الاول|وصفه)/.test(latest);\n  const previousUser=followup?users.slice(-2,-1).map(m=>m.content).join(' '):'';\n  const previousAnswer=followup?messages.slice(0,-1).filter(m=>m.role==='assistant').at(-1)?.content||'':'';\n  const tokens=[...new Set([...latestTokens,...tokensOf(previousUser)])];\n  const terms=tokens.map(t=>groups.find(g=>g.includes(t))||[t]);\n  const budgetMatch = latest.match(/(?:اقل من|تحت|ميزاني[هت]ي?\\s*|حدود)\\s*(\\d+(?:[.,]\\d+)?)/)\n    || latest.match(/(\\d+(?:[.,]\\d+)?)\\s*(?:دينار|دنانير|دك)/);\n  const budget=budgetMatch?Number(budgetMatch[1].replace(',','.')):null;\n  const candidates=catalog.map(p=>{\n    const title=normalize(p.n),body=normalize(p.d+' '+p.o);\n    const exact=title===latest||latest.includes(title);\n    const mentioned=!!previousAnswer&&(previousAnswer.includes(p.u)||normalize(previousAnswer).includes(title));\n    const hits=terms.filter(g=>g.some(t=>title.includes(t)));\n    const weight=hits.reduce((n,g)=>n+Math.max(...g.map(t=>Math.min(t.length,10))),0);\n    const bodyHits=terms.filter(g=>g.some(t=>body.includes(t))).length;\n    return {p,score:exact?10000:weight*10+bodyHits+(mentioned?5000:0),relevant:exact||mentioned||hits.length>0};\n  });\n  return candidates.filter(x=>x.relevant&&(budget===null||x.p.p<=budget)).sort((a,b)=>b.score-a.score||a.p.p-b.p.p).slice(0,limit).map(x=>x.p);\n}\r\n\r\n\nconst messages=document.getElementById('messages'),form=document.getElementById('chat'),input=document.getElementById('question');\nlet history=[],pending=null,lastQuestion='';\nfunction add(text,kind='') {\n  const el=document.createElement('div');el.className='msg '+kind;\n  const p=document.createElement('p');p.style.whiteSpace='pre-wrap';\n  const pattern=/\\[([^\\]\\n]{1,200})\\]\\((https:\\/\\/[^\\s<>\"()\\u200e\\u200f]+)\\)|https:\\/\\/[^\\s<>\"\\u200e\\u200f]+|\\*\\*([^*\\n]+)\\*\\*/g;let start=0;\n  for(const match of text.matchAll(pattern)) {\n    p.append(document.createTextNode(text.slice(start,match.index)));\n    if(match[3]){\n      const strong=document.createElement('strong');strong.textContent=match[3];p.append(strong);\n    }else{\n      const url=match[2]||match[0].replace(/[)\\]،.!؟]+$/u,'');\n      try{\n        const parsed=new URL(url);if(parsed.protocol!=='https:')throw new Error('Unsupported link');\n        const a=document.createElement('a');a.textContent=match[1]||(parsed.pathname.includes('/product/')?'عرض المنتج ↗':'فتح الرابط ↗');\n        a.href=parsed.href;a.target=parsed.origin==='https://cmwi896qj006o01mibk3t5qq5.wuiltstore.com'?'_top':'_blank';a.rel='noopener noreferrer';\n        a.style.cssText='color:inherit;overflow-wrap:anywhere;font-weight:700';p.append(a);\n      }catch{p.append(document.createTextNode(match[0]));}\n      if(!match[2])p.append(document.createTextNode(match[0].slice(url.length)));\n    }\n    start=match.index+match[0].length;\n  }\n  p.append(document.createTextNode(text.slice(start)));el.append(p);messages.append(el);messages.scrollTop=messages.scrollHeight;\n  return el;\n}\nfunction chips(labels) {\n  const row=document.createElement('div');row.className='chips';\n  for(const text of labels){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>text==='تصفح المنتجات بالصور'?browseProducts():text==='سلة مشترياتي'?openCart():send(text));row.append(b);}\n  messages.append(row);\n}\nfunction state(busy){form.querySelector('button').disabled=busy;input.disabled=busy;messages.querySelectorAll('.chips button,.q8-retry').forEach(b=>b.disabled=busy);}\nfunction finish(data){\n  if(!pending)return;clearTimeout(pending.timer);pending.status.remove();pending=null;state(false);\n  if(data.ok&&typeof data.text==='string'&&data.text.trim()){\n    const text=data.text.slice(0,16000);history.push({role:'assistant',content:text.slice(0,2000)});add(text);renderProductMatches(text);\n  }else {\n    add(typeof data.message==='string'?data.message:'الرد علّق شوي، بس أنا وياك. جرّب مرة ثانية أو شوف بضاعتنا بالصور.');\n    const retry=document.createElement('button');retry.type='button';retry.className='q8-retry';retry.textContent='↻ جرّب الرد مرة ثانية';retry.addEventListener('click',()=>{retry.remove();send(lastQuestion,true);});messages.append(retry);\n    chips(['تصفح المنتجات بالصور']);\n  }\n  parent.postMessage({channel:'q8-conversation-save',history},'*');\n  input.focus();\n}\nfunction send(value,retry=false){\n  const text=value.trim().slice(0,2000);if(!text||pending)return;\n  lastQuestion=text;input.value='';if(!retry){add(text,'user');history.push({role:'user',content:text});}history=history.slice(-14);\n  while(history.length>1&&history.reduce((n,m)=>n+m.content.length,0)>12000)history.shift();\n  while(history[0]?.role==='assistant')history.shift();\n  const id=crypto.randomUUID(),status=add('لحظة رفيجي، أرتّب لك الرد… 🌊','note');state(true);\n  pending={id,status,timer:setTimeout(()=>finish({ok:false,message:'الرد أخذ وقت أكثر من المعتاد، جرّب بعد شوي.'}),55000)};\n  parent.postMessage({channel:'q8-general-chat-request',id,messages:history},'*');\n}\nwindow.addEventListener('message',e=>{\n  if(e.source!==parent||e.data?.channel!=='q8-general-chat-response'||e.data.id!==pending?.id)return;\n  finish(e.data);\n});\nform.addEventListener('submit',e=>{e.preventDefault();send(input.value);});\nadd('هلا والله، أنا رفيج المكتبة 🌊\\nقط سوالفك، خلّنا نضحك أو نختار لك خوش بضاعة! أعرف كتالوجنا كله: ٤٤٦ منتج بصورها وأسعارها وخياراتها. شنو ودّك اليوم؟','intro');\nchips(['تصفح المنتجات بالصور','سلة مشترياتي','قط نكتة كويتية','شنو يميّز بضاعتنا؟','ألوان أكريليك أقل من 3 دنانير']);\n\nfunction productAction(product,action='view'){\n  requestShoppingAction(product,action);\n}\nfunction openCart(){productAction(catalog[0],'cart');}\nfunction productCard(product){\n  const card=document.createElement('article');card.className='q8-product-card';\n  const imageButton=document.createElement('button');imageButton.type='button';imageButton.className='q8-product-image';imageButton.setAttribute('aria-label','عرض '+product.n);\n  if(product.i){const img=document.createElement('img');img.src=product.i;img.alt=product.n;img.loading='lazy';img.referrerPolicy='no-referrer';\n    img.addEventListener('error',()=>{img.hidden=true;imageButton.textContent='📚';},{once:true});imageButton.append(img);\n  }else imageButton.textContent='📚';\n  imageButton.addEventListener('click',()=>productAction(product));\n  const info=document.createElement('div');info.className='q8-product-info';\n  const title=document.createElement('b');title.textContent=product.n;\n  const price=document.createElement('strong');price.textContent=(product.o?'يبدأ من ':'')+Number(product.p).toFixed(3)+' د.ك';\n  const details=document.createElement('small');details.textContent=product.o||product.d;details.className='q8-product-description';\n  const actions=document.createElement('div');actions.className='q8-product-actions';\n  const view=document.createElement('button');view.type='button';view.textContent='عرض المنتج';view.addEventListener('click',()=>productAction(product));\n  const cart=document.createElement('button');cart.type='button';cart.className='q8-product-buy';cart.textContent=product.o?'اختار الخيارات':'أضف للسلة';\n  cart.addEventListener('click',()=>productAction(product,'add'));\n  actions.append(view,cart);info.append(title,price,details,actions);card.append(imageButton,info);return card;\n}\nfunction renderProductMatches(text){\n  const normalized=normalize(text);\n  const selected=catalog.filter(p=>text.includes(p.u)||normalized.includes(normalize(p.n))).slice(0,6);\n  if(!selected.length)return;\n  const group=document.createElement('section');group.className='q8-product-results';group.setAttribute('aria-label','المنتجات المقترحة بالصور');\n  selected.forEach(p=>group.append(productCard(p)));messages.append(group);messages.scrollTop=messages.scrollHeight;\n}\nfunction browseProducts(){\n  q8CatalogState={open:true,query:''};\n  const section=document.createElement('section');section.className='q8-catalog';section.setAttribute('aria-label','تصفح جميع المنتجات');\n  const title=document.createElement('b');title.textContent='شوف بضاعتنا 📚 — '+catalog.length+' منتج';\n  const searchForm=document.createElement('form');searchForm.className='q8-catalog-search';\n  const search=document.createElement('input');search.type='search';search.placeholder='اسم المنتج أو نوعه…';search.setAttribute('aria-label','ابحث في كل المنتجات');\n  const submit=document.createElement('button');submit.type='submit';submit.textContent='بحث';searchForm.append(search,submit);search.addEventListener('input',()=>{q8CatalogState.query=search.value;});\n  const note=document.createElement('p');note.className='note';\n  const list=document.createElement('div');list.className='q8-product-results';\n  const more=document.createElement('button');more.type='button';more.className='q8-catalog-more';more.textContent='عرض منتجات أكثر';\n  let found=catalog,shown=0;\n  function page(){const end=Math.min(shown+12,found.length);for(const p of found.slice(shown,end))list.append(productCard(p));shown=end;more.hidden=shown>=found.length;note.textContent=found.length?'عرض '+shown+' من '+found.length+' منتج · السعر النهائي والتوفر في صفحة المنتج':'ما لقيت نتيجة بهالاسم. جرّب كلمة أبسط.';}\n  searchForm.addEventListener('submit',e=>{e.preventDefault();q8CatalogState.query=search.value;found=search.value.trim()?findProducts(catalog,[{role:'user',content:search.value}],catalog.length):catalog;shown=0;list.replaceChildren();page();});\n  more.addEventListener('click',page);section.append(title,searchForm,note,list,more);messages.append(section);page();section.scrollIntoView({block:'start'});search.focus();\n}\n\nlet q8CatalogState={open:false,query:''},q8ShopPending=null;\nfunction requestShoppingAction(product,action='view'){\n  if(q8ShopPending&&action==='add')return;\n  const id=crypto.randomUUID(),actual=action==='add'&&product.o?'choose':action;\n  if(actual==='add'){\n    const status=add('نضيف المنتج لسلة المتجر…','note');\n    document.querySelectorAll('.q8-product-buy').forEach(b=>b.disabled=true);\n    q8ShopPending={id,status,timer:setTimeout(()=>finishShopping({id,ok:false,message:'الإضافة أخذت وقت. راجع سلة المتجر قبل المحاولة مرة ثانية.'}),50000)};\n  }\n  parent.postMessage({channel:'q8-product-open',id,url:product.u,name:product.n,image:product.i,hasOptions:!!product.o,action:actual,history,catalog:q8CatalogState},'*');\n}\nfunction finishShopping(data){\n  if(q8ShopPending&&q8ShopPending.id===data.id){clearTimeout(q8ShopPending.timer);q8ShopPending.status.remove();q8ShopPending=null;document.querySelectorAll('.q8-product-buy').forEach(b=>b.disabled=false);}\n  if(typeof data.message==='string')add(data.message,'note');\n}\nwindow.addEventListener('message',e=>{\n  if(e.source!==parent)return;\n  const data=e.data;\n  if(data?.channel==='q8-product-result'){finishShopping(data);return;}\n  if(data?.channel!=='q8-shopping-resume')return;\n  const restored=Array.isArray(data.history)?data.history.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-14):[];\n  history=restored.map(m=>({role:m.role,content:m.content.slice(0,2000)}));\n  for(const message of history){add(message.content,message.role==='user'?'user':'');if(message.role==='assistant')renderProductMatches(message.content);}\n  if(typeof data.message==='string')add(data.message,'note');\n  if(data.catalog?.open){browseProducts();const forms=document.querySelectorAll('.q8-catalog-search');const form=forms[forms.length-1];const search=form?.querySelector('input');if(search&&data.catalog.query){search.value=String(data.catalog.query).slice(0,200);form.requestSubmit();}}\n});</script><script>let q8CurrentPath='';addEventListener('message',e=>{if(e.source!==parent||e.data?.channel!=='q8-current-product')return;const p=e.data.product;if(!p||typeof p.path!=='string'||!p.path.startsWith('/ar/product/all/')||typeof p.message!=='string'||p.message.length>2000||p.path===q8CurrentPath)return;q8CurrentPath=p.path;add(p.message);history.push({role:'assistant',content:p.message});history=history.slice(-14);parent.postMessage({channel:'q8-conversation-save',history},'*');});</script></html>"},function(frame){
function installQ8Controls() {
  const host=document.querySelector('.q8-helper-host');
  if(!host||host.dataset.controlsReady==='2')return;host.dataset.controlsReady='2';
  const panel=host.querySelector('#q8-helper'),bubble=host.querySelector('#q8-bubble'),opener=host.querySelector('#q8-assistant-open'),restore=host.querySelector('#q8-restore');
  // A stable top launcher is always present. Only the open panel may be moved.
  const KEY='q8.assistant.layout.v2';let saved={panel:null};
  try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&typeof v==='object')saved.panel=v.panel||null;}catch{}
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved));}catch{}};
  const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);
  function place(){
    panel.style.width=Math.min(400,window.innerWidth-20)+'px';
    panel.style.height=Math.min(650,window.innerHeight-110)+'px';
    const maxX=Math.max(10,window.innerWidth-panel.offsetWidth-10),maxY=Math.max(84,window.innerHeight-panel.offsetHeight-10);
    panel.style.left=clamp(saved.panel?.x??10,10,maxX)+'px';panel.style.top=clamp(saved.panel?.y??84,84,maxY)+'px';panel.style.bottom='auto';panel.style.right='auto';
  }
  const clearHash=()=>{if(['#navbar','#q8-helper','#q8-helper-close'].includes(location.hash))history.replaceState(null,'',location.pathname+location.search);};
  function minimize(){panel.classList.remove('q8-panel-open','q8-helper-open');panel.classList.add('q8-collapsed');opener.setAttribute('aria-expanded','false');clearHash();}
  function open(){host.classList.remove('q8-host-hidden');panel.classList.remove('q8-collapsed');panel.classList.add('q8-panel-open');opener.setAttribute('aria-expanded','true');place();}
  function reset(){saved.panel=null;persist();place();}
  opener.addEventListener('click',e=>{e.preventDefault();panel.classList.contains('q8-panel-open')?minimize():open();});
  host.querySelector('#q8-minimize').addEventListener('click',minimize);
  host.querySelectorAll('[data-q8-hide]').forEach(el=>el.addEventListener('click',minimize));
  host.querySelector('#q8-reset').addEventListener('click',reset);
  restore.addEventListener('click',open);
  host.querySelector('#q8-bubble-grip')?.addEventListener('click',open);
  let active=null;
  for(const handle of [host.querySelector('#q8-panel-handle'),host.querySelector('#q8-panel-grip')]){
    handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=panel.getBoundingClientRect();active={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};handle.setPointerCapture(e.pointerId);e.preventDefault();});
    handle.addEventListener('pointermove',e=>{if(!active||active.id!==e.pointerId)return;saved.panel={x:active.left+e.clientX-active.x,y:active.top+e.clientY-active.y};place();});
    const end=e=>{if(active?.id!==e.pointerId)return;active=null;persist();if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);};
    handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
    handle.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')return reset();const r=panel.getBoundingClientRect(),d=e.shiftKey?50:10;saved.panel={x:r.left+(e.key==='ArrowRight'?d:e.key==='ArrowLeft'?-d:0),y:r.top+(e.key==='ArrowDown'?d:e.key==='ArrowUp'?-d:0)};place();persist();});
  }
  window.addEventListener('resize',()=>{if(panel.classList.contains('q8-panel-open'))place();});
  const MEMORY='q8.conversation.v2';
  window.addEventListener('message',e=>{
    if(e.source!==panel.querySelector('iframe').contentWindow||e.data?.channel!=='q8-conversation-save')return;
    const messages=Array.isArray(e.data.history)?e.data.history.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-14).map(m=>({role:m.role,content:m.content.slice(0,2000)})):[];
    try{sessionStorage.setItem(MEMORY,JSON.stringify({at:Date.now(),messages}));}catch{}
  });
  try{const memory=JSON.parse(sessionStorage.getItem(MEMORY));if(memory?.messages?.length&&Date.now()-memory.at<1800000&&!sessionStorage.getItem('q8.assistant.shopping.resume.v3')&&!sessionStorage.getItem('q8.assistant.shopping.resume.v3.global'))panel.querySelector('iframe').contentWindow.postMessage({channel:'q8-shopping-resume',history:memory.messages},'*');}catch{}
  const requested=['#q8-helper','#navbar'].includes(location.hash);requestAnimationFrame(()=>{if(requested)open();else minimize();});
}
installQ8Controls();

function currentProduct(document,pathname){
 if(!pathname.startsWith('/ar/product/all/'))return null;
 const head=document.querySelector('#product-head-id'),name=head?.querySelector('h1')?.textContent.trim();
 if(!name)return null;
 const price=[...head.querySelectorAll('[data-test="text-price"]')].find(n=>!n.closest('.line-through'))?.textContent.trim()||'';
 const options=[...head.querySelectorAll('button')].filter(n=>!n.closest('.q8-product-intro')).map(n=>n.textContent.trim()).filter(t=>t&&!/أضف|السلة|السلَّة/.test(t));
 const unavailable=[...head.querySelectorAll('p,button')].some(n=>/نفدت الكمية|غير متوفر/.test(n.textContent));
 const message=unavailable?`هلا والله 🌊 قاعد تشوف ${name}. أساعدك بمواصفاته أو ندور لك بديل متوفر؟`:`هلا والله 🌊 ${name} خوش اختيار من بضاعتنا!${price?` سعره الحالي ${price} — يستاهل تشوف تفاصيله وتختار اللي يضبط وياك.`:''}${options.length?' عندك خيارات: '+options.join('، ')+'. السعر يتحدّث حسب اختيارك.':''}`;
 return {path:pathname,name,price,options,unavailable,message};
}
function installProductUi(frame,readProduct){
 const host=frame.closest('.q8-helper-host'),bubble=host?.querySelector('#q8-bubble'),opener=host?.querySelector('#q8-assistant-open');
 if(!host||!bubble||!opener)return;
 const dock=document.createElement('div');dock.className='q8-assistant-dock';dock.setAttribute('aria-label','رفيج المكتبة بجانب الشعار');
 let scheduled=false,lastGreeting='',teaser=null;
 function update(){
  const logos=[...document.querySelectorAll('#navbar [data-test="store-logo"]')];
  const logo=logos.find(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight;})||logos.find(n=>n.getBoundingClientRect().width);
  const link=logo?.closest('a');
  if(link){if(dock.parentElement!==link.parentElement)link.insertAdjacentElement('afterend',dock);if(bubble.parentElement!==dock)dock.append(bubble);}
  const closedCart=document.querySelector('[data-test="button-close-cart"]');
  const hide=host.style.display==='none'||!!(closedCart&&closedCart.getBoundingClientRect().width);
  if(dock.hidden!==hide)dock.hidden=hide;
  const product=readProduct(document,location.pathname);
  if(!product){teaser?.remove();teaser=null;return;}
  const head=document.querySelector('#product-head-id');
  if(!teaser||!teaser.isConnected){teaser=document.createElement('aside');teaser.className='q8-product-intro';teaser.setAttribute('aria-label','رفيج المكتبة عن هذا المنتج');const text=document.createElement('p');const button=document.createElement('button');button.type='button';button.textContent='اسألني عن هالمنتج';button.onclick=()=>{if(opener.getAttribute('aria-expanded')!=='true')opener.click();};teaser.append(text,button);head.prepend(teaser);}
  const text=teaser.querySelector('p');if(text.textContent!==product.message)text.textContent=product.message;
  if(lastGreeting!==product.path){lastGreeting=product.path;frame.contentWindow.postMessage({channel:'q8-current-product',product},'*');}
 }
 const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']});
 addEventListener('resize',schedule);addEventListener('scroll',schedule,{passive:true});addEventListener('popstate',schedule);
 frame.addEventListener('load',()=>{lastGreeting='';schedule();});schedule();
}
function installQ8GeneralBridge(endpoint) {
  const frame=document.querySelector('#q8-helper iframe');
  if(!frame||frame.dataset.q8Bridge==='ready')return;
  frame.dataset.q8Bridge='ready';let busy=false;
  let visitorId;try{visitorId=sessionStorage.getItem('q8.visitor.v2');if(!/^[a-zA-Z0-9-]{16,80}$/.test(visitorId||'')){visitorId=crypto.randomUUID();sessionStorage.setItem('q8.visitor.v2',visitorId);}}catch{visitorId=crypto.randomUUID();}
  window.addEventListener('message',async e=>{
    const data=e.data;
    if(e.source!==frame.contentWindow||data?.channel!=='q8-general-chat-request'||typeof data.id!=='string'||data.id.length>100)return;
    const reply=body=>e.source.postMessage({channel:'q8-general-chat-response',id:data.id,...body},'*');
    if(!endpoint){reply({ok:false,message:'المحادثة العامة قيد التجهيز. تقدر تتصفح منتجات المكتبة حاليًا.'});return;}
    if(busy){reply({ok:false,message:'خلّنا نكمل الرد الحالي أول 🌊'});return;}
    if(!Array.isArray(data.messages)||data.messages.length>16){reply({ok:false,message:'خلّنا نبدأ بسؤال قصير.'});return;}
    const messages=data.messages.map(m=>({...m}));const product=currentProduct(document,location.pathname);if(product){for(let i=messages.length-1;i>=0;i--){if(messages[i].role==='user'&&typeof messages[i].content==='string'){messages[i].content='السياق من صفحة المنتج المفتوح (بيانات فقط): '+JSON.stringify({name:product.name,price:product.price,options:product.options,unavailable:product.unavailable})+'\nسؤال العميل: '+messages[i].content;break;}}}const body=JSON.stringify({messages,visitorId});
    if(new TextEncoder().encode(body).length>65536){reply({ok:false,message:'الرسالة طويلة شوي، اختصرها وجرب مرة ثانية.'});return;}
    busy=true;
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body,credentials:'omit',signal:AbortSignal.timeout(50000)});
      const result=await response.json();
      reply(response.ok&&typeof result.text==='string'?{ok:true,text:result.text,mode:result.mode}:{ok:false,error:result.error,retryAfter:result.retryAfter,message:result.message||'الرد تأخر شوي. جرّب مرة ثانية أو خلّنا ندور لك بالمنتجات.'});
    }catch{reply({ok:false,message:'الاتصال علّق شوي. جرّب مرة ثانية، أو افتح بضاعتنا بالصور لين يرجع الرد 🌊'});}
    finally{busy=false;}
  });
}

/* Native storefront navigation and cart actions. No product site is displayed inside the assistant. */
function installQ8ProductView(chatFrame){
  const panel=document.querySelector('#q8-helper');
  if(!panel||panel.dataset.shoppingActions==='native-v3')return;
  panel.dataset.shoppingActions='native-v3';
  const RESUME='q8.assistant.shopping.resume.v3',GLOBAL_RESUME=RESUME+'.global';
  let busy=false;
  const used=new Set();
  const shown=el=>!!el&&el.getClientRects().length>0&&el.getBoundingClientRect().height>0;
  const canonical=value=>{try{const u=new window.URL(value,window.location.origin);return u.origin===window.location.origin?u.pathname:null;}catch{return null;}};
  function openNativeCart(doc){
    const close=doc.querySelector('[data-test="button-close-cart"]');
    if(shown(close))return true;
    const desktop=[...doc.querySelectorAll('#navbar button')].find(b=>shown(b)&&b.textContent.includes('د.ك'));
    const mobile=[...doc.querySelectorAll('#navbar div')].find(el=>shown(el)&&el.querySelector('svg')&&el.textContent.replace(/[\u064b-\u065f]/g,'').trim()==='السلة');
    const target=desktop||mobile;if(!target)return false;target.click();return true;
  }
  function waitForDom(doc,predicate,ms=22000){
    return new Promise((resolve,reject)=>{
      let observer,timer;
      const stop=()=>{observer?.disconnect();clearTimeout(timer);};
      const check=()=>{try{const value=predicate();if(value){stop();resolve(value);}}catch(error){stop();reject(error);}};
      observer=new window.MutationObserver(check);observer.observe(doc.documentElement,{childList:true,subtree:true,attributes:true,characterData:true});
      timer=setTimeout(()=>{stop();reject(new Error('cart_timeout'));},ms);check();
    });
  }
  function cartSnapshot(doc,data){
    const basket=doc.querySelector('[data-test="cart-items-list"]');
    if(!basket)return {found:false,signature:''};
    const names=[...basket.querySelectorAll('[data-test="text-item-title"]')].map(el=>el.textContent.trim());
    const images=[...basket.querySelectorAll('img')].map(el=>{try{return new window.URL(el.src).pathname;}catch{return '';}});
    let expected='';try{if(data.image)expected=new window.URL(data.image).pathname;}catch{}
    return {found:names.includes(data.name)&&(!expected||images.includes(expected)),signature:basket.textContent+'|'+[...basket.querySelectorAll('input')].map(el=>el.value).join('|')};
  }
  const minimize=()=>document.querySelector('#q8-minimize')?.click();
  const showCart=async()=>{minimize();await waitForDom(document,()=>openNativeCart(document),12000);};
  function nativeAdd(root){return [...root.querySelectorAll('button')].find(b=>shown(b)&&!b.disabled&&/أضف.*السل/.test(b.textContent));}
  function parentCard(url){return [...document.querySelectorAll('[data-test="product-card"]')].find(card=>[...card.querySelectorAll('a[aria-label]')].some(a=>canonical(a.href)===url.pathname));}
  async function addNative(doc,root,data){
    openNativeCart(doc);
    const before=cartSnapshot(doc,data);
    const button=nativeAdd(root);if(!button)throw new Error('unavailable');
    button.click();
    await waitForDom(doc,()=>{const after=cartSnapshot(doc,data);return after.found&&(!before.found||after.signature!==before.signature);});
  }
  let resume=null;
  try{const raw=sessionStorage.getItem(RESUME)||sessionStorage.getItem(GLOBAL_RESUME);if(raw){sessionStorage.removeItem(RESUME);sessionStorage.removeItem(GLOBAL_RESUME);const value=JSON.parse(raw);if(Date.now()-value.at<120000&&value.path===window.location.pathname)resume=value;}}catch{}
  if(resume)window.requestAnimationFrame(()=>{
    chatFrame.contentWindow.postMessage({channel:'q8-shopping-resume',history:resume.history,catalog:resume.catalog,message:resume.message},'*');
    showCart().catch(()=>{});
  });
  window.addEventListener('message',async e=>{
    const data=e.data;
    if(e.source!==chatFrame.contentWindow||data?.channel!=='q8-product-open'||typeof data.id!=='string'||data.id.length>100)return;
    let url;try{url=new window.URL(data.url);if(url.origin!==window.location.origin||!url.pathname.startsWith('/ar/product/all/')||url.search||url.hash||url.username||url.password)return;}catch{return;}
    const reply=(ok,message)=>chatFrame.contentWindow.postMessage({channel:'q8-product-result',id:data.id,ok,message},'*');
    if(data.action==='view'||data.action==='choose'){window.location.assign(url.href);return;}
    if(data.action==='cart'){try{await showCart();}catch{reply(false,'اضغط على سلة المتجر أعلى الصفحة أو أسفلها.');}return;}
    if(data.action!=='add'||used.has(data.id))return;
    if(data.hasOptions){window.location.assign(url.href);return;}
    if(busy){reply(false,'خلّنا نكمل الإضافة الحالية أول.');return;}
    used.add(data.id);if(used.size>100)used.delete(used.values().next().value);busy=true;
    let transport=null;
    try{
      const card=parentCard(url);
      if(card&&nativeAdd(card)){
        await addNative(document,card,data);reply(true,'المنتج موجود في سلة المتجر ✓');minimize();return;
      }
      /* Compatibility transport for products outside the current listing; removed after the operation. */
      transport=document.createElement('iframe');transport.className='q8-cart-transport';transport.title='اتصال سلة المتجر';transport.setAttribute('aria-hidden','true');transport.tabIndex=-1;
      transport.style.cssText='position:fixed;left:-20000px;top:0;width:1100px;height:850px;border:0;visibility:hidden;pointer-events:none';
      const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('product_timeout')),22000);transport.onload=()=>{clearTimeout(timer);resolve();};});
      transport.src=url.href;document.body.append(transport);await loaded;
      if(transport.contentWindow.location.origin!==window.location.origin)throw new Error('wrong_origin');
      const doc=transport.contentDocument;
      const head=await waitForDom(doc,()=>doc.getElementById('product-head-id'));
      const choices=[...head.querySelectorAll('select,[role="combobox"],input[type="radio"],button')].filter(el=>shown(el)&&(el.tagName!=='BUTTON'||(el.textContent.trim()&&!/أضف.*السل/.test(el.textContent))));
      if(choices.length){window.location.assign(url.href);return;}
      await addNative(doc,head,data);
      const history=Array.isArray(data.history)?data.history.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-14).map(m=>({role:m.role,content:m.content.slice(0,2000)})):[];
      const snapshot=JSON.stringify({at:Date.now(),path:window.location.pathname,history,catalog:{open:!!data.catalog?.open,query:String(data.catalog?.query||'').slice(0,200)},message:'المنتج موجود في سلة المتجر ✓'});
      sessionStorage.setItem(GLOBAL_RESUME,snapshot);sessionStorage.setItem(RESUME,snapshot);
      transport.remove();transport=null;
      window.location.reload();
    }catch(error){reply(false,error?.message==='unavailable'?'الإضافة مو متاحة حاليًا. افتح المنتج وتأكد من التوفر والخيارات.':'ما قدرت أتأكد من الإضافة. راجع سلة المتجر قبل المحاولة مرة ثانية.');}
    finally{transport?.remove();busy=false;}
  });
}
installQ8GeneralBridge("https://maktaba-q8-store.ai.studio/api/ai-chat");installQ8ProductView(frame);installProductUi(frame,currentProduct);
});