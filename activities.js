'use strict';
/* =====================================================================
   الأنشطة: كل نشاط له generate (يولّد السؤال عشوائياً) و render (يعرضه)
   ===================================================================== */
const activities = {};
const withSound = ids => ids.filter(id => true);
const habVerb = a => a.fem ? 'تعيش' : 'يعيش';

/* ---------- 1) اسمع واختر (listenAndChoose / chooseAnimal / الصوت الغامض) ---------- */
activities.listen = {
  generate(spec) {
    const target = pickTarget(spec.targets);
    return { target, opts: pickOptions(target, spec.from, spec.options, 'sg'), mystery: !!spec.mystery, intro: [target] };
  },
  render(q, ctx) {
    const st = newStage();
    const top = el('div', 'top-zone'); const sp = speakerButton(q.mystery); top.appendChild(sp);
    const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.append(top, box);
    const btns = q.opts.map(id => { const b = animalCard(id); grid.appendChild(b); return b; });
    autoGrid(box, grid, q.opts.length, { ar: 1.15 });
    const correct = btns[q.opts.indexOf(q.target)]; correct.dataset.ans = 1;
    const playT = async () => { sp.classList.add('playing'); await playAnimalSound(q.target); sp.classList.remove('playing'); };
    sp.onclick = () => { if (!ctx.done) playT(); };
    ctx.onReplay = playT;
    ctx.hint = () => { correct.classList.add('glow'); setMascot('point', 4000); };
    btns.forEach(b => b.onclick = () => {
      if (ctx.done || b.classList.contains('dim')) return; playClickSound();
      const id = b.dataset.id;
      if (id === q.target) handleCorrectAnswer(ctx, b, { text: `${praise()} ${nameOf(id)}` });
      else handleWrongAnswer(ctx, b, { text: `${nameOf(id)}. ${tryAgain()}`, after: playT });
    });
    (async () => {
      setMascot('listen');
      if (!await say(q.mystery ? 'صوت غامض! استمع جيدًا!' : 'استمع جيدًا!')) return;
      await playT(); if (ctx.done || !ctx.alive()) return;
      setMascot('think');
      await say(q.mystery ? 'من صاحب الصوت الغامض؟' : 'من صاحب هذا الصوت؟');
    })();
  }
};

/* ---------- 2) من الحيوان إلى الصوت ---------- */
activities.toSound = {
  generate(spec) {
    const target = pickTarget(spec.pool);
    return { target, opts: pickOptions(target, spec.pool, spec.options, 'sg'), demo: spec.demo, intro: [target] };
  },
  render(q, ctx) {
    const A = ANIMALS[q.target];
    const st = newStage();
    const top = el('div', 'top-zone'); top.style.height = 'clamp(110px, 30vh, 280px)';
    const pic = el('div', 'big-animal'); pic.style.cssText = 'height:100%;aspect-ratio:1'; pic.appendChild(animalImg(q.target)); top.appendChild(pic);
    const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.append(top, box);
    const btns = q.opts.map((id, i) => { const b = el('button', 'sbtn', `<span class="n">${i + 1}</span><span class="sp">🔊</span>`); b.dataset.id = id; b.setAttribute('aria-label', 'صوت ' + (i + 1)); grid.appendChild(b); return b; });
    autoGrid(box, grid, q.opts.length, { ar: 1, maxW: 190 });
    const correct = btns[q.opts.indexOf(q.target)]; correct.dataset.ans = 1;
    const playT = async () => { pic.classList.add('hop'); await playAnimalSound(q.target); pic.classList.remove('hop'); };
    ctx.onReplay = playT;
    ctx.hint = () => { correct.classList.add('glow'); setMascot('point', 4000); };
    let busy = false;
    btns.forEach(b => b.onclick = async () => {
      if (ctx.done || busy || b.classList.contains('dim')) return; busy = true; playClickSound();
      b.classList.add('playing'); await playAnimalSound(b.dataset.id); b.classList.remove('playing'); busy = false;
      if (ctx.done || !ctx.alive()) return;
      if (b.dataset.id === q.target) handleCorrectAnswer(ctx, b, { text: `${praise()} هذا صوت ${A.def}` });
      else handleWrongAnswer(ctx, b, { text: tryAgain() });
    });
    (async () => {
      setMascot('point');
      if (q.demo) {
        if (!await say(`${A.art} ${A.name}. استمع لصوته!`)) return;
        await playT(); if (!ctx.alive()) return; setMascot('think');
        await say('أي زر له الصوت نفسه؟ اضغط واستمع!');
      } else {
        setMascot('think');
        await say(`هل تعرف صوت ${A.def}؟ اضغط الأزرار واستمع!`);
      }
    })();
  }
};

/* ---------- 3) أين يعيش؟ ---------- */
function habCard(h) {
  const H = HABITATS[h]; const b = el('button', 'hab', `<span class="hi">${H.icon}</span><span>${H.name}</span>`);
  b.dataset.hab = h; b.style.setProperty('--c1', H.c1); b.style.setProperty('--c2', H.c2); return b;
}
activities.where = {
  generate(spec) {
    const list = ALL_IDS.filter(id => ANIMALS[id].habQ && spec.habitats.includes(ANIMALS[id].habitat));
    const target = pickTarget(list);
    return { target, habs: shuffle(spec.habitats), intro: [target] };
  },
  render(q, ctx) {
    const A = ANIMALS[q.target]; const H = HABITATS[A.habitat];
    const st = newStage();
    const top = el('div', 'top-zone'); top.style.height = 'clamp(100px, 28vh, 260px)';
    const pic = el('div', 'big-animal'); pic.style.cssText = 'height:100%;aspect-ratio:1'; pic.appendChild(animalImg(q.target));
    top.append(pic, el('div', 'bigname', A.name));
    const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.append(top, box);
    const btns = q.habs.map(h => { const b = habCard(h); grid.appendChild(b); return b; });
    autoGrid(box, grid, btns.length, { ar: 1.0, maxW: 250 });
    const correct = btns.find(b => b.dataset.hab === A.habitat); correct.dataset.ans = 1;
    const ask = () => say(`أين ${habVerb(A)} ${A.def}؟`);
    ctx.onReplay = ask;
    ctx.hint = () => { correct.classList.add('glow'); setMascot('point', 4000); };
    btns.forEach(b => b.onclick = () => {
      if (ctx.done || b.classList.contains('dim')) return; playClickSound();
      const hh = HABITATS[b.dataset.hab];
      if (b.dataset.hab === A.habitat) {
        pic.classList.add('hop');
        handleCorrectAnswer(ctx, b, { sound: q.target, text: `${praise()} ${A.def} ${habVerb(A)} في ${H.inn}` });
      } else handleWrongAnswer(ctx, b, { text: `${A.def} لا ${habVerb(A).replace('ي', A.fem ? 'ت' : 'ي')} في ${hh.inn}. ${tryAgain()}` });
    });
    setMascot('think'); ask();
  }
};

/* ---------- 4) ضع الحيوان في مكانه (سحب وإفلات) ---------- */
activities.sort = {
  generate(spec) {
    const habs = spec.habitats.slice(0, spec.count);
    const animals = habs.map(h => pick1(ALL_IDS.filter(id => ANIMALS[id].habQ && ANIMALS[id].habitat === h)));
    return { habs: shuffle(habs), animals: shuffle(animals) };
  },
  render(q, ctx) {
    const st = newStage();
    const dual = el('div', 'dual'); dual.style.flexDirection = 'column';
    const zbox = el('div', 'opts'), zgrid = el('div', 'grid'); zbox.appendChild(zgrid);
    const tbox = el('div', 'opts'), tgrid = el('div', 'grid'); tbox.appendChild(tgrid);
    dual.append(zbox, tbox); st.appendChild(dual);
    const zones = q.habs.map(h => { const z = habCard(h); z.classList.add('zone-h'); z.insertAdjacentHTML('beforeend', '<div class="got"></div>'); zgrid.appendChild(z); return z; });
    const items = q.animals.map(id => { const d = el('div', 'drag'); d.dataset.id = id; d.appendChild(animalImg(id)); tgrid.appendChild(d); return d; });
    autoGrid(zbox, zgrid, zones.length, { ar: 0.8, maxW: 200 });
    autoGrid(tbox, tgrid, items.length, { ar: 1, maxW: 160 });
    let placed = 0;
    ctx.onReplay = () => say('ضع كل حيوان في المكان الذي يعيش فيه');
    ctx.hint = () => { const it = items.find(i => !i.classList.contains('done')); if (!it) return; const z = zones.find(z => z.dataset.hab === ANIMALS[it.dataset.id].habitat); z.classList.add('glow'); setMascot('point', 3000); };
    dragGroup({
      items, zones: () => zones,
      onGrab: it => { speakArabic(nameOf(it.dataset.id)); },
      drop: (it, z) => {
        const A = ANIMALS[it.dataset.id];
        if (z.dataset.hab !== A.habitat) {
          ctx.wrong++; playErrorSound(); z.classList.remove('wrong'); void z.offsetWidth; z.classList.add('wrong'); setMascot('think', 1800);
          if (ctx.wrong >= 2) ctx.hint(); say(`ليس هنا. ${tryAgain()}`); return false;
        }
        z.classList.remove('glow'); it.classList.add('done'); it.style.transform = '';
        const g = $('.got', z); const mini = animalImg(A.id); g.appendChild(mini); z.dataset.full = 1;
        sparkleAt(z, 10); playSuccessSound(); placed++;
        if (placed >= items.length) handleCorrectAnswer(ctx, z, { text: `${praise()} كل حيوان في مكانه` });
        else say(`${A.def} ${habVerb(A)} في ${HABITATS[A.habitat].inn}`);
        return true;
      }
    });
    setMascot('point'); say('ضع كل حيوان في المكان الذي يعيش فيه');
  }
};

/* ---------- 5) طابق الحيوان مع ظله (سحب وإفلات) ---------- */
activities.match = {
  generate(spec) {
    const ids = []; const shapes = new Set();
    for (const id of shuffle(ALL_IDS)) { if (ids.length >= spec.pairs) break; if (!shapes.has(ANIMALS[id].shape)) { shapes.add(ANIMALS[id].shape); ids.push(id); } }
    let shadows = shuffle(ids); if (ids.length > 1 && shadows.every((s, i) => s === ids[i])) shadows.reverse();
    return { ids, shadows };
  },
  render(q, ctx) {
    const st = newStage(); const dual = el('div', 'dual'); st.appendChild(dual);
    const cbox = el('div', 'opts'), cgrid = el('div', 'grid'); cbox.appendChild(cgrid);
    const sbox = el('div', 'opts'), sgrid = el('div', 'grid'); sbox.appendChild(sgrid);
    dual.append(cbox, sbox);
    const items = q.ids.map(id => { const d = el('div', 'drag'); d.dataset.id = id; d.appendChild(animalImg(id)); cgrid.appendChild(d); return d; });
    const zones = q.shadows.map(id => { const d = el('div', 'sil'); d.dataset.id = id; d.appendChild(animalImg(id)); sgrid.appendChild(d); return d; });
    autoGrid(cbox, cgrid, items.length, { ar: 1, maxW: 190 });
    autoGrid(sbox, sgrid, zones.length, { ar: 1, maxW: 190 });
    let matched = 0;
    ctx.onReplay = () => say('ضع كل حيوان فوق ظله');
    ctx.hint = () => { const it = items.find(i => !i.classList.contains('done')); if (!it) return; zones.find(z => z.dataset.id === it.dataset.id).classList.add('glow'); setMascot('point', 3000); };
    dragGroup({
      items, zones: () => zones.filter(z => !z.classList.contains('matched')),
      onGrab: it => { speakArabic(nameOf(it.dataset.id)); },
      drop: (it, z) => {
        if (z.dataset.id !== it.dataset.id) { ctx.wrong++; playErrorSound(); z.classList.remove('wrong'); void z.offsetWidth; z.classList.add('wrong'); setMascot('think', 1500); if (ctx.wrong >= 2) ctx.hint(); say(tryAgain()); return false; }
        z.classList.remove('glow'); z.classList.add('matched'); it.classList.add('done'); it.style.transform = '';
        sparkleAt(z, 10); playSuccessSound(); matched++;
        if (matched >= items.length) handleCorrectAnswer(ctx, z, { text: `${praise()} طابقت كل الحيوانات` });
        else say(`${praise()} ${nameOf(it.dataset.id)}`);
        return true;
      }
    });
    setMascot('point'); say('ضع كل حيوان فوق ظله');
  }
};

/* ---------- 6) ما الحيوان المختلف؟ ---------- */
activities.odd = {
  generate() {
    const a = pick1(ALL_IDS); let b; do { b = pick1(ALL_IDS); } while (ANIMALS[b].shape === ANIMALS[a].shape);
    const arr = shuffle([a, a, a, b]);
    if (arr.indexOf(b) === lastPos) { const j = (lastPos + 1) % 4; [arr[lastPos], arr[j]] = [arr[j], arr[lastPos]]; }
    lastPos = arr.indexOf(b);
    return { base: a, odd: b, arr };
  },
  render(q, ctx) {
    const st = newStage(); const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.appendChild(box);
    const btns = q.arr.map(id => { const b = animalCard(id, { label: false }); grid.appendChild(b); return b; });
    autoGrid(box, grid, 4, { ar: 1, maxW: 260 });
    const idx = q.arr.indexOf(q.odd); const correct = btns[idx]; correct.dataset.ans = 1;
    ctx.onReplay = () => say('أي حيوان مختلف؟');
    ctx.hint = () => { correct.classList.add('glow'); setMascot('point', 4000); };
    btns.forEach((b, i) => b.onclick = () => {
      if (ctx.done || b.classList.contains('dim')) return; playClickSound();
      if (i === idx) handleCorrectAnswer(ctx, b, { sound: q.odd, text: `${praise()} ${nameOf(q.odd)} مختلفة`.replace('مختلفة', ANIMALS[q.odd].fem ? 'مختلفة' : 'مختلف') });
      else handleWrongAnswer(ctx, b, { text: tryAgain() });
    });
    setMascot('think'); say('أي حيوان مختلف؟');
  }
};

/* ---------- 7) عدّ الحيوانات ---------- */
let lastCount = 0;
activities.count = {
  generate(spec) {
    const id = pick1(['chick', 'duck', 'bird', 'fish', 'frog', 'rabbit', 'hen', 'cat', 'dog', 'sheep']);
    let n; do { n = spec.min + rand(spec.max - spec.min + 1); } while (n === lastCount && spec.max > spec.min); lastCount = n;
    const nopts = spec.max > 5 ? 4 : 3; const set = [n];
    const near = shuffle([n - 2, n - 1, n + 1, n + 2, n + 3, n - 3]).filter(v => v >= 1 && v <= 10);
    for (const v of near) { if (set.length >= nopts) break; set.push(v); }
    return { id, n, opts: shuffle(set).sort((a, b) => a - b) };
  },
  render(q, ctx) {
    const A = ANIMALS[q.id];
    const st = newStage();
    const field = el('div', 'count-field'); const grid = el('div', 'grid'); field.appendChild(grid);
    const row = el('div', 'numrow'); st.append(field, row);
    const items = []; for (let i = 0; i < q.n; i++) { const d = el('div', 'cnt'); d.appendChild(animalImg(q.id)); d.appendChild(el('span', 'num', '')); grid.appendChild(d); items.push(d); }
    autoGrid(field, grid, q.n, { ar: 1, maxW: 170, gap: 10 });
    let counted = 0;
    const countOne = d => { if (d.classList.contains('counted')) return; counted++; d.classList.add('counted'); $('.num', d).textContent = counted; d.classList.remove('hop'); void d.offsetWidth; d.classList.add('hop'); playClickSound(); speakArabic(NUM_WORDS[counted] || String(counted)); };
    items.forEach(d => d.onclick = () => { if (!ctx.done) countOne(d); });
    const btns = q.opts.map(v => { const b = el('button', 'numbtn', String(v)); b.dataset.n = v; row.appendChild(b); return b; });
    const correct = btns.find(b => +b.dataset.n === q.n); correct.dataset.ans = 1;
    const ask = () => say(`كم عدد ${A.pl}؟ المس كل واحد لتعدّه`);
    ctx.onReplay = ask;
    ctx.hint = async () => { correct.classList.add('glow'); setMascot('point', 4000); };
    btns.forEach(b => b.onclick = () => {
      if (ctx.done || b.classList.contains('dim')) return; playClickSound();
      const v = +b.dataset.n;
      if (v === q.n) { items.forEach(d => { if (!d.classList.contains('counted')) { counted++; d.classList.add('counted'); $('.num', d).textContent = counted; } }); handleCorrectAnswer(ctx, b, { text: `${praise()} ${NUM_WORDS[v]}` }); }
      else handleWrongAnswer(ctx, b, { text: `${NUM_WORDS[v]}. عُدَّ مرة أخرى` });
    });
    setMascot('think'); ask();
  }
};

/* ---------- 8) لعبة الذاكرة ---------- */
activities.memory = {
  generate(spec) {
    const ids = shuffle(ALL_IDS).slice(0, spec.cards / 2);
    return { deck: shuffle(ids.concat(ids)) };
  },
  render(q, ctx) {
    const st = newStage(); const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.appendChild(box);
    const cards = q.deck.map(id => {
      const c = el('button', 'mem', '<div class="mem-in"><div class="mem-face mem-back">🐾</div><div class="mem-face mem-front"></div></div>');
      c.dataset.id = id; $('.mem-front', c).appendChild(animalImg(id)); c.setAttribute('aria-label', 'بطاقة'); grid.appendChild(c); return c;
    });
    autoGrid(box, grid, cards.length, { ar: 1.1, maxW: 200 });
    let open = [], busy = false, matched = 0;
    ctx.onReplay = () => say('اقلب البطاقات وابحث عن الحيوانين المتشابهين');
    cards.forEach(c => c.onclick = async () => {
      if (ctx.done || busy || c.classList.contains('flip') || c.classList.contains('matched')) return;
      ensureAudio(); playClickSound(); c.classList.add('flip'); open.push(c); playAnimalSound(c.dataset.id);
      if (open.length < 2) return;
      busy = true; const [a, b] = open; open = [];
      await sleep(1000); if (!ctx.alive()) return;
      if (a.dataset.id === b.dataset.id) {
        a.classList.add('matched'); b.classList.add('matched'); sparkleAt(a, 8); sparkleAt(b, 8); playSuccessSound(); matched += 2; setMascot('clap', 1200);
        if (matched >= cards.length) { handleCorrectAnswer(ctx, b, { text: `${praise()} وجدت كل الأزواج` }); return; }
        speakArabic(`${praise()} ${nameOf(a.dataset.id)}`);
      } else { a.classList.remove('flip'); b.classList.remove('flip'); }
      busy = false;
    });
    setMascot('think'); say('اقلب البطاقات وابحث عن الحيوانين المتشابهين');
  }
};

/* ---------- 9) من صاحب الأثر؟ ---------- */
activities.print = {
  generate(spec) {
    const pool = ALL_IDS.filter(id => ANIMALS[id].print);
    const target = pickTarget(pool);
    return { target, opts: pickOptions(target, pool, spec.options, 'print'), intro: [target] };
  },
  render(q, ctx) {
    const st = newStage();
    const top = el('div', 'top-zone'); const plate = el('div', 'print-plate'); plate.innerHTML = printSVG(ANIMALS[q.target].print); top.appendChild(plate);
    const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.append(top, box);
    const btns = q.opts.map(id => { const b = animalCard(id); grid.appendChild(b); return b; });
    autoGrid(box, grid, btns.length, { ar: 1.15 });
    const correct = btns[q.opts.indexOf(q.target)]; correct.dataset.ans = 1;
    ctx.onReplay = () => say('لمن هذا الأثر؟');
    ctx.hint = () => { correct.classList.add('glow'); setMascot('point', 4000); };
    btns.forEach(b => b.onclick = () => {
      if (ctx.done || b.classList.contains('dim')) return; playClickSound();
      const id = b.dataset.id;
      if (id === q.target) handleCorrectAnswer(ctx, b, { sound: id, text: `${praise()} هذا أثر ${ANIMALS[id].def}` });
      else handleWrongAnswer(ctx, b, { text: `${nameOf(id)}. ${tryAgain()}` });
    });
    setMascot('think'); say('لمن هذا الأثر؟');
  }
};

/* ---------- 10) من هذا الحيوان؟ (جزء منه) ---------- */
activities.part = {
  generate(spec) {
    const pool = ALL_IDS.filter(id => ANIMALS[id].part);
    const target = pickTarget(pool);
    return { target, opts: pickOptions(target, ALL_IDS, spec.options, 'shape'), intro: [target] };
  },
  render(q, ctx) {
    const st = newStage();
    const top = el('div', 'top-zone'); const pv = el('div', 'part-view'); const im = new Image(); im.src = 'parts/' + q.target + '.png'; im.alt = ''; pv.appendChild(im); top.appendChild(pv);
    const box = el('div', 'opts'); const grid = el('div', 'grid'); box.appendChild(grid); st.append(top, box);
    const btns = q.opts.map(id => { const b = animalCard(id); grid.appendChild(b); return b; });
    autoGrid(box, grid, btns.length, { ar: 1.15 });
    const correct = btns[q.opts.indexOf(q.target)]; correct.dataset.ans = 1;
    ctx.onReplay = () => say('من هذا الحيوان؟');
    ctx.hint = () => { correct.classList.add('glow'); setMascot('point', 4000); };
    btns.forEach(b => b.onclick = () => {
      if (ctx.done || b.classList.contains('dim')) return; playClickSound();
      const id = b.dataset.id;
      if (id === q.target) { im.src = 'images/' + id + '.png'; im.style.objectFit = 'contain'; pv.classList.add('reveal'); handleCorrectAnswer(ctx, b, { sound: id, text: `${praise()} ${nameOf(id)}` }); }
      else handleWrongAnswer(ctx, b, { text: `${nameOf(id)}. ${tryAgain()}` });
    });
    setMascot('think'); say('من هذا الحيوان؟ شاهد جزءًا منه');
  }
};

/* ---------- التحدي المختلط: نشاط عشوائي من بين خيارات ---------- */
activities.mixedChallenge = {
  generate(spec, ctx) {
    const sub = pick1(spec.choices);
    const q = activities[sub.type].generate(sub, ctx);
    return { sub, q, intro: q.intro };
  },
  render(q, ctx) { activities[q.sub.type].render(q.q, ctx); }
};

/* أسماء بديلة مطابقة للتصميم المطلوب */
activities.listenAndChoose = activities.listen;
activities.chooseAnimal = activities.listen;
activities.animalToSound = activities.toSound;
activities.whereLives = activities.where;
activities.sortAnimals = activities.sort;
activities.matchAnimal = activities.match;
activities.findAnimal = activities.part;
activities.oddOneOut = activities.odd;
activities.countAnimals = activities.count;
activities.animalMemory = activities.memory;
activities.animalFootprint = activities.print;
activities.mixed = activities.mixedChallenge;

init();
