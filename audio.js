'use strict';
/* =====================================================================
   نظام الصوت: مؤثرات (Web Audio) + موسيقى مولَّدة + أصوات الحيوانات + نطق عربي
   ===================================================================== */
const TIME_SCALE = (() => { const v = parseFloat(new URLSearchParams(location.search).get('ts')); return isFinite(v) && v > 0 ? v : 1; })();
const sleep = ms => new Promise(r => setTimeout(r, ms * TIME_SCALE));

const Audio_ = {
  ctx: null, master: null, sfx: null, music: null, delay: null,
  soundOn: true, musicOn: true, voiceOn: true
};

function ensureAudio() {
  const A = Audio_;
  if (!A.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      A.ctx = new AC();
      A.master = A.ctx.createGain(); A.master.gain.value = 0.9; A.master.connect(A.ctx.destination);
      A.sfx = A.ctx.createGain(); A.sfx.gain.value = 0.7; A.sfx.connect(A.master);
      A.music = A.ctx.createGain(); A.music.gain.value = 0.16; A.music.connect(A.master);
      // صدى خفيف للموسيقى
      A.delay = A.ctx.createDelay(1); A.delay.delayTime.value = 0.28;
      const fb = A.ctx.createGain(); fb.gain.value = 0.28;
      const dl = A.ctx.createGain(); dl.gain.value = 0.35;
      A.delay.connect(fb); fb.connect(A.delay); A.delay.connect(dl); dl.connect(A.music);
    } catch (e) { A.ctx = null; return null; }
  }
  if (A.ctx.state === 'suspended') A.ctx.resume().catch(() => {});
  return A.ctx;
}

/* نغمة بسيطة بغلاف صوتي */
function tone(freq, t0, dur, { type = 'sine', vol = 0.3, attack = 0.01, dest = null, slideTo = null, delaySend = 0 } = {}) {
  const A = Audio_; const c = A.ctx; if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest || A.sfx);
  if (delaySend && A.delay) { const s = c.createGain(); s.gain.value = delaySend; g.connect(s); s.connect(A.delay); }
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function noiseBurst(t0, dur, { lo = 1500, hi = 4500, vol = 0.2 } = {}) {
  const A = Audio_; const c = A.ctx; if (!c) return;
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
  const s = c.createBufferSource(); s.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = (lo + hi) / 2; bp.Q.value = 0.8;
  const g = c.createGain(); g.gain.value = vol;
  s.connect(bp); bp.connect(g); g.connect(A.sfx); s.start(t0);
}
const N = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392, A4:440, B4:493.88, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880, B5:987.77, C6:1046.5, E6:1318.5, G6:1568, B6:1975.5 };

/* ---------- المؤثرات المطلوبة ---------- */
function playClickSound() {
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  tone(620, t, 0.09, { type: 'triangle', vol: 0.25, slideTo: 880 });
}
function playSuccessSound() {
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, t + i * 0.09, 0.28, { type: 'triangle', vol: 0.3 }));
  tone(N.E6, t + 0.36, 0.4, { type: 'sine', vol: 0.18 });
}
function playErrorSound() {          // لطيف جداً — ليس عقاباً
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  tone(N.G4, t, 0.16, { type: 'sine', vol: 0.16 });
  tone(N.E4, t + 0.14, 0.24, { type: 'sine', vol: 0.14 });
}
function playStarSound() {
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  [N.E6, N.G6, N.B6].forEach((f, i) => tone(f, t + i * 0.07, 0.35, { type: 'sine', vol: 0.18 }));
}
function playLevelCompleteSound() {
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  const seq = [[N.C5, 0], [N.C5, .14], [N.C5, .28], [N.G5, .42], [N.E5, .6], [N.G5, .74], [N.C6, .92]];
  seq.forEach(([f, d]) => { tone(f, t + d, 0.3, { type: 'triangle', vol: 0.28 }); tone(f / 2, t + d, 0.3, { type: 'sine', vol: 0.15 }); });
}
function playCelebrationSound() {
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(f, t + i * 0.07, 0.4, { type: 'triangle', vol: 0.22 }));
  for (let i = 0; i < 14; i++) noiseBurst(t + 0.2 + Math.random() * 1.2, 0.07, { lo: 1800, hi: 5200, vol: 0.13 });   // تصفيق
}
function playWhooshSound() {
  if (!Audio_.soundOn || !ensureAudio()) return; const t = Audio_.ctx.currentTime;
  tone(300, t, 0.2, { type: 'sine', vol: 0.12, slideTo: 900 });
}

/* ---------- أصوات الحيوانات (ملفات sounds/<id>.mp3) ---------- */
const animalAudio = {};
let currentAnimalAudio = null;
function preloadAnimalSounds(ids) {
  ids.forEach(id => {
    if (animalAudio[id]) return;
    const a = new Audio('sounds/' + id + '.mp3'); a.preload = 'auto'; a.volume = 0.9; animalAudio[id] = a;
  });
}
function stopAnimalSound() {
  if (currentAnimalAudio) { try { currentAnimalAudio.pause(); currentAnimalAudio.currentTime = 0; } catch (e) {} currentAnimalAudio = null; }
}
function playAnimalSound(id) {
  return new Promise(resolve => {
    if (!Audio_.soundOn) { resolve(); return; }
    ensureAudio();
    stopAnimalSound();
    let a = animalAudio[id]; if (!a) { preloadAnimalSounds([id]); a = animalAudio[id]; }
    let finished = false;
    const done = () => { if (finished) return; finished = true; a.onended = null; a.onerror = null; if (currentAnimalAudio === a) currentAnimalAudio = null; resolve(); };
    a.onended = done; a.onerror = done;
    try { a.currentTime = 0; } catch (e) {}
    currentAnimalAudio = a;
    duckMusic(true);
    const p = a.play(); if (p && p.catch) p.catch(done);
    setTimeout(() => { duckMusic(false); done(); }, 3200 * TIME_SCALE + 200);
    a.addEventListener('ended', () => duckMusic(false), { once: true });
  });
}

/* ---------- الموسيقى المولَّدة (تتغير حسب المنطقة) ---------- */
const MUSIC_STYLES = {
  farm:    { bpm: 104, scale: [0, 2, 4, 7, 9], root: 261.63, chords: [0, 5, 7, 0], wave: 'triangle', bass: 'sine' },
  forest:  { bpm: 88,  scale: [0, 2, 4, 7, 9], root: 220,    chords: [0, 7, 5, 7], wave: 'sine',     bass: 'sine' },
  desert:  { bpm: 92,  scale: [0, 1, 4, 5, 7, 8, 11], root: 233.08, chords: [0, 5, 0, 7], wave: 'triangle', bass: 'triangle' },
  sea:     { bpm: 76,  scale: [0, 2, 4, 6, 7, 9, 11], root: 261.63, chords: [0, 4, 7, 4], wave: 'sine', bass: 'sine' },
  cold:    { bpm: 82,  scale: [0, 4, 7, 9, 12], root: 293.66, chords: [0, 9, 5, 7], wave: 'sine', bass: 'sine' },
  kingdom: { bpm: 112, scale: [0, 2, 4, 7, 9, 12], root: 261.63, chords: [0, 7, 9, 5], wave: 'triangle', bass: 'triangle' },
  home:    { bpm: 100, scale: [0, 2, 4, 7, 9], root: 261.63, chords: [0, 5, 7, 5], wave: 'triangle', bass: 'sine' }
};
const Music = { timer: null, step: 0, next: 0, style: MUSIC_STYLES.home, name: 'home', running: false, pos: 2 };
function musicTick() {
  const c = Audio_.ctx; if (!c || !Music.running) return;
  const st = Music.style; const eighth = 60 / st.bpm / 2;
  while (Music.next < c.currentTime + 0.35) {
    const t = Music.next; const s = Music.step;
    const bar = Math.floor(s / 8) % st.chords.length; const chordSemis = st.chords[bar];
    const rootF = st.root * Math.pow(2, chordSemis / 12);
    if (s % 4 === 0) tone(rootF / 2, t, eighth * 3.2, { type: st.bass, vol: 0.5, attack: 0.02, dest: Audio_.music });
    if (s % 8 === 4) tone(rootF * 1.5 / 2, t, eighth * 2, { type: st.bass, vol: 0.28, attack: 0.02, dest: Audio_.music });
    if (Math.random() < 0.72) {
      Music.pos = Math.max(0, Math.min(st.scale.length * 2 - 1, Music.pos + (Math.floor(Math.random() * 5) - 2)));
      const deg = Music.pos; const oct = Math.floor(deg / st.scale.length); const semi = st.scale[deg % st.scale.length] + 12 * oct;
      const f = rootF * Math.pow(2, semi / 12);
      tone(f, t, eighth * (Math.random() < 0.3 ? 2.6 : 1.4), { type: st.wave, vol: 0.55, attack: 0.012, dest: Audio_.music, delaySend: 0.5 });
    }
    Music.step++; Music.next += eighth;
  }
}
function startMusic(zone) {
  if (!Audio_.musicOn) { Music.name = zone || Music.name; return; }
  if (!ensureAudio()) return;
  const name = MUSIC_STYLES[zone] ? zone : 'home';
  if (Music.running && Music.name === name) return;
  Music.name = name; Music.style = MUSIC_STYLES[name];
  if (!Music.running) { Music.running = true; Music.step = 0; Music.next = Audio_.ctx.currentTime + 0.1; Music.timer = setInterval(musicTick, 120); }
  Audio_.music.gain.cancelScheduledValues(Audio_.ctx.currentTime);
  Audio_.music.gain.setTargetAtTime(0.16, Audio_.ctx.currentTime, 0.3);
}
function stopMusic() {
  Music.running = false; clearInterval(Music.timer); Music.timer = null;
}
function duckMusic(on) {
  const c = Audio_.ctx; if (!c || !Audio_.music) return;
  Audio_.music.gain.setTargetAtTime(on ? 0.05 : 0.16, c.currentTime, 0.08);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (Audio_.ctx) Audio_.ctx.suspend().catch(() => {}); stopAnimalSound(); try { speechSynthesis.cancel(); } catch (e) {} }
  else if (Audio_.ctx) Audio_.ctx.resume().catch(() => {});
});

/* ---------- النطق العربي (SpeechSynthesis) ---------- */
const Speech = { voice: null, ready: false, hasArabic: null, token: 0 };
function loadVoices() {
  if (!('speechSynthesis' in window)) { Speech.hasArabic = false; return; }
  const vs = speechSynthesis.getVoices() || [];
  if (!vs.length) return;
  Speech.ready = true;
  const ar = vs.filter(v => /^ar/i.test(v.lang));
  Speech.hasArabic = ar.length > 0;
  Speech.voice = ar.find(v => /ar[-_]EG/i.test(v.lang)) || ar.find(v => /ar[-_]SA/i.test(v.lang)) || ar[0] || null;
}
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

function speakArabic(text, { rate = 0.82, pitch = 1.15 } = {}) {
  return new Promise(resolve => {
    const est = Math.min(5200, 600 + text.length * 85) * TIME_SCALE;
    if (!Audio_.voiceOn || !('speechSynthesis' in window)) { setTimeout(resolve, Math.min(est, 1400 * TIME_SCALE)); return; }
    if (Speech.ready && Speech.hasArabic === false) { setTimeout(resolve, Math.min(est, 1400 * TIME_SCALE)); return; }   // لا يوجد صوت عربي: لا نقرأ بصوت غير مناسب
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = Speech.voice ? Speech.voice.lang : 'ar-SA'; if (Speech.voice) u.voice = Speech.voice;
      u.rate = rate; u.pitch = pitch; u.volume = 1;
      let fin = false; const done = () => { if (fin) return; fin = true; resolve(); };
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
      setTimeout(done, est + 2500 * TIME_SCALE);
    } catch (e) { setTimeout(resolve, est); }
  });
}
function cancelSpeech() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {} }
