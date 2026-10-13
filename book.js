'use strict';
/* Artbook navigation: cover → contents → chapter/work page.
   Player and project details are shared with app.js. No external libraries. */
(() => {
 const data = window.PORTFOLIO;
 const ui = window.PortfolioUI;
 const book = document.querySelector('#artbook');
 if (!book || !ui) return;
 const content = document.querySelector('#book-content');
 const spread = document.querySelector('#book-spread');
 const cover = document.querySelector('#open-book');
 const controls = document.querySelector('.book-controls');
 const previous = document.querySelector('#previous-page');
 const next = document.querySelector('#next-page');
 const indexButton = document.querySelector('#book-index');
 const close = document.querySelector('#close-book');
 const status = document.querySelector('#book-status');
 const projects = data.projects.filter(p => p.ready && ui.safePath(p.video));
 const chapters = (data.chapters || []).filter(chapter => projects.some(p => p.chapter === chapter.id));
 const pages = chapters.flatMap((chapter, chapterIndex) => {
  const works = projects.filter(p => p.chapter === chapter.id);
  return works.map((project, workIndex) => ({chapter, chapterIndex, project, workIndex, works}));
 });
 let opened = false;
 let position = -1;
 let openingTimer;
 let previewCleanup=[];
 const smallScreen = () => matchMedia('(max-width: 700px)').matches;
 const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
 // 여러 장의 얇은 종이를 순서대로 넘기는 경량 CSS 레이어.
 const paperStack = document.createElement('div');
 paperStack.className = 'paper-stack'; paperStack.setAttribute('aria-hidden','true');
 for (let i=0;i<4;i++) {
  for (const side of ['right']) {
   const leaf=document.createElement('span'); leaf.className=`paper-leaf paper-${side}`;
   leaf.style.setProperty('--leaf-order',String(i));leaf.style.zIndex=String(12-i);
   const imprint=document.createElement('div');imprint.className='leaf-imprint';
   const label=document.createElement('small');label.textContent='KWAK / THE EFFECT COLLECTION';
   const title=document.createElement('strong');title.textContent=['Form.','Light.','Motion.','Impact.'][i];
   const caption=document.createElement('small');caption.textContent='GAME VFX PORTFOLIO';
   imprint.append(label,title,caption);
   const folio=document.createElement('span');folio.textContent=String(i+1).padStart(3,'0');leaf.append(imprint,folio);paperStack.append(leaf);
  }
 }
 book.append(paperStack);
 function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
 }
 function button(text, className, action) {
  const node = el('button', className, text);
  node.type = 'button'; node.addEventListener('click', action); return node;
 }
 function pageFooter(label, number) {
  const footer = el('div', 'folio'); footer.append(el('span', '', label),el('span', '', number)); return footer;
 }
 function contents() {
  const archive = el('div', 'archive-board');
  if(projects.length > 6) archive.classList.add('archive-expanded');
  const masthead = el('div','archive-masthead'); masthead.append(el('span','archive-symbol','K.'),el('span','eyebrow','THE EFFECT COLLECTION / SELECTED WORKS'));
  archive.append(masthead);
  const heading = el('h2','archive-heading'); heading.id='book-page-heading';heading.tabIndex=-1;heading.append(el('span','','THE'),el('strong','','Archive'),el('small','','SELECTED WORKS / PLAY THE FILMS'));archive.append(heading);
  const watch = button('대표 쇼릴 감상 ↗', 'book-showreel', () => {
   ui.openProject({title:'대표 쇼릴',category:'SHOWREEL',ready:true,video:data.showreel.src,thumbnail:data.showreel.poster,captions:data.showreel.captions,role:'본인 포트폴리오 영상',year:'',duration:'',intent:'',process:[],tools:[],review:''}, watch);
  });
  if (ui.safePath(data.showreel.src)) archive.append(watch);
  const list = el('div', 'archive-tiles');
  projects.forEach((featured, index) => {
   const chapter = chapters.find(chapter => chapter.id === featured.chapter);
   const node = button('', `chapter-link archive-tile tile-${index+1}`, () => navigate(pages.findIndex(p => p.project === featured)));
   node.dataset.project=featured.id;
   node.setAttribute('aria-label',`${chapter.title} / ${featured.title} 작품 열기`);

   if(featured) {
    const preview=el('video','chapter-video-preview');preview.src=ui.safePath(featured.preview)||ui.safePath(featured.video);preview.loop=false;preview.poster=ui.safePath(featured.thumbnail);preview.muted=true;preview.defaultMuted=true;preview.playsInline=true;preview.preload='none';preview.setAttribute('aria-hidden','true');
    // 앞부분만 무음 반복. 전체 영상 재생은 작품 상세 화면에서 제공합니다.
    let finished=false;
    preview.addEventListener('timeupdate',()=>{if(!featured.preview&&preview.currentTime>=8){finished=true;preview.pause();}});
    preview.addEventListener('ended',()=>{finished=true;preview.pause();});
    let inView=false;
    const update=()=>{if(inView&&!finished&&!reducedMotion()&&!document.hidden)preview.play().catch(()=>{});else preview.pause();};
    const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);update();},{threshold:.25});observer.observe(preview);
    document.addEventListener('visibilitychange',update);
    previewCleanup.push(()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);preview.pause();preview.removeAttribute('src');preview.load();});
    preview.addEventListener('error',()=>{preview.hidden=true;});
    node.append(preview);
   } else {
    const image=el('img');image.src=ui.safePath(chapter.artwork)||`assets/chapter-${chapter.id}.svg`;image.alt='';image.width=600;image.height=400;image.decoding='async';image.loading='lazy';node.append(image);
   }
   node.append(el('span','tile-art-label',featured?`${featured.title} / FIRST 8 SECONDS`:chapter.artwork?'CHAPTER VISUAL':'CHAPTER ART / PREVIEW'));
   const number = el('span', 'chapter-number', String(index + 1).padStart(2,'0'));
   const title = el('div', 'chapter-label'); title.append(el('strong','',chapter.title),el('span','',featured.title));
   const count = data.projects.filter(p => p.chapter === chapter.id && p.ready && p.video).length;
   const caption=el('span','archive-tile-caption');caption.append(number,title,el('span','chapter-count', count ? `${count} WORK${count > 1 ? 'S' : ''}` : '등록 예정'),el('span','chapter-arrow','↗'));node.append(caption); list.append(node);
  });
  archive.append(list);
  return [archive];
 }
 function mediaPreview(project, chapter) {
  const hasVideo = ui.safePath(project?.video);
  const node = button('', `book-media ${chapter.theme}`, () => ui.openProject(project,node));
  node.setAttribute('aria-label', hasVideo ? `${project.title} 영상 크게 감상하기` : `${project.title} 등록용 상세 보기`);
  let thumbnail = ui.safePath(project.thumbnail);
  const id = ui.youtubeId(project.video);
  if (!thumbnail && id) thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  if (hasVideo && !id && !thumbnail) {
   const frame = el('video','book-video-frame');
   frame.src=hasVideo;frame.muted=true;frame.playsInline=true;frame.preload='metadata';frame.setAttribute('aria-hidden','true');
   frame.addEventListener('loadedmetadata',()=>{frame.currentTime=Math.min(1,frame.duration/2);},{once:true});
   node.append(frame);
   previewCleanup.push(()=>{frame.pause();frame.removeAttribute('src');frame.load();});
  }
  if (thumbnail) {
   const image = el('img'); image.src = thumbnail; image.alt = `${project.title} 썸네일`; image.width=960; image.height=540; image.loading='lazy'; image.decoding='async'; image.addEventListener('error',()=>{image.hidden=true;node.classList.add('missing-thumbnail');}); node.append(image);
  }
  const label = el('div','book-media-label');
  if (hasVideo) label.append(el('span','book-play','▶'),el('span','','PLAY / EXPAND'));
  else label.append(el('span','eyebrow','VIDEO SLOT'),el('strong','','영상 등록 예정'),el('span','','임시 콘텐츠 · 실제 작품이 아닙니다'));
  node.append(label); return node;
 }
 function chapterPage(page) {
  const {chapter,chapterIndex,project,workIndex,works} = page;
  const left=el('div',`book-page chapter-intro ${chapter.theme}`);
  left.append(button('← 작품 목차로 돌아가기','chapter-return',()=>navigate(-1)));
  left.append(el('span','eyebrow',`CHAPTER ${String(chapterIndex+1).padStart(2,'0')} / THE COLLECTION`));
  const heading=el('h2','book-heading',chapter.title);heading.id='book-page-heading';heading.tabIndex=-1;left.append(heading,el('p','chapter-subtitle',chapter.subtitle),el('p','chapter-description',chapter.description));
  const label=el('div','work-list-title');label.append(el('span','eyebrow','IN THIS CHAPTER'),el('span','',`${works.length} WORK${works.length===1?'':'S'}`));left.append(label);
  const list=el('div','book-work-list');
  works.forEach((work,i)=>{
   const item=button('',`book-work ${i===workIndex?'selected':''}`,()=>navigate(pages.findIndex(p=>p.project===work)));
   item.setAttribute('aria-pressed',String(i===workIndex));item.append(el('span','',String(i+1).padStart(2,'0')),el('strong','',work.title),el('small','',work.ready?'PROJECT':'준비 중'));list.append(item);
  });
  if (!works.length) list.append(el('p','book-note','아직 등록된 작품이 없습니다. content.js에서 이 챕터의 작품을 추가해 주세요.'));
  left.append(list,pageFooter('CHAPTER / '+String(chapterIndex+1).padStart(2,'0'),String((position+1)*2+1).padStart(3,'0')));
  const right=el('div','book-page chapter-work');right.append(el('span','eyebrow',project?.ready?'SELECTED WORK / FINAL FILM':'WORK IN PREPARATION / PLACEHOLDER'));
  if (project) {
   right.append(mediaPreview(project,chapter));
   const title=el('div','book-work-title');title.append(el('h3','',project.title),el('span','status-tag',project.ready?'PROJECT':'등록 예정'));right.append(title,el('p','book-work-subtitle',project.subtitle));
   const brief=el('div','book-brief');if(project.intent)brief.append(el('span','eyebrow','INTENTION'),el('p','',project.intent));
   const tools=el('div','tools');project.tools.forEach(t=>tools.append(el('span','tool-tag',t)));brief.append(tools);right.append(brief);
  } else right.append(el('div','empty-chapter','새로운 작품을 위한 빈 페이지.'));
  right.append(pageFooter(project?.ready?'VIEW THE EFFECT':'실제 작품 자료 등록 예정',String((position+1)*2+2).padStart(3,'0')));return[left,right];
 }
 function render(focus = false) {
  previewCleanup.forEach(cleanup=>cleanup());previewCleanup=[];
  content.replaceChildren(...(position===-1?contents():chapterPage(pages[position])));
  previous.disabled=position===-1;next.disabled=position===pages.length-1 || !pages.length;indexButton.disabled=position===-1;
  status.textContent=position===-1?'목차 · 감상할 챕터를 선택하세요.':`${pages[position].chapter.title} · ${position+1} / ${pages.length} 작품 페이지`;
  if (focus) {
   document.querySelector('#book-page-heading').focus({preventScroll:true});
   book.scrollIntoView({block:'start',behavior:reducedMotion()?'auto':'smooth'});
  }
 }
 function navigate(target) {
  if (!opened || target < -1 || target >= pages.length || target===position) return;
  const direction=target>position?'forward':'backward';position=target;
  book.classList.remove('turn-forward','turn-backward');void book.offsetWidth;render(true);
  book.classList.add('turn-'+direction);
 }
 book.addEventListener('animationend',event=>{if(event.target.classList.contains('page-turn')||event.target===content)book.classList.remove('turn-forward','turn-backward');});
 function openBook() {
  if (opened) return;
  clearTimeout(openingTimer);opened=true;position=-1;cover.disabled=true;cover.setAttribute('aria-expanded','true');spread.hidden=false;spread.inert=true;controls.hidden=false;controls.inert=true;close.hidden=false;render();
  requestAnimationFrame(()=>{if(opened){book.classList.add('is-open');if(!reducedMotion())book.classList.add('is-unfurling');}});
  openingTimer=setTimeout(()=>{if(!opened)return;cover.hidden=true;book.classList.remove('is-unfurling');spread.inert=false;controls.inert=false;document.querySelector('#book-page-heading').focus({preventScroll:true});},reducedMotion()?0:2200);
 }
 function closeBook() {
  clearTimeout(openingTimer);opened=false;position=-1;book.classList.remove('turn-forward','turn-backward','is-unfurling');spread.inert=true;controls.hidden=true;close.hidden=true;cover.hidden=false;cover.disabled=true;cover.setAttribute('aria-expanded','false');status.textContent='책을 접고 있습니다.';
  void cover.offsetWidth;
  book.classList.remove('is-open');
  openingTimer=setTimeout(()=>{if(opened)return;spread.hidden=true;cover.disabled=false;status.textContent='표지를 눌러 작품의 세계를 펼쳐보세요.';cover.focus({preventScroll:true});},reducedMotion()?0:smallScreen()?1100:1450);
 }
 cover.addEventListener('click',openBook);close.addEventListener('click',closeBook);previous.addEventListener('click',()=>navigate(position-1));next.addEventListener('click',()=>navigate(position+1));indexButton.addEventListener('click',()=>navigate(-1));

 book.addEventListener('keydown',event=>{if(!opened||event.altKey||event.ctrlKey||event.metaKey||document.querySelector('dialog').open||event.target.closest('video,iframe,input,textarea'))return;if(event.key==='ArrowRight'){event.preventDefault();navigate(position+1);}if(event.key==='ArrowLeft'){event.preventDefault();navigate(position-1);}});
 let touch;
 spread.addEventListener('touchstart',event=>{if(event.touches.length!==1||document.querySelector('dialog').open){touch=null;return;}touch={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
 spread.addEventListener('touchend',event=>{if(!touch||!opened)return;const end=event.changedTouches[0],dx=end.clientX-touch.x,dy=end.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6){if(event.cancelable)event.preventDefault();navigate(position+(dx<0?1:-1));}},{passive:false});
 spread.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
 // The cover opens only through its own click or keyboard activation.
})();
