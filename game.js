'use strict';
/* =====================================================================
   قلب اللعبة: الحالة، الشاشات، الخريطة، المستويات، المؤثرات البصرية
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rand = n => Math.floor(Math.random() * n);
const pick1 = a => a[rand(a.length)];
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rand(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

/* ---------- حالة اللعبة ---------- */
const STORE_KEY = 'animal-friends-v1';
const gameState = {
  currentLevel: 1, currentRound: 1, stars: 0, totalStars: 0, score: 0,
  unlockedLevels: [1], soundEnabled: true, musicEnabled: true, voiceEnabled: true,
  currentActivity: null, levelStars: {}, seen: []
};
let inLevel = false;

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      unlockedLevels: gameState.unlockedLevels, levelStars: gameState.levelStars, seen: gameState.seen,
      soundEnabled: gameState.soundEnabled, musicEnabled: gameState.musicEnabled, voiceEnabled: gameState.voiceEnabled, score: gameState.score
    }));
  } catch (e) { /* التخزين غير متاح */ }
}
function loadProgress() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!d) return;
    if (Array.isArray(d.unlockedLevels) && d.unlockedLevels.length) gameState.unlockedLevels = d.unlockedLevels;
    if (d.levelStars && typeof d.levelStars === 'object') gameState.levelStars = d.levelStars;
    if (Array.isArray(d.seen)) gameState.seen = d.seen;
    ['soundEnabled', 'musicEnabled', 'voiceEnabled'].forEach(k => { if (typeof d[k] === 'boolean') gameState[k] = d[k]; });
    gameState.score = d.score || 0;
  } catch (e) { /* تجاهل */ }
}
const maxUnlocked = () => Math.max(...gameState.unlockedLevels);
function totalStarsNow() {
  let t = 0;
  for (let l = 1; l <= LEVELS.length; l++) {
    const best = gameState.levelStars[l] || 0;
    t += (inLevel && l === gameState.currentLevel) ? Math.max(best, gameState.stars) : best;
  }
  return t;
}
function updateStarsUI(bump) {
  gameState.totalStars = totalStarsNow();
  $$('.star-total').forEach(e => { e.textContent = gameState.totalStars; });
  if (bump) $$('.star-counter').forEach(c => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
}

/* ---------- الشاشات والخلفيات ---------- */
let currentScene = '';
function setScene(name) {
  const s = SCENES[name] || SCENES.home;
  if (currentScene === name) return; currentScene = name;
  const sc = $('#scenery'); sc.innerHTML = '';
  sc.style.background = `linear-gradient(${s.sky[0]}, ${s.sky[1]})`;
  const sun = el('div', 'sun', s.sun); sc.appendChild(sun);
  [[8, 14, 0], [30, 8, -25], [58, 18, -45]].forEach(([t, l, d], i) => { const c = el('div', 'cloud', '☁️'); c.style.top = t + '%'; c.style.left = l + '%'; c.style.animationDelay = d + 's'; c.style.animationDuration = (50 + i * 15) + 's'; sc.appendChild(c); });
  const h2 = el('div', 'hill h2'); h2.style.background = s.hill2; sc.appendChild(h2);
  const h1 = el('div', 'hill h1'); h1.style.background = s.hill1; sc.appendChild(h1);
  const spots = [[4, 22], [16, 8], [30, 24], [48, 10], [64, 26], [80, 9], [92, 22]];
  spots.forEach(([l, b], i) => { const d = el('div', 'deco', s.deco[i % s.deco.length]); d.style.left = l + '%'; d.style.bottom = b + '%'; d.style.animationDelay = (i * .6) + 's'; sc.appendChild(d); });
}
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  inLevel = (id === 'screen-game');
  updateStarsUI();
}

/* ---------- الشخصية ---------- */
let moodTimer = null;
function setMascot(mood, ms) {
  $$('.mascot').forEach(m => { m.dataset.mood = mood; });
  clearTimeout(moodTimer);
  if (ms) moodTimer = setTimeout(() => setMascot('happy'), ms * TIME_SCALE);
}

/* ---------- المؤثرات البصرية ---------- */
const fx = () => $('#fx');
function sparkle(x, y, n = 14, set = ['✨', '⭐', '💫', '🌟']) {
  for (let i = 0; i < n; i++) {
    const s = el('span', 'spark', pick1(set)); s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.fontSize = (18 + rand(22)) + 'px';
    fx().appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 60 + rand(110);
    const an = s.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1.3) rotate(${rand(360)}deg)`, opacity: 0 }], { duration: (700 + rand(500)) * TIME_SCALE + 40, easing: 'ease-out' });
    an.onfinish = () => s.remove();
  }
}
function sparkleAt(e, n) { if (!e) return; const r = e.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, n); }
function confetti(n = 50) {
  const cols = ['#ff6fa5', '#ffd54a', '#4cc45a', '#3d9bff', '#ff9f1c', '#b86bff'];
  for (let i = 0; i < n; i++) {
    const c = el('div', 'conf'); c.style.left = rand(100) + '%'; c.style.background = pick1(cols); fx().appendChild(c);
    const dur = (1400 + rand(1200)) * TIME_SCALE + 60;
    const an = c.animate([{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: `translate(${rand(160) - 80}px, ${window.innerHeight + 40}px) rotate(${rand(900)}deg)`, opacity: .9 }], { duration: dur, delay: rand(300) * TIME_SCALE, easing: 'cubic-bezier(.3,.6,.7,1)' });
    an.onfinish = () => c.remove();
  }
}
function flyStar(fromEl) {
  const to = $('.screen.active .star-counter') || $('#hud-stars'); if (!to || !fromEl) return Promise.resolve();
  const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
  const s = el('div', 'flystar', '⭐'); s.style.left = (a.left + a.width / 2) + 'px'; s.style.top = (a.top + a.height / 2) + 'px'; fx().appendChild(s);
  return new Promise(res => {
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    const an = s.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 1, offset: .25 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.6)`, opacity: 1 }], { duration: 1000 * TIME_SCALE + 60, easing: 'ease-in-out' });
    an.onfinish = () => { s.remove(); res(); };
  });
}

/* ---------- الكلام والرسالة ---------- */
let roundToken = 0, speechSeq = 0, lastSaid = '';
function setPrompt(text) { $('#prompt-text').textContent = text; lastSaid = text; }
/* تُرجع true إذا اكتمل الكلام دون مقاطعة وبقيت الجولة نفسها */
async function say(text, { speak = true } = {}) {
  const my = ++speechSeq, tok = roundToken;
  setPrompt(text);
  if (speak) await speakArabic(text);
  return my === speechSeq && tok === roundToken;
}
const praise = () => pick1(PRAISE);
const tryAgain = () => pick1(TRY_AGAIN);
const nameOf = id => `${ANIMALS[id].art} ${ANIMALS[id].name}`;

/* ---------- مكونات ---------- */
let svgUid = 0;
function animalImg(id) {
  const a = ANIMALS[id]; const d = el('div', 'apic');
  if (a.svg) d.innerHTML = SVGS[id].replace(/__ID__/g, 'u' + (++svgUid));
  else { const im = new Image(); im.src = 'images/' + id + '.png'; im.alt = ''; im.draggable = false; d.appendChild(im); }
  return d;
}
function animalCard(id, { label = true } = {}) {
  const b = el('button', 'card'); b.dataset.id = id; b.setAttribute('aria-label', ANIMALS[id].name);
  b.appendChild(animalImg(id));
  if (label) b.appendChild(el('span', 'lbl', ANIMALS[id].name));
  return b;
}
function speakerButton(mystery) {
  const b = el('button', 'speaker' + (mystery ? ' mystery' : ''), mystery ? '<span class="q">❓</span>' : '🔊');
  b.setAttribute('aria-label', 'إعادة الصوت'); return b;
}

/* ---------- التخطيط: أكبر حجم يناسب n عنصراً داخل صندوق ---------- */
let roList = [];
function fitGrid(n, W, H, gap, ar, maxW, minW) {
  let best = 0, bc = 1;
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c);
    const w = Math.min((W - gap * (c - 1)) / c, (H - gap * (r - 1)) / (r * ar), maxW);
    if (w > best) { best = w; bc = c; }
  }
  return { w: Math.max(minW, Math.floor(best)), cols: bc };
}
function autoGrid(box, grid, n, { ar = 1.12, gap = 14, maxW = 300, minW = 56 } = {}) {
  const apply = () => {
    const W = box.clientWidth - 6, H = box.clientHeight - 6; if (W <= 0 || H <= 0) return;
    const g = Math.max(8, Math.min(gap, Math.floor(W / 40)));
    const f = fitGrid(n, W, H, g, ar, maxW, minW);
    grid.style.setProperty('--w', f.w + 'px'); grid.style.setProperty('--ar', ar); grid.style.setProperty('--gap', g + 'px');
    grid.style.width = (f.cols * f.w + (f.cols - 1) * g + 2) + 'px';
  };
  apply();
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(apply); ro.observe(box); roList.push(ro); }
}
function newStage(cls = '') { const d = el('div', 'stage-in ' + cls); $('#stage').appendChild(d); return d; }
function clearStage() { roList.forEach(r => r.disconnect()); roList = []; $('#stage').innerHTML = ''; }

/* ---------- السحب والإفلات (Pointer Events) + بديل بالنقر ---------- */
function dragGroup({ items, zones, drop, onGrab }) {
  let selected = null;
  const zoneAt = (x, y) => zones().find(z => { const r = z.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
  const select = it => { if (selected) selected.classList.remove('sel'); selected = it; if (it) it.classList.add('sel'); };
  items.forEach(it => {
    let sx = 0, sy = 0, moved = false, active = false;
    it.classList.add('drag');
    it.addEventListener('pointerdown', e => {
      if (it.classList.contains('done')) return;
      e.preventDefault(); active = true; moved = false; sx = e.clientX; sy = e.clientY;
      try { it.setPointerCapture(e.pointerId); } catch (_) { }
      it.classList.add('dragging'); ensureAudio(); playClickSound();
      if (onGrab) onGrab(it);
    });
    it.addEventListener('pointermove', e => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 8) moved = true;
      if (moved) {
        it.style.transform = `translate(${dx}px, ${dy}px) scale(1.12) rotate(${Math.max(-8, Math.min(8, dx / 25))}deg)`;
        const z = zoneAt(e.clientX, e.clientY); zones().forEach(q => q.classList.toggle('over', q === z));
      }
    });
    const end = e => {
      if (!active) return; active = false; it.classList.remove('dragging'); zones().forEach(q => q.classList.remove('over'));
      if (!moved) { it.style.transform = ''; select(selected === it ? null : it); return; }       // نقرة = تحديد
      const z = zoneAt(e.clientX, e.clientY);
      if (z && drop(it, z)) { select(null); return; }
      it.style.transition = 'transform .28s'; it.style.transform = ''; setTimeout(() => { it.style.transition = ''; }, 300);
    };
    it.addEventListener('pointerup', end); it.addEventListener('pointercancel', end);
  });
  zones().forEach(z => z.addEventListener('click', () => {
    if (!selected || selected.classList.contains('done')) return;
    const it = selected; select(null);
    if (!drop(it, z)) { it.classList.remove('shake'); void it.offsetWidth; it.classList.add('shake'); }
  }));
}

/* ---------- محرك الجولات ---------- */
let levelUsed = new Set(), lastPos = -1;
function beginRound() {
  roundToken++; speechSeq++; stopAnimalSound(); cancelSpeech(); setMascot('happy');
  const ctx = { tok: roundToken, wrong: 0, done: false, starred: false, hint: null, onReplay: null, alive() { return this.tok === roundToken; } };
  window.__ctx = ctx; return ctx;
}
function pickOptions(target, pool, n, key = 'sg') {
  const cand = shuffle(pool.filter(id => id !== target));
  const chosen = [target];
  for (const id of cand) { if (chosen.length >= n) break; if (chosen.every(c => ANIMALS[c][key] == null || ANIMALS[c][key] !== ANIMALS[id][key])) chosen.push(id); }
  for (const id of cand) { if (chosen.length >= n) break; if (!chosen.includes(id)) chosen.push(id); }
  let opts = shuffle(chosen);
  if (opts.length > 1 && opts.indexOf(target) === lastPos) { const j = (lastPos + 1 + rand(opts.length - 1)) % opts.length; [opts[lastPos], opts[j]] = [opts[j], opts[lastPos]]; }
  lastPos = opts.indexOf(target);
  return opts;
}
function pickTarget(list) {
  let cand = list.filter(id => !levelUsed.has(id)); if (!cand.length) { levelUsed.clear(); cand = list.slice(); }
  const t = pick1(cand); levelUsed.add(t); return t;
}

function startGame() {
  ensureAudio(); primeAnimalSounds();
  startMusic('home');
  setMascot('celebrate');
  const old = $('.speech-bubble', $('#screen-start')); if (old) old.remove();
  const b = el('div', 'speech-bubble', 'مرحبًا يا صديقي! هيا نتعرف على الحيوانات!');
  $('.start-center').insertBefore(b, $('#start-mascot'));
  const tok = ++speechSeq;
  speakArabic('مرحبًا يا صديقي! هيا نتعرف على الحيوانات!').then(() => sleep(300)).then(() => { if (tok === speechSeq || true) { b.remove(); showMap(); } });
  playCelebrationSound();
}

function startLevel(n) {
  if (!gameState.unlockedLevels.includes(n)) return;
  gameState.currentLevel = n; gameState.currentRound = 1; gameState.stars = 0; levelUsed = new Set(); lastPos = -1;
  const L = LEVELS[n - 1];
  setScene(L.zone); startMusic(L.zone === 'kingdom' ? 'kingdom' : L.zone);
  show('screen-game'); updateProgress(); startRound();
}

function generateQuestion(spec, ctx) {
  const act = activities[spec.type];
  return { act, q: act.generate(spec, ctx) };
}
async function startRound() {
  const ctx = beginRound();
  const level = LEVELS[gameState.currentLevel - 1];
  const spec = level.rounds[gameState.currentRound - 1];
  gameState.currentActivity = spec.type;
  updateProgress(); clearStage();
  setPrompt('…');
  const { act, q } = generateQuestion(spec, ctx);
  if (q.intro) {
    for (const id of q.intro) {
      if (!gameState.seen.includes(id)) { await showIntro(id, ctx); if (!ctx.alive()) return; }
    }
  }
  clearStage();
  act.render(q, ctx);
}

/* تعريف حيوان جديد قبل اختباره */
function showIntro(id, ctx) {
  return new Promise(resolve => {
    const A = ANIMALS[id]; const st = newStage('intro'); clearTimeout(window.__introTimer);
    const big = el('div', 'big-animal'); big.appendChild(animalImg(id)); st.appendChild(big);
    st.appendChild(el('div', 'info', `${A.def} ${A.info}`));
    const nb = el('button', 'btn-big small', '<span class="ico">▶️</span> هيا'); st.appendChild(nb);
    let finished = false;
    const finish = () => { if (finished) return; finished = true; clearTimeout(window.__introTimer); if (!gameState.seen.includes(id)) { gameState.seen.push(id); saveProgress(); } resolve(); };
    nb.onclick = () => { playClickSound(); finish(); };
    ctx.onReplay = () => { introSeq(); };
    const introSeq = async () => {
      setMascot('point');
      if (!await say(`${A.art} ${A.name}.`)) return;
      setMascot('listen'); big.classList.add('hop'); await playAnimalSound(id); if (!ctx.alive() || finished) return;
      setMascot('happy'); if (!await say(`${A.def} ${A.info}.`)) return;
      if (finished) return; setMascot('think');
      if (!await say('هل تستطيع أن تجده؟')) return;
      window.__introTimer = setTimeout(finish, 900 * TIME_SCALE);
    };
    introSeq();
  });
}

/* ---------- الإجابات ---------- */
async function awardStar(ctx, fromEl) {
  if (ctx.starred) return; ctx.starred = true;
  gameState.stars = Math.min(5, gameState.stars + 1); gameState.score += 10;
  gameState.levelStars[gameState.currentLevel] = Math.max(gameState.levelStars[gameState.currentLevel] || 0, gameState.stars);
  saveProgress(); playStarSound();
  await flyStar(fromEl); updateStarsUI(true); updateProgress();
}
function checkAnswer(ok, ctx, elx, opts) { return ok ? handleCorrectAnswer(ctx, elx, opts) : handleWrongAnswer(ctx, elx, opts); }

async function handleCorrectAnswer(ctx, elx, { text, sound, final = true } = {}) {
  if (ctx.done) return; if (final) ctx.done = true;
  playSuccessSound(); sparkleAt(elx); setMascot('celebrate');
  if (elx) { elx.classList.remove('wrong', 'glow', 'dim'); elx.classList.add('correct'); }
  if (final) { confetti(36); awardStar(ctx, elx); }
  if (sound) { await playAnimalSound(sound); if (!ctx.alive()) return; }
  await say(text || praise());
  if (!final) { setMascot('happy'); return; }
  await sleep(700); if (!ctx.alive()) return;
  nextRound();
}
async function handleWrongAnswer(ctx, elx, { text, after } = {}) {
  if (ctx.done) return; ctx.wrong++;
  playErrorSound(); setMascot('think', 2200);
  if (elx) { elx.classList.remove('wrong'); void elx.offsetWidth; elx.classList.add('wrong'); setTimeout(() => { elx.classList.remove('wrong'); elx.classList.add('dim'); }, 480 * TIME_SCALE + 20); }
  if (ctx.wrong >= 2 && ctx.hint) ctx.hint();
  const ok = await say(text || tryAgain());
  if (ok && after) await after();
}
function nextRound() {
  if (gameState.currentRound < 5) { gameState.currentRound++; startRound(); } else completeLevel();
}
function updateProgress() {
  const L = gameState.currentLevel, R = gameState.currentRound;
  $('#hud-level').textContent = `المستوى ${L} من ${LEVELS.length}`;
  $('#hud-round').textContent = `الجولة ${R} من 5`;
  $$('#hud-progress i').forEach((i, k) => { i.classList.toggle('on', k < gameState.stars || k < R - 1); i.classList.toggle('cur', k === R - 1 && !(k < gameState.stars)); });
  updateStarsUI();
}

/* ---------- نهاية المستوى ---------- */
function unlockNextLevel() {
  const n = gameState.currentLevel + 1;
  if (n <= LEVELS.length && !gameState.unlockedLevels.includes(n)) gameState.unlockedLevels.push(n);
  saveProgress();
}
function completeLevel() {
  cancelSpeech(); stopAnimalSound(); roundToken++;
  unlockNextLevel();
  gameState.levelStars[gameState.currentLevel] = Math.max(gameState.levelStars[gameState.currentLevel] || 0, gameState.stars);
  saveProgress();
  if (gameState.currentLevel >= LEVELS.length) showFinal(); else showReward();
}
async function showReward() {
  show('screen-level');
  const row = $('#lc-animals'); row.innerHTML = '';
  shuffle(ALL_IDS).slice(0, 5).forEach((id, i) => { const a = animalImg(id); a.style.animationDelay = (i * .12) + 's'; row.appendChild(a); });
  const sr = $('#lc-stars'); sr.innerHTML = ''; for (let i = 0; i < 5; i++) sr.appendChild(el('span', 'st', '⭐'));
  $('#lc-title').textContent = '🎉 أحسنت!';
  setMascot('celebrate'); playLevelCompleteSound(); confetti(70);
  const tok = ++speechSeq;
  const stars = $$('.st', sr);
  for (let i = 0; i < Math.min(5, gameState.stars); i++) { await sleep(380); stars[i].classList.add('on'); playStarSound(); }
  await sleep(300);
  playCelebrationSound();
  speakArabic('أحسنت! لقد أنهيت المستوى!');
  updateStarsUI();
}
async function showFinal() {
  show('screen-final'); setScene('kingdom');
  const row = $('#fin-animals'); row.innerHTML = '';
  ['dog', 'cat', 'rabbit', 'lion', 'elephant', 'tiger', 'frog', 'fish'].forEach((id, i) => { const a = animalImg(id); a.style.animationDelay = (i * .1) + 's'; row.appendChild(a); });
  setMascot('celebrate'); playLevelCompleteSound(); confetti(120); updateStarsUI();
  await sleep(1200); playCelebrationSound();
  speakArabic('رائع! لقد أصبحت بطل أصدقاء الحيوانات!');
}

/* ---------- الخريطة ---------- */
function showMap() {
  cancelSpeech(); stopAnimalSound(); roundToken++;
  setScene('home'); startMusic('home'); show('screen-map'); renderMap(); setMascot('happy');
}
function renderMap() {
  const board = $('#mapboard'); board.innerHTML = '';
  const portrait = window.innerHeight > window.innerWidth * 1.05;
  board.classList.toggle('portrait', portrait);
  const tp = (x, y) => portrait ? [100 - y, x] : [x, y];
  const mx = maxUnlocked();
  const zoneFirst = {}; LEVELS.forEach(L => { if (zoneFirst[L.zone] == null) zoneFirst[L.zone] = L.n; });
  MAP_ZONES.forEach(z => {
    let x = z.x, y = z.y, w = z.w, h = z.h;
    if (portrait) { x = 100 - z.y - z.h; y = z.x; w = z.h; h = z.w; }
    const d = el('div', 'zone' + (zoneFirst[z.zone] > mx ? ' locked' : ''));
    d.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%;--c1:${z.c1};--c2:${z.c2}`;
    d.appendChild(el('div', 'zl', `${ZONES[z.zone].icon} ${ZONES[z.zone].name}`));
    z.deco.forEach((e, i) => { const q = el('span', 'zd', e); q.style.left = (14 + (i * 31) % 70) + '%'; q.style.top = (34 + ((i * 37) % 52)) + '%'; d.appendChild(q); });
    board.appendChild(d);
  });
  const pts = MAP_NODES.map(([x, y]) => tp(x, y));
  const svg = `<svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.2 2.4" vector-effect="non-scaling-stroke" style="stroke-width:6px" opacity=".9"/></svg>`;
  board.insertAdjacentHTML('beforeend', svg);
  LEVELS.forEach((L, i) => {
    const [x, y] = pts[i]; const unlocked = gameState.unlockedLevels.includes(L.n);
    const best = gameState.levelStars[L.n] || 0;
    const done = best >= 5 || (unlocked && L.n < mx);
    const cur = unlocked && L.n === mx && !(best >= 5 && L.n === LEVELS.length);
    const n = el('button', 'node ' + (!unlocked ? 'locked' : (cur ? 'cur' : (done ? 'done' : ''))));
    n.style.left = x + '%'; n.style.top = y + '%'; n.dataset.level = L.n; n.setAttribute('aria-label', 'المستوى ' + L.n);
    n.innerHTML = unlocked ? `<span class="nnum">${L.n}</span><span class="nico">${L.icon}</span>${best ? `<span class="nstars">${'★'.repeat(best)}</span>` : ''}`
                           : `<span class="nlock">🔒</span><span class="nnum">${L.n}</span>`;
    n.onclick = () => {
      ensureAudio();
      if (!unlocked) { playErrorSound(); n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); speakArabic('هذه المرحلة مقفلة. أكمل المراحل السابقة!'); return; }
      playClickSound(); startLevel(L.n);
    };
    board.appendChild(n);
  });
}

/* ---------- الإعدادات ---------- */
function applyAudioSettings() {
  Audio_.soundOn = gameState.soundEnabled; Audio_.musicOn = gameState.musicEnabled; Audio_.voiceOn = gameState.voiceEnabled;
  const snd = gameState.soundEnabled ? '🔊' : '🔇';
  ['#start-sound', '#game-sound'].forEach(s => { const b = $(s); b.textContent = snd; b.classList.toggle('off', !gameState.soundEnabled); });
  $('#start-music').classList.toggle('off', !gameState.musicEnabled);
  $('#set-sound').dataset.on = gameState.soundEnabled ? 1 : 0;
  $('#set-music').dataset.on = gameState.musicEnabled ? 1 : 0;
  $('#set-voice').dataset.on = gameState.voiceEnabled ? 1 : 0;
  if (!gameState.soundEnabled) stopAnimalSound();
  if (!gameState.voiceEnabled) cancelSpeech();
  if (!gameState.musicEnabled) stopMusic(); else if (Audio_.ctx) startMusic(Music.name);
}
function toggleSetting(k) { gameState[k] = !gameState[k]; applyAudioSettings(); saveProgress(); ensureAudio(); playClickSound(); }
function resetGame() {
  gameState.unlockedLevels = [1]; gameState.levelStars = {}; gameState.seen = []; gameState.score = 0; gameState.stars = 0;
  saveProgress(); updateStarsUI();
  $('#modal-settings').hidden = true; roundToken++; cancelSpeech();
  setScene('home'); show('screen-start'); setMascot('happy');
}

let primed = false;
function primeAnimalSounds() {
  if (primed) return; primed = true;
  ALL_IDS.forEach(id => {
    const a = animalAudio[id]; if (!a) return;
    try { a.muted = true; const p = a.play(); const back = () => { a.pause(); a.currentTime = 0; a.muted = false; }; if (p && p.then) p.then(back).catch(() => { a.muted = false; }); else back(); } catch (e) { a.muted = false; }
  });
}

function buildStartAnimals() {
  const spots = [['dog', 5, 58], ['cat', 17, 70], ['rabbit', 3, 26], ['cow', 19, 8], ['lion', 80, 56], ['elephant', 68, 68], ['monkey', 86, 24], ['giraffe', 70, 6]];
  const box = $('#start-animals');
  spots.forEach(([id, l, t], i) => { const d = animalImg(id); d.classList.add('sa'); d.style.left = l + '%'; d.style.top = t + '%'; d.style.animationDelay = (i * .35) + 's'; box.appendChild(d); });
}

function init() {
  loadProgress();
  ['#start-mascot', '#game-mascot', '#lc-mascot', '#fin-mascot', '#map-mascot'].forEach(s => { $(s).innerHTML = mascotSVG(); });
  preloadAnimalSounds(ALL_IDS);
  // تحميل مسبق للصور
  ALL_IDS.forEach(id => { if (!ANIMALS[id].svg) { const i = new Image(); i.src = 'images/' + id + '.png'; } });
  setScene('home'); buildStartAnimals(); applyAudioSettings(); updateStarsUI();

  document.addEventListener('pointerdown', () => { ensureAudio(); }, { passive: true });
  document.addEventListener('contextmenu', e => e.preventDefault());

  $('#btn-start').onclick = () => { playClickSound(); startGame(); };
  $('#start-sound').onclick = () => toggleSetting('soundEnabled');
  $('#game-sound').onclick = () => toggleSetting('soundEnabled');
  $('#start-music').onclick = () => toggleSetting('musicEnabled');
  $('#start-help').onclick = () => { ensureAudio(); playClickSound(); $('#modal-help').hidden = false; speakArabic('اسمع صوت الحيوان، ثم اضغط على الحيوان الصحيح!'); };
  $('#help-close').onclick = () => { playClickSound(); $('#modal-help').hidden = true; cancelSpeech(); };
  $('#map-home').onclick = () => { playClickSound(); setScene('home'); show('screen-start'); };
  $('#map-settings').onclick = $('#game-settings').onclick = () => { ensureAudio(); playClickSound(); $('#modal-settings').hidden = false; };
  $('#set-close').onclick = () => { playClickSound(); $('#modal-settings').hidden = true; };
  $('#set-sound').onclick = () => toggleSetting('soundEnabled');
  $('#set-music').onclick = () => toggleSetting('musicEnabled');
  $('#set-voice').onclick = () => toggleSetting('voiceEnabled');
  $('#game-map').onclick = () => { playClickSound(); showMap(); };
  $('#lc-next').onclick = () => { playClickSound(); cancelSpeech(); startLevel(Math.min(LEVELS.length, gameState.currentLevel + 1)); };
  $('#lc-map').onclick = () => { playClickSound(); showMap(); };
  $('#fin-map').onclick = () => { playClickSound(); showMap(); };
  $('#fin-again').onclick = () => { playClickSound(); resetGame(); };
  $('#prompt-replay').onclick = () => { ensureAudio(); playClickSound(); const c = window.__ctx; if (c && c.onReplay) c.onReplay(); else if (lastSaid) say(lastSaid); };

  // زر إعادة التقدم: ضغط مطوّل
  const rb = $('#set-reset'); let holdT = null;
  const hs = e => { e.preventDefault(); rb.classList.add('holding'); holdT = setTimeout(() => { rb.classList.remove('holding'); resetGame(); }, 1500); };
  const he = () => { clearTimeout(holdT); rb.classList.remove('holding'); };
  rb.addEventListener('pointerdown', hs); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => rb.addEventListener(ev, he));

  window.addEventListener('resize', () => { if ($('#screen-map').classList.contains('active')) renderMap(); });
  window.AF = { gameState, startLevel, showMap, activities, LEVELS, ANIMALS };
}
