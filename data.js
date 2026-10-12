'use strict';
/* =====================================================================
   بيانات اللعبة: الحيوانات، البيئات، الرسومات SVG، المستويات
   لإضافة حيوان جديد: ضع صورته في images/<id>.png وصوته في sounds/<id>.mp3
   ثم أضف سطراً جديداً في قائمة ANIMAL_LIST.
   ===================================================================== */

const HABITATS = {
  farm:   { id: 'farm',   name: 'المزرعة',          inn: 'المزرعة',          icon: '🌾', c1: '#a8e063', c2: '#56ab2f' },
  forest: { id: 'forest', name: 'الغابة',           inn: 'الغابة',           icon: '🌳', c1: '#6fd68a', c2: '#1e8a4c' },
  desert: { id: 'desert', name: 'الصحراء',          inn: 'الصحراء',          icon: '🏜️', c1: '#ffd77a', c2: '#e8963a' },
  sea:    { id: 'sea',    name: 'البحر',            inn: 'البحر',            icon: '🌊', c1: '#6dd5fa', c2: '#2b7fd6' },
  cold:   { id: 'cold',   name: 'المنطقة الباردة',  inn: 'المنطقة الباردة',  icon: '❄️', c1: '#e0f4ff', c2: '#8cc8f0' }
};

/* shape: مجموعة الشكل (لتجنب وضع حيوانات متشابهة الشكل في سؤال واحد)
   sg: مجموعة الصوت (لتجنب خيارات أصواتها متقاربة)
   print: نوع الأثر (null = لا يوجد)   habQ: يصلح لسؤال "أين يعيش؟"  */
const ANIMAL_LIST = [
  { id:'dog',      name:'كلب',         def:'الكلب',         pl:'الكلاب',      art:'هذا', info:'يحرس البيت ويحب أكل العظام',            habitat:'farm',   habQ:true,  print:'paw',      shape:'canine',  sg:'bark',  say:'هاو هاو' },
  { id:'cat',      name:'قطة',         def:'القطة',         pl:'القطط',       art:'هذه', info:'تحب شرب الحليب وصيد الفئران',           habitat:'farm',   habQ:true,  print:'cat',      shape:'feline',  sg:'meow',  say:'مياو' },
  { id:'cow',      name:'بقرة',        def:'البقرة',        pl:'الأبقار',     art:'هذه', info:'تعطينا الحليب وتأكل العشب',              habitat:'farm',   habQ:true,  print:'hoof',     shape:'hoofed',  sg:'moo',   say:'موووو' },
  { id:'horse',    name:'حصان',        def:'الحصان',        pl:'الخيول',      art:'هذا', info:'يجري بسرعة ويحب أكل العشب',              habitat:'farm',   habQ:true,  print:'horse',    shape:'hoofed',  sg:'neigh', say:'صهيل' },
  { id:'sheep',    name:'خروف',        def:'الخروف',        pl:'الخراف',      art:'هذا', info:'صوفه ناعم ويأكل العشب',                  habitat:'farm',   habQ:true,  print:'hoof',     shape:'sheep',   sg:'bleat', say:'ماااع' },
  { id:'goat',     name:'ماعز',        def:'الماعز',        pl:'الماعز',      art:'هذه', info:'تتسلق الصخور وتأكل العشب',               habitat:'farm',   habQ:true,  print:'hoof',     shape:'hoofed',  sg:'bleat', say:'ميييه' },
  { id:'hen',      name:'دجاجة',       def:'الدجاجة',       pl:'الدجاجات',    art:'هذه', info:'تبيض لنا البيض وتأكل الحَبّ',            habitat:'farm',   habQ:true,  print:'bird',     shape:'bird',    sg:'cluck', say:'كاك كاك' },
  { id:'chick',    name:'كتكوت',       def:'الكتكوت',       pl:'الكتاكيت',    art:'هذا', info:'صغير وأصفر ويحب أكل الحَبّ',             habitat:'farm',   habQ:true,  print:'bird',     shape:'bird',    sg:'peep',  say:'بيو بيو', svg:true },
  { id:'duck',     name:'بطة',         def:'البطة',         pl:'البط',        art:'هذه', info:'تسبح في الماء وتحب الخبز',               habitat:'farm',   habQ:true,  print:'web',      shape:'bird',    sg:'quack', say:'بط بط' },
  { id:'lion',     name:'أسد',         def:'الأسد',         pl:'الأسود',      art:'هذا', info:'ملك الغابة ويأكل اللحم',                 habitat:'forest', habQ:true,  print:'cat',      shape:'feline',  sg:'roar',  say:'زئير', part:[.12,.05,.88,.8] },
  { id:'tiger',    name:'نمر',         def:'النمر',         pl:'النمور',      art:'هذا', info:'مخطط وقوي ويأكل اللحم',                  habitat:'forest', habQ:true,  print:'cat',      shape:'feline',  sg:'roar',  say:'زئير', part:[.1,.1,.9,.75] },
  { id:'elephant', name:'فيل',         def:'الفيل',         pl:'الفيلة',      art:'هذا', info:'كبير وله خرطوم طويل ويأكل الأعشاب',     habitat:'forest', habQ:true,  print:'elephant', shape:'big',     sg:'trumpet', say:'برووو', part:[.3,.15,.85,.8] },
  { id:'monkey',   name:'قرد',         def:'القرد',         pl:'القرود',      art:'هذا', info:'يتسلق الأشجار ويحب الموز',               habitat:'forest', habQ:true,  print:'hand',     shape:'primate', sg:'ooh',   say:'أووو أووو', part:[.12,.05,.88,.6] },
  { id:'bear',     name:'دب',          def:'الدب',          pl:'الدببة',      art:'هذا', info:'كبير وقوي ويحب العسل',                   habitat:'forest', habQ:true,  print:'bear',     shape:'bear',    sg:'growl', say:'غرررر' },
  { id:'rabbit',   name:'أرنب',        def:'الأرنب',        pl:'الأرانب',     art:'هذا', info:'يقفز بسرعة ويحب أكل الجزر',              habitat:'forest', habQ:true,  print:'rabbit',   shape:'rabbit',  sg:'squeak',say:'ييي', part:[.1,0,.9,.55] },
  { id:'frog',     name:'ضفدع',        def:'الضفدع',        pl:'الضفادع',     art:'هذا', info:'يقفز قرب الماء ويأكل الحشرات',           habitat:'forest', habQ:false, print:'web',      shape:'frog',    sg:'ribbit',say:'نق نق' },
  { id:'bird',     name:'عصفور',       def:'العصفور',       pl:'العصافير',    art:'هذا', info:'يطير في السماء ويأكل الحبوب',            habitat:'forest', habQ:true,  print:'bird',     shape:'bird',    sg:'tweet', say:'زقزقة' },
  { id:'fish',     name:'سمكة',        def:'السمكة',        pl:'الأسماك',     art:'هذه', info:'تسبح في الماء وتأكل الأعشاب البحرية',    habitat:'sea',    habQ:true,  print:null,       shape:'fish',    sg:'bubble',say:'بلوب بلوب', svg:true },
  { id:'dolphin',  name:'دولفين',      def:'الدولفين',      pl:'الدلافين',    art:'هذا', info:'ذكي ويقفز في البحر ويأكل الأسماك',       habitat:'sea',    habQ:true,  print:null,       shape:'fish',    sg:'whistle',say:'صفير' },
  { id:'giraffe',  name:'زرافة',       def:'الزرافة',       pl:'الزرافات',    art:'هذه', info:'رقبتها طويلة وتأكل أوراق الأشجار',       habitat:'forest', habQ:true,  print:'hoof',     shape:'tall',    sg:'hum',   say:'همممم', part:[.45,.0,1,.27] },
  { id:'zebra',    name:'حمار وحشي',   def:'الحمار الوحشي', pl:'الحمير الوحشية', art:'هذا', info:'جسمه مخطط ويأكل العشب',              habitat:'forest', habQ:true,  print:'horse',    shape:'hoofed',  sg:'bray',  say:'هيهه', part:[.0,.1,.7,.7] },
  { id:'penguin',  name:'بطريق',       def:'البطريق',       pl:'البطاريق',    art:'هذا', info:'يعيش في الثلج ويسبح ويأكل الأسماك',      habitat:'cold',   habQ:true,  print:'web',      shape:'penguin', sg:'honk',  say:'واااك' },
  { id:'camel',    name:'جمل',         def:'الجمل',         pl:'الجمال',      art:'هذا', info:'يعيش في الصحراء ويتحمل العطش',           habitat:'desert', habQ:true,  print:'hoof',     shape:'camel',   sg:'grumble',say:'غرررر', svg:true },
  { id:'wolf',     name:'ذئب',         def:'الذئب',         pl:'الذئاب',      art:'هذا', info:'يعوي في الليل ويأكل اللحم',              habitat:'forest', habQ:true,  print:'paw',      shape:'canine',  sg:'howl',  say:'أووووو' },
  { id:'fox',      name:'ثعلب',        def:'الثعلب',        pl:'الثعالب',     art:'هذا', info:'ذيله كثيف ويحب أكل الفئران',             habitat:'forest', habQ:true,  print:'paw',      shape:'canine',  sg:'yip',   say:'يب يب' },
  { id:'hippo',    name:'فرس النهر',   def:'فرس النهر',     pl:'أفراس النهر', art:'هذا', info:'ضخم ويعيش قرب الماء ويأكل العشب',        habitat:'forest', habQ:false, print:'elephant', shape:'big',     sg:'grunt', say:'هووو' },
  { id:'crocodile',name:'تمساح',       def:'التمساح',       pl:'التماسيح',    art:'هذا', info:'يعيش في النهر وله أسنان كثيرة',          habitat:'forest', habQ:false, print:null,       shape:'reptile', sg:'growl', say:'غرررر' },
  { id:'turtle',   name:'سلحفاة',      def:'السلحفاة',      pl:'السلاحف',     art:'هذه', info:'تمشي ببطء وبيتها على ظهرها',             habitat:'sea',    habQ:true,  print:null,       shape:'turtle',  sg:'peepy', say:'بيب بيب', svg:true },
  { id:'snake',    name:'ثعبان',       def:'الثعبان',       pl:'الثعابين',    art:'هذا', info:'يزحف على الأرض ويقول سسسس',              habitat:'desert', habQ:true,  print:'snake',    shape:'snake',   sg:'hiss',  say:'سسسس', svg:true },
  { id:'parrot',   name:'ببغاء',       def:'الببغاء',       pl:'الببغاوات',   art:'هذا', info:'ملون ويقلد الكلام ويحب الفاكهة',         habitat:'forest', habQ:true,  print:'bird',     shape:'bird',    sg:'squawk',say:'كواااك', part:[.5,.0,1,.4] },
  { id:'koala',    name:'كوالا',       def:'الكوالا',       pl:'الكوالا',     art:'هذا', info:'يتسلق الأشجار وينام كثيراً',             habitat:'forest', habQ:false, print:null,       shape:'koala',   sg:'grunt2',say:'غرر' }
];
const ANIMALS = {};
ANIMAL_LIST.forEach(a => { a.fem = a.art === 'هذه'; ANIMALS[a.id] = a; });
const ALL_IDS = ANIMAL_LIST.map(a => a.id);

/* ---------- المجموعات المستخدمة في المستويات ---------- */
const POOLS = {
  easy:  ['dog', 'cat', 'cow', 'duck', 'sheep', 'hen', 'horse', 'bird', 'rabbit', 'frog'],
  farm:  ['cow', 'hen', 'sheep', 'horse', 'goat', 'duck', 'dog', 'cat', 'chick'],
  wild:  ['lion', 'elephant', 'monkey', 'tiger', 'bear', 'wolf', 'giraffe', 'zebra', 'hippo', 'crocodile', 'koala'],
  all:   ALL_IDS.slice()
};

/* ---------- المناطق والمستويات ---------- */
const ZONES = {
  farm:    { name: 'المزرعة',           icon: '🏡' },
  forest:  { name: 'الغابة',            icon: '🌳' },
  desert:  { name: 'الصحراء',           icon: '🏜️' },
  sea:     { name: 'عالم البحر',        icon: '🌊' },
  cold:    { name: 'العالم البارد',     icon: '🏔️' },
  kingdom: { name: 'مملكة الحيوانات',   icon: '🏆' }
};

const LEVELS = [
  { n: 1,  zone: 'farm',    icon: '🔊', title: 'من صاحب الصوت؟',
    rounds: [3,3,3,3,3].map(o => ({ type: 'listen', targets: POOLS.easy, from: POOLS.easy, options: o })) },
  { n: 2,  zone: 'farm',    icon: '🐄', title: 'أصوات حيوانات المزرعة',
    rounds: [3,3,4,4,5].map(o => ({ type: 'listen', targets: ['cow','hen','sheep','horse','goat'], from: POOLS.farm, options: o })) },
  { n: 3,  zone: 'forest',  icon: '🦁', title: 'أصوات الحيوانات البرية',
    rounds: [3,3,4,4,5].map(o => ({ type: 'listen', targets: ['lion','elephant','monkey','tiger','bear'], from: POOLS.wild.concat(['dog','cat','cow']), options: o })) },
  { n: 4,  zone: 'forest',  icon: '👂', title: 'اسمع ثم اختر',
    rounds: [
      { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 4 },
      { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 4 },
      { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 5 },
      { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 4, mystery: true },
      { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 5, mystery: true }
    ] },
  { n: 5,  zone: 'forest',  icon: '🐶', title: 'من الحيوان إلى الصوت',
    rounds: [
      { type: 'toSound', pool: POOLS.easy, options: 3, demo: true },
      { type: 'toSound', pool: POOLS.easy, options: 3, demo: true },
      { type: 'toSound', pool: POOLS.all,  options: 3, demo: true },
      { type: 'toSound', pool: POOLS.all,  options: 3, demo: false },
      { type: 'toSound', pool: POOLS.all,  options: 4, demo: false }
    ] },
  { n: 6,  zone: 'desert',  icon: '🌳', title: 'أين يعيش؟',
    rounds: [
      { type: 'where', habitats: ['farm','sea','desert'] },
      { type: 'where', habitats: ['forest','sea','desert'] },
      { type: 'where', habitats: ['farm','forest','sea','cold'] },
      { type: 'sort',  count: 3, habitats: ['farm','sea','desert'] },
      { type: 'sort',  count: 4, habitats: ['farm','forest','sea','cold'] }
    ] },
  { n: 7,  zone: 'sea',     icon: '🧩', title: 'مطابقة وتصنيف وعدّ',
    rounds: [
      { type: 'match', pairs: 2 },
      { type: 'match', pairs: 3 },
      { type: 'odd' },
      { type: 'count', min: 1, max: 5 },
      { type: 'count', min: 4, max: 10 }
    ] },
  { n: 8,  zone: 'sea',     icon: '🧠', title: 'لعبة الذاكرة',
    rounds: [4,4,6,6,8].map(c => ({ type: 'memory', cards: c })) },
  { n: 9,  zone: 'cold',    icon: '🐾', title: 'من صاحب الأثر؟',
    rounds: [
      { type: 'print', options: 3 },
      { type: 'print', options: 3 },
      { type: 'print', options: 4 },
      { type: 'part',  options: 3 },
      { type: 'part',  options: 4 }
    ] },
  { n: 10, zone: 'kingdom', icon: '🏆', title: 'تحدي أصدقاء الحيوانات',
    rounds: [
      { type: 'mixed', choices: [ { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 5 }, { type: 'listen', targets: POOLS.all, from: POOLS.all, options: 5, mystery: true } ] },
      { type: 'mixed', choices: [ { type: 'print', options: 4 }, { type: 'part', options: 4 } ] },
      { type: 'mixed', choices: [ { type: 'where', habitats: ['farm','forest','sea','desert','cold'] }, { type: 'sort', count: 4, habitats: ['farm','forest','sea','cold'] } ] },
      { type: 'mixed', choices: [ { type: 'match', pairs: 4 }, { type: 'count', min: 4, max: 10 } ] },
      { type: 'mixed', choices: [ { type: 'memory', cards: 8 } ] }
    ] }
];

/* مواقع المراحل على الخريطة (نسب مئوية) */
const MAP_NODES = [
  [88, 82], [74, 70], [90, 40], [78, 24], [68, 44],
  [50, 74], [28, 84], [11, 66], [15, 30], [50, 22]
];
const MAP_ZONES = [
  { zone:'forest',  x:67, y:2,  w:32, h:47, c1:'#7fdc8f', c2:'#3aa65a', deco:['🌲','🌳','🍄','🦋'] },
  { zone:'farm',    x:67, y:51, w:32, h:47, c1:'#c9ee8a', c2:'#8fcf4f', deco:['🌾','🏡','🌻','🐓'] },
  { zone:'kingdom', x:34, y:2,  w:31, h:38, c1:'#ffe27a', c2:'#f6b73c', deco:['🏰','👑','🎈'] },
  { zone:'desert',  x:34, y:42, w:31, h:56, c1:'#ffe3a1', c2:'#f0b45a', deco:['🌵','🏜️','☀️'] },
  { zone:'cold',    x:1,  y:2,  w:31, h:47, c1:'#eaf7ff', c2:'#a9d8f5', deco:['⛄','🏔️','❄️'] },
  { zone:'sea',     x:1,  y:51, w:31, h:47, c1:'#8fdcff', c2:'#3b98e0', deco:['🐚','⛵','🌊'] }
];

/* ---------- الخلفيات ---------- */
const SCENES = {
  farm:    { sky: ['#8fdcff', '#dff6ff'], hill1: '#8fd45a', hill2: '#62b84a', deco: ['🌾','🌻','🏡','☁️'], sun: '☀️' },
  forest:  { sky: ['#9be6ff', '#e2fbe8'], hill1: '#5ccb7a', hill2: '#2f9f5b', deco: ['🌳','🌲','🍄','☁️'], sun: '☀️' },
  desert:  { sky: ['#ffd9a0', '#fff1d0'], hill1: '#f7cf7d', hill2: '#e8a95a', deco: ['🌵','🏜️','☁️'],       sun: '🌞' },
  sea:     { sky: ['#7fd4ff', '#d6f4ff'], hill1: '#4fc3f7', hill2: '#1e88e5', deco: ['🐚','⛵','🌊','☁️'], sun: '☀️' },
  cold:    { sky: ['#bfe6ff', '#f1faff'], hill1: '#ffffff', hill2: '#cdeaff', deco: ['⛄','🏔️','❄️','☁️'], sun: '🌤️' },
  kingdom: { sky: ['#ffcf7a', '#ffeebb'], hill1: '#ffd95a', hill2: '#f5b335', deco: ['🏰','👑','⭐','🎈'], sun: '🌟' },
  home:    { sky: ['#8fdcff', '#e3fbe9'], hill1: '#6fd46a', hill2: '#3fb35a', deco: ['🌳','🌲','🌸','☁️'], sun: '☀️' }
};

/* ---------- كلمات ---------- */
const NUM_WORDS = ['صفر','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة'];
const PRAISE = ['أحسنت!', 'رائع!', 'ممتاز!', 'برافو!', 'أنت ذكي!', 'صحيح!', 'عمل جميل!'];
const TRY_AGAIN = ['حاول مرة أخرى.', 'استمع جيدًا.', 'لا بأس، جرّب مرة ثانية.'];

/* =====================================================================
   رسومات SVG للحيوانات التي ليست في الصورة المرفقة
   __ID__ يُستبدل برقم فريد لتجنب تعارض معرّفات التدرجات
   ===================================================================== */
const SVGS = {};
SVGS.chick = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="cb__ID__" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff9b0"/><stop offset="1" stop-color="#ffc41f"/></radialGradient></defs>
<ellipse cx="100" cy="190" rx="52" ry="7" fill="#000" opacity=".13"/>
<ellipse cx="82" cy="180" rx="14" ry="6.5" fill="#ff9a1f"/><ellipse cx="118" cy="180" rx="14" ry="6.5" fill="#ff9a1f"/>
<path d="M98 42 Q92 20 76 22 Q88 28 90 44 Z M100 42 Q104 16 124 18 Q110 28 108 44 Z" fill="#ffc41f"/>
<ellipse cx="34" cy="118" rx="14" ry="27" transform="rotate(18 34 118)" fill="#ffb300"/><ellipse cx="166" cy="118" rx="14" ry="27" transform="rotate(-18 166 118)" fill="#ffb300"/>
<circle cx="100" cy="112" r="72" fill="url(#cb__ID__)"/>
<ellipse cx="78" cy="78" rx="22" ry="12" fill="#fff" opacity=".35" transform="rotate(-25 78 78)"/>
<circle cx="76" cy="100" r="10" fill="#2b2118"/><circle cx="124" cy="100" r="10" fill="#2b2118"/>
<circle cx="79.5" cy="96.5" r="3.6" fill="#fff"/><circle cx="127.5" cy="96.5" r="3.6" fill="#fff"/>
<circle cx="58" cy="124" r="10" fill="#ff8a80" opacity=".55"/><circle cx="142" cy="124" r="10" fill="#ff8a80" opacity=".55"/>
<path d="M88 112 L112 112 L100 130 Z" fill="#ff8f00" stroke="#e57c00" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

SVGS.fish = `<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="fb__ID__" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#ff6a1f"/></linearGradient></defs>
<path d="M148 90 Q178 56 192 48 Q186 90 192 132 Q178 124 148 90 Z" fill="#ff7a29" stroke="#e25a0c" stroke-width="3" stroke-linejoin="round"/>
<path d="M62 52 Q92 6 128 54 Z" fill="#ff5f1a" stroke="#e25a0c" stroke-width="3" stroke-linejoin="round"/>
<path d="M92 124 Q104 156 126 138 Z" fill="#ff7a29" stroke="#e25a0c" stroke-width="3" stroke-linejoin="round"/>
<ellipse cx="90" cy="90" rx="66" ry="46" fill="url(#fb__ID__)" stroke="#e25a0c" stroke-width="3"/>
<path d="M82 50 Q70 90 82 130" stroke="#fff" stroke-width="9" fill="none" opacity=".85" stroke-linecap="round"/>
<path d="M114 52 Q102 90 114 128" stroke="#fff" stroke-width="9" fill="none" opacity=".85" stroke-linecap="round"/>
<ellipse cx="68" cy="62" rx="24" ry="9" fill="#fff" opacity=".28" transform="rotate(-20 68 62)"/>
<circle cx="50" cy="82" r="13" fill="#fff"/><circle cx="48" cy="83" r="8" fill="#2b2118"/><circle cx="45.5" cy="80" r="3" fill="#fff"/>
<path d="M30 104 Q44 116 58 106" stroke="#a8400b" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="26" cy="78" r="6" fill="none" stroke="#bfe9ff" stroke-width="3"/><circle cx="16" cy="62" r="4" fill="none" stroke="#bfe9ff" stroke-width="3"/>
</svg>`;

SVGS.camel = `<svg viewBox="0 0 230 200" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="cm__ID__" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0c37a"/><stop offset="1" stop-color="#cf9448"/></linearGradient></defs>
<ellipse cx="112" cy="192" rx="78" ry="7" fill="#000" opacity=".12"/>
<g fill="#b9843c"><rect x="60" y="130" width="16" height="54" rx="7"/><rect x="150" y="130" width="16" height="54" rx="7"/></g>
<g fill="url(#cm__ID__)"><rect x="42" y="130" width="17" height="56" rx="7"/><rect x="132" y="130" width="17" height="56" rx="7"/></g>
<g fill="#7a4a1d"><ellipse cx="50" cy="186" rx="11" ry="5"/><ellipse cx="68" cy="186" rx="10" ry="5"/><ellipse cx="140" cy="186" rx="11" ry="5"/><ellipse cx="158" cy="186" rx="10" ry="5"/></g>
<path d="M40 112 Q22 118 28 142" stroke="#b9843c" stroke-width="7" fill="none" stroke-linecap="round"/>
<ellipse cx="104" cy="122" rx="72" ry="36" fill="url(#cm__ID__)"/>
<path d="M76 100 C66 44 128 38 136 100 Z" fill="url(#cm__ID__)"/>
<path d="M82 76 C90 56 112 54 122 74" stroke="#fff" stroke-width="7" opacity=".3" fill="none" stroke-linecap="round"/>
<path d="M78 98 L134 98 L138 124 L74 124 Z" fill="#e5484d"/><g fill="#ffd54a"><circle cx="90" cy="111" r="4"/><circle cx="106" cy="111" r="4"/><circle cx="122" cy="111" r="4"/></g>
<path d="M148 104 C172 96 176 66 170 44 L192 44 C200 76 194 116 166 134 Z" fill="url(#cm__ID__)"/>
<ellipse cx="188" cy="38" rx="23" ry="17" fill="url(#cm__ID__)"/>
<ellipse cx="204" cy="45" rx="14" ry="11" fill="#f6dba7"/>
<circle cx="207" cy="42" r="2.2" fill="#6b4a1f"/><circle cx="204" cy="49" r="2.2" fill="#6b4a1f"/>
<path d="M196 54 Q204 58 212 52" stroke="#8a5a22" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<ellipse cx="172" cy="22" rx="5.5" ry="10" fill="#d4a05a" transform="rotate(-18 172 22)"/>
<circle cx="190" cy="32" r="6" fill="#2b2118"/><circle cx="192" cy="30" r="2" fill="#fff"/>
<circle cx="182" cy="46" r="6" fill="#ff8a80" opacity=".5"/>
</svg>`;

SVGS.turtle = `<svg viewBox="0 0 210 170" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="ts__ID__" cx="45%" cy="30%" r="80%"><stop offset="0" stop-color="#d98d45"/><stop offset="1" stop-color="#8a4f1d"/></radialGradient>
<radialGradient id="tg__ID__" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#a8ea6a"/><stop offset="1" stop-color="#5db83a"/></radialGradient></defs>
<ellipse cx="106" cy="160" rx="82" ry="7" fill="#000" opacity=".12"/>
<path d="M28 128 L10 138 L30 140 Z" fill="#6fcb43"/>
<ellipse cx="62" cy="142" rx="21" ry="15" fill="url(#tg__ID__)"/><ellipse cx="146" cy="142" rx="21" ry="15" fill="url(#tg__ID__)"/>
<circle cx="168" cy="98" r="27" fill="url(#tg__ID__)"/>
<circle cx="177" cy="90" r="6.5" fill="#2b2118"/><circle cx="179" cy="88" r="2.2" fill="#fff"/>
<path d="M166 108 Q178 118 190 108" stroke="#2f7a1c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="160" cy="106" r="6" fill="#ff8a80" opacity=".5"/>
<path d="M26 134 C26 52 152 52 152 134 Z" fill="url(#ts__ID__)" stroke="#6b3a14" stroke-width="3" stroke-linejoin="round"/>
<path d="M89 62 L111 74 L111 98 L89 110 L67 98 L67 74 Z" fill="#b8702e" stroke="#6b3a14" stroke-width="3" stroke-linejoin="round"/>
<path d="M89 62 L89 52 M111 74 L128 66 M111 98 L130 106 M89 110 L89 128 M67 98 L48 106 M67 74 L50 66" stroke="#6b3a14" stroke-width="3" stroke-linecap="round"/>
<path d="M58 78 Q72 60 96 58" stroke="#fff" stroke-width="6" opacity=".3" fill="none" stroke-linecap="round"/>
<rect x="22" y="126" width="134" height="14" rx="7" fill="#f0c98a" stroke="#c99550" stroke-width="2.5"/>
</svg>`;

SVGS.snake = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="100" cy="190" rx="70" ry="6" fill="#000" opacity=".12"/>
<path d="M30 168 C60 190 150 190 160 150 C170 110 60 122 62 86 C64 56 108 62 110 44" fill="none" stroke="#2b8a3e" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 168 C60 190 150 190 160 150 C170 110 60 122 62 86 C64 56 108 62 110 44" fill="none" stroke="#5cc85e" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 168 C60 190 150 190 160 150 C170 110 60 122 62 86 C64 56 108 62 110 44" fill="none" stroke="#2b8a3e" stroke-width="11" stroke-linecap="round" stroke-dasharray="1 30" opacity=".85"/>
<path d="M30 168 C60 190 150 190 160 150 C170 110 60 122 62 86 C64 56 108 62 110 44" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 30" stroke-dashoffset="-15" opacity=".35"/>
<ellipse cx="110" cy="34" rx="29" ry="23" fill="#5cc85e" stroke="#2b8a3e" stroke-width="3"/>
<circle cx="99" cy="26" r="8.5" fill="#fff"/><circle cx="121" cy="26" r="8.5" fill="#fff"/>
<circle cx="100.5" cy="27.5" r="4.6" fill="#2b2118"/><circle cx="122.5" cy="27.5" r="4.6" fill="#2b2118"/>
<circle cx="102" cy="26" r="1.6" fill="#fff"/><circle cx="124" cy="26" r="1.6" fill="#fff"/>
<path d="M96 42 Q110 52 126 42" stroke="#1f6b2e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M110 52 L110 66 M110 66 L104 74 M110 66 L116 74" stroke="#e53935" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<circle cx="88" cy="38" r="5" fill="#ff8a80" opacity=".5"/><circle cx="132" cy="38" r="5" fill="#ff8a80" opacity=".5"/>
</svg>`;

/* =====================================================================
   أشكال آثار الأقدام (SVG 100×100) — لون واحد بني
   ===================================================================== */
const PRINT_COLOR = '#5a4030';
const PRINTS = {
  paw: `<ellipse cx="50" cy="66" rx="19" ry="16"/><ellipse cx="24" cy="46" rx="7.5" ry="10" transform="rotate(-20 24 46)"/><ellipse cx="40" cy="30" rx="7.5" ry="10.5"/><ellipse cx="60" cy="30" rx="7.5" ry="10.5"/><ellipse cx="76" cy="46" rx="7.5" ry="10" transform="rotate(20 76 46)"/>`,
  cat: `<path d="M50 52 C34 52 28 66 32 74 C36 82 44 80 50 78 C56 80 64 82 68 74 C72 66 66 52 50 52 Z"/><circle cx="24" cy="46" r="7"/><circle cx="38" cy="32" r="7.5"/><circle cx="62" cy="32" r="7.5"/><circle cx="76" cy="46" r="7"/>`,
  hoof: `<path d="M36 18 C24 22 22 50 28 76 C32 84 42 84 46 76 C48 56 46 30 36 18 Z"/><path d="M64 18 C76 22 78 50 72 76 C68 84 58 84 54 76 C52 56 54 30 64 18 Z"/>`,
  horse: `<path d="M50 14 C20 16 14 58 26 80 C32 88 40 86 42 78 C42 66 44 62 50 62 C56 62 58 66 58 78 C60 86 68 88 74 80 C86 58 80 16 50 14 Z"/>`,
  elephant: `<ellipse cx="50" cy="56" rx="34" ry="32"/><ellipse cx="22" cy="28" rx="7" ry="9" fill="#e9d9bf"/><ellipse cx="42" cy="20" rx="7" ry="9" fill="#e9d9bf"/><ellipse cx="62" cy="20" rx="7" ry="9" fill="#e9d9bf"/><ellipse cx="80" cy="28" rx="7" ry="9" fill="#e9d9bf"/>`,
  bear: `<ellipse cx="50" cy="68" rx="24" ry="20"/><ellipse cx="16" cy="48" rx="7" ry="9" transform="rotate(-25 16 48)"/><ellipse cx="32" cy="32" rx="7" ry="9.5"/><ellipse cx="50" cy="26" rx="7" ry="9.5"/><ellipse cx="68" cy="32" rx="7" ry="9.5"/><ellipse cx="84" cy="48" rx="7" ry="9" transform="rotate(25 84 48)"/><g stroke="${'#5a4030'}" stroke-width="3.5" stroke-linecap="round"><path d="M14 36 L12 26 M31 20 L29 10 M50 14 L50 4 M69 20 L71 10 M86 36 L88 26"/></g>`,
  bird: `<g stroke="${'#5a4030'}" stroke-width="8" stroke-linecap="round" fill="none"><path d="M50 82 L50 24"/><path d="M50 62 L20 34"/><path d="M50 62 L80 34"/></g><circle cx="50" cy="20" r="6"/><circle cx="17" cy="31" r="6"/><circle cx="83" cy="31" r="6"/>`,
  web: `<path d="M50 80 L14 30 Q50 14 86 30 Z"/><g stroke="#f3e6cf" stroke-width="3" stroke-linecap="round"><path d="M50 78 L50 26"/><path d="M50 78 L32 30"/><path d="M50 78 L68 30"/></g>`,
  rabbit: `<ellipse cx="32" cy="70" rx="11" ry="21" transform="rotate(8 32 70)"/><ellipse cx="68" cy="70" rx="11" ry="21" transform="rotate(-8 68 70)"/><ellipse cx="40" cy="26" rx="7" ry="10"/><ellipse cx="60" cy="26" rx="7" ry="10"/>`,
  snake: `<path d="M10 70 C26 38 42 38 50 52 C58 68 74 68 90 34" fill="none" stroke="#5a4030" stroke-width="12" stroke-linecap="round"/><path d="M10 70 C26 38 42 38 50 52 C58 68 74 68 90 34" fill="none" stroke="#f3e6cf" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>`,
  hand: `<ellipse cx="50" cy="66" rx="20" ry="17"/><ellipse cx="22" cy="48" rx="6" ry="14" transform="rotate(-30 22 48)"/><ellipse cx="36" cy="30" rx="6" ry="15" transform="rotate(-8 36 30)"/><ellipse cx="54" cy="26" rx="6" ry="16"/><ellipse cx="72" cy="34" rx="6" ry="14" transform="rotate(14 72 34)"/><ellipse cx="86" cy="54" rx="5.5" ry="11" transform="rotate(40 86 54)"/>`
};
function printSVG(type) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="${PRINT_COLOR}">${PRINTS[type]}</g></svg>`;
}

/* =====================================================================
   الشخصية الرئيسية "سامي المستكشف"
   تتغير تعابيرها عبر data-mood: happy | think | listen | point | clap | celebrate
   ===================================================================== */
function mascotSVG() {
  return `<svg class="mascot" data-mood="happy" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<ellipse cx="110" cy="294" rx="62" ry="6" fill="#000" opacity=".14"/>
<g class="m-body">
  <rect x="50" y="152" width="26" height="70" rx="12" fill="#e8743b"/><rect x="144" y="152" width="26" height="70" rx="12" fill="#d9622b"/>
  <rect x="86" y="248" width="20" height="36" rx="9" fill="#ffd2a6"/><rect x="114" y="248" width="20" height="36" rx="9" fill="#ffd2a6"/>
  <ellipse cx="94" cy="286" rx="17" ry="9" fill="#8b5a2b"/><ellipse cx="126" cy="286" rx="17" ry="9" fill="#8b5a2b"/>
  <rect x="72" y="150" width="76" height="88" rx="28" fill="#3fbf6a"/>
  <path d="M72 168 Q72 150 94 150 L100 150 L100 236 L86 236 Q72 236 72 220 Z" fill="#d8b25c"/>
  <path d="M148 168 Q148 150 126 150 L120 150 L120 236 L134 236 Q148 236 148 220 Z" fill="#d8b25c"/>
  <rect x="80" y="196" width="16" height="14" rx="4" fill="#c29a45"/><rect x="124" y="196" width="16" height="14" rx="4" fill="#c29a45"/>
  <rect x="74" y="226" width="72" height="30" rx="12" fill="#4a78c2"/>
  <g class="arm armL"><rect x="72" y="156" width="17" height="54" rx="8.5" fill="#ffd2a6"/><circle cx="80.5" cy="214" r="11" fill="#ffd2a6"/></g>
  <g class="arm armR"><rect x="131" y="156" width="17" height="54" rx="8.5" fill="#ffd2a6"/><circle cx="139.5" cy="214" r="11" fill="#ffd2a6"/></g>
</g>
<g class="m-head">
  <ellipse cx="62" cy="108" rx="9" ry="12" fill="#f5bf94"/><ellipse cx="158" cy="108" rx="9" ry="12" fill="#f5bf94"/>
  <circle cx="110" cy="106" r="52" fill="#ffd9b0"/>
  <path d="M60 92 Q62 70 80 66 L80 90 Z M160 92 Q158 70 140 66 L140 90 Z" fill="#6b3f1d"/>
  <ellipse cx="110" cy="74" rx="76" ry="17" fill="#c9a24b"/>
  <path d="M60 74 C60 14 160 14 160 74 Z" fill="#e3bd62"/>
  <rect x="60" y="56" width="100" height="14" rx="6" fill="#8b5a2b"/>
  <path d="M142 56 Q160 30 176 36 Q160 38 150 58 Z" fill="#e8743b"/>
  <circle cx="80" cy="128" r="9" fill="#ff9aa2" opacity=".6"/><circle cx="140" cy="128" r="9" fill="#ff9aa2" opacity=".6"/>
  <g class="eyes eyes-normal">
    <ellipse cx="92" cy="106" rx="11" ry="13.5" fill="#fff"/><ellipse cx="128" cy="106" rx="11" ry="13.5" fill="#fff"/>
    <g class="pupils"><circle cx="93" cy="108" r="7.5" fill="#3a2414"/><circle cx="127" cy="108" r="7.5" fill="#3a2414"/><circle cx="95.5" cy="105" r="2.6" fill="#fff"/><circle cx="129.5" cy="105" r="2.6" fill="#fff"/></g>
  </g>
  <g class="eyes eyes-happy" fill="none" stroke="#3a2414" stroke-width="5" stroke-linecap="round"><path d="M81 110 Q92 96 103 110"/><path d="M117 110 Q128 96 139 110"/></g>
  <g class="brows" stroke="#6b3f1d" stroke-width="4" stroke-linecap="round" fill="none"><path class="brow bl" d="M82 88 Q92 83 102 88"/><path class="brow br" d="M118 88 Q128 83 138 88"/></g>
  <path class="mouth mouth-smile" d="M94 130 Q110 146 126 130" stroke="#8a3b2a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <g class="mouth mouth-open"><path d="M90 126 Q110 160 130 126 Z" fill="#8a2e1e"/><ellipse cx="110" cy="144" rx="11" ry="6.5" fill="#ff7a8a"/></g>
  <ellipse class="mouth mouth-o" cx="110" cy="136" rx="6.5" ry="7.5" fill="#8a2e1e"/>
</g>
<g class="m-q"><circle cx="176" cy="40" r="20" fill="#fff" stroke="#ffb300" stroke-width="4"/><text x="176" y="49" text-anchor="middle" font-size="26" font-weight="900" fill="#ff7a00" font-family="sans-serif">؟</text></g>
</svg>`;
}
