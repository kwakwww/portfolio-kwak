'use strict';
(() => {
 const data = window.PORTFOLIO;
 const $ = (s, root = document) => root.querySelector(s);
 const $$ = (s, root = document) => [...root.querySelectorAll(s)];
 function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
 function safePath(value) { if (!value || typeof value !== 'string') return ''; if (/^(assets\/|\.\/assets\/)/.test(value) && !value.includes('..')) return value; try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
 function link(label, href, cls = '') { const a = el('a', cls, label); a.href = href; if (href.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } return a; }
 $('#year').textContent = new Date().getFullYear();
 $$('[data-name]').forEach(n => n.textContent = data.name);
 $('[data-intro]').textContent = data.intro; $('[data-about]').textContent = data.about;
 document.title = `${data.name} — Game VFX Artist`;
 data.tools.forEach(t => $('#tools').append(el('span', 'tool-tag', t)));
 if ($('#about-note')) $('#about-note').hidden = data.profileReady; if ($('#tool-note')) $('#tool-note').hidden = data.profileReady;
 $('#tool-status').textContent = data.profileReady ? 'PRODUCTION TOOLKIT' : '사용 기술 등록 예정';
 if ($('.gallery-note')) $('.gallery-note').hidden = data.projects.every(p => p.ready);
 function placeholder(title, theme = 'impact') {
  const box = el('div', `placeholder project-placeholder ${theme}`); box.append(el('span', 'placeholder-grid'));
  const caption = el('div', 'slot-label'); caption.append(el('span', 'eyebrow', 'MEDIA SLOT / NOT A FINISHED WORK'), el('strong', '', title), el('span', '', '영상 및 썸네일 등록 예정')); box.append(caption); return box;
 }
 function youtubeId(src) {
  try {
   const url = new URL(src);
   if (url.protocol !== 'https:') return '';
   let id = '';
   if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
   else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(?:embed|shorts)\/([^/]+)$/.exec(url.pathname)?.[1];
   return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : '';
  } catch { return ''; }
 }
 function youtubePlayer(id, title) {
  const wrap = el('div', 'video-shell youtube-shell');
  const image = el('img', 'youtube-poster'); image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; image.alt = `${title} 영상 썸네일`; image.width = 480; image.height = 360; image.decoding = 'async';
  image.addEventListener('error', () => { image.hidden = true; wrap.classList.add('no-poster'); });
  const play = el('button', 'video-launch'); play.type = 'button'; play.setAttribute('aria-label', `${title} YouTube 재생`); play.append(el('span', 'play-icon', '▶'), el('span', '', 'PLAY PORTFOLIO'), el('small', '', 'YouTube 영상 재생'));
  play.addEventListener('click', () => {
   const iframe = el('iframe', 'youtube-frame'); iframe.title = `${title} — YouTube 플레이어`; iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`; iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin'; wrap.replaceChildren(iframe); iframe.focus();
  });
  wrap.append(image, play);
  const component = el('div', 'youtube-component'); component.append(wrap, link('YouTube에서 보기 ↗', `https://www.youtube.com/watch?v=${id}`, 'youtube-external'));
  return component;
 }
 function videoPlayer(src, poster, title, captions) {
  const id = youtubeId(src); if (id) return youtubePlayer(id, title);
  const wrap = el('div', 'video-shell'); const video = el('video'); video.controls = true; video.preload = 'none'; video.playsInline = true; video.setAttribute('aria-label', title); video.src = src;
  if (safePath(poster)) video.poster = safePath(poster);
  if (safePath(captions)) { const track = el('track'); track.kind = 'captions'; track.src = safePath(captions); track.srclang = 'ko'; track.label = '한국어'; video.append(track); }
  const failure = el('p', 'video-error', '영상을 불러오지 못했습니다. 파일 경로와 MP4 인코딩을 확인해 주세요.'); failure.hidden = true; video.addEventListener('error', () => { failure.hidden = false; });
  const play = el('button', 'video-launch'); play.type = 'button'; play.setAttribute('aria-label', `${title} 재생`); play.append(el('span', 'play-icon', '▶'), el('span', '', 'PLAY VIDEO'), el('small', '', '영상 재생'));
  if (!safePath(poster)) wrap.classList.add('no-poster');
  play.addEventListener('click', async () => { try { await video.play(); play.hidden = true; } catch { failure.hidden = false; } }); video.addEventListener('play', () => { play.hidden = true; }); wrap.append(video, play, failure); return wrap;
 }
 if (safePath(data.showreel.src)) $('#hero-media').replaceChildren(videoPlayer(safePath(data.showreel.src), data.showreel.poster, '대표 쇼릴', data.showreel.captions));
 $('#reel-caption').textContent = data.showreel.caption;
 let activeFilter = 'All';
 function projectCard(p, index) {
  const card = el('button', 'project-card'); card.type = 'button'; card.setAttribute('aria-label', `${p.title} — ${p.ready ? '작품' : '등록 예정'} 상세 보기`); const art = el('div', 'project-art');
  if (safePath(p.thumbnail)) { const img = el('img'); img.src = safePath(p.thumbnail); img.alt = `${p.title} 썸네일`; img.loading = 'lazy'; img.decoding = 'async'; img.width = 960; img.height = 600; img.addEventListener('error', () => img.replaceWith(placeholder(p.title, p.theme)), { once: true }); art.append(img); } else art.append(placeholder(p.title, p.theme));
  art.append(el('span', 'project-index', String(index + 1).padStart(2, '0')), el('span', 'project-view', 'VIEW BREAKDOWN ↗'), el('span', `status-tag ${p.ready ? 'ready' : ''}`, p.ready ? 'PROJECT' : '준비 중'));
  const caption = el('div', 'project-caption'); const text = el('div'); text.append(el('span', 'project-category', p.category.toUpperCase()), el('h3', '', p.title), el('p', '', p.subtitle)); caption.append(text, el('span', 'project-arrow', '↗')); card.append(art, caption); card.addEventListener('click', () => openProject(p, card)); return card;
 }
 function renderProjects() { const selected = data.projects.filter(p => activeFilter === 'All' || p.category === activeFilter); $('#project-grid').replaceChildren(...selected.map(p => projectCard(p, data.projects.indexOf(p)))); $('.result-count').textContent = `${String(selected.length).padStart(2, '0')} ${selected.every(p => p.ready) ? 'WORKS' : 'PROJECT SLOTS'}`; $$('.filters button').forEach(b => { const active = b.dataset.filter === activeFilter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); }); }
 if ($('.filters') && $('#project-grid')) {
  ['All', ...new Set(data.projects.map(p => p.category))].forEach(filter => { const b = el('button', '', filter === 'All' ? 'All works' : filter); b.type = 'button'; b.dataset.filter = filter; b.addEventListener('click', () => { activeFilter = filter; renderProjects(); }); $('.filters').append(b); }); renderProjects();
 }
 const dialog = $('#project-dialog'); let opener;
 function openProject(p, button) {
  opener = button; $('#dialog-title').textContent = p.title; $('#dialog-category').textContent = p.category.toUpperCase(); $('#dialog-status').textContent = p.ready ? 'PROJECT' : '등록 예정 / 임시 콘텐츠';
  $('#dialog-media').replaceChildren(safePath(p.video) ? videoPlayer(safePath(p.video), p.thumbnail, p.title, p.captions) : placeholder('최종 영상 등록 예정', p.theme));
  const facts = [['ROLE', p.role], ['YEAR', p.year], ['LENGTH', p.duration]].filter(([,value]) => value);
  $('#project-facts').hidden = !facts.length;
  $('#project-facts').replaceChildren(...facts.map(([label,value])=>{const item=el('div');item.append(el('span','eyebrow',label),el('p','',value));return item;}));
  $('#dialog-intent').textContent = p.intent || '작품에서 전달하려는 게임플레이 정보, 분위기, 시각적 목표를 작성해 주세요.';
  $('#dialog-tools').replaceChildren(...(p.tools.length ? p.tools : ['사용 도구·기술 입력 예정']).map(t => el('span', 'tool-tag', t)));
  $('.dialog-notice').textContent = p.ready ? '작품의 담당 범위와 사용 리소스는 작성자가 제공한 내용입니다.' : '이 화면은 실제 완성 작품이 아닌 등록용 임시 콘텐츠입니다.';
  for (const [selector,value] of [['#dialog-intent',p.intent],['#dialog-tools',p.tools?.length]]) $(selector).closest('section').hidden = !value;
  $('.dialog-notice').hidden = p.ready;
  dialog.showModal(); document.body.classList.add('modal-open'); dialog.scrollTop = 0;
 }
 $('.dialog-close').addEventListener('click', () => dialog.close()); $('.dialog-return').addEventListener('click', () => dialog.close());
 dialog.addEventListener('close', () => { $$('video', dialog).forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); $('#dialog-media').replaceChildren(); document.body.classList.remove('modal-open'); if (opener?.isConnected) opener.focus(); });
 dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
 // 아트북이 기존 플레이어와 상세 모달을 공유합니다.
 window.PortfolioUI = { openProject, youtubeId, safePath };
 const contact = $('#contact-links'); const email = typeof data.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? data.email : '';
 if (email) { contact.append(link(email, `mailto:${email}`, 'contact-email')); const copy = el('button', 'copy-email', '이메일 주소 복사 ↗'); copy.type = 'button'; const status = el('span', 'copy-status'); status.setAttribute('role', 'status'); copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(email); status.textContent = '주소를 복사했습니다.'; } catch { status.textContent = `복사할 주소: ${email}`; } }); contact.append(copy, status); }
 else { contact.append(el('span', 'contact-pending', '이메일 등록 예정')); $('#contact-note').textContent = '지원 전에 content.js에 실제 이메일을 입력해 주세요.'; }
 const secondary = el('div', 'contact-secondary'); if (safePath(data.github)) secondary.append(link('GitHub ↗', safePath(data.github))); if (safePath(data.resume)) secondary.append(link('이력서 보기 ↗', safePath(data.resume))); contact.append(secondary);
 if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } }), { threshold: 0.08 }); $$('.section-heading, .about-grid, .contact-grid').forEach(n => { n.classList.add('reveal'); observer.observe(n); }); }
})();
