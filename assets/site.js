// Shared behaviour for every page: language, links, viewer, certificates, tabs, motion.
document.documentElement.classList.add("js");
const TG = "https://t.me/mas_note", WA = "https://wa.me/9647876004990", SITE = "https://mohammedameensajjad-web.github.io/";
const DOCS = {
  cv: {ar: "السيرة الذاتية", en: "Curriculum Vitae"},
  "ws-engineer": {ar: "ورشة الطالب المهندس × الذكاء الاصطناعي", en: "The Engineering Student × AI — slides"},
  "ws-civil": {ar: "ورشة الهندسة المدنية والذكاء الاصطناعي", en: "Civil Engineering & AI — slides"},
  "ai-station": {ar: "تقرير محطة أدوات الذكاء الاصطناعي — 1447هـ", en: "AI Tools Station — 1447 AH report"},
  "ai-station-guide": {ar: "دليل زائر محطة الذكاء الاصطناعي — 1448هـ", en: "AI Tools Station — 1448 AH visitor guide"},
  certs: {ar: "الشهادات", en: "Certificates"}
};
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const en = () => document.documentElement.lang === "en";
const STATIC = location.search.includes("static");
let MAN = null, CERTS = [], CF = "all", rotTimer;

$$(".tg").forEach(a => a.href = a.dataset.id ? `${TG}/${a.dataset.id}` : TG);
const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

// Current page in the nav and the mobile tab bar
const page = document.body.dataset.page;
$$("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === page));

// WhatsApp links carry a ready message
function waText(topic) {
  return WA + "?text=" + encodeURIComponent((en() ? "Hi, I'd like to talk about " : "مرحباً، أريد أتواصل بخصوص ") + topic + ".");
}
function waLinks() {
  const L = en();
  $$(".wa").forEach(a => a.href = waText(L ? a.dataset.msgEn || "a project" : a.dataset.msg || "مشروع"));
}

// Language
function setLang(l) {
  document.documentElement.lang = l; document.documentElement.dir = l === "en" ? "ltr" : "rtl";
  $$("[data-en]").forEach(el => {
    if (el.dataset.ar === undefined) el.dataset.ar = el.innerHTML;
    el.innerHTML = l === "en" ? el.dataset.en : el.dataset.ar;
  });
  const b = $("#lang"); if (b) b.textContent = l === "en" ? "عربي" : "EN";
  waLinks(); if (CERTS.length) renderCerts(); rotWords();
  try { localStorage.setItem("lang", l) } catch (e) {}
}
const lb = $("#lang"); if (lb) lb.onclick = () => setLang(en() ? "ar" : "en");
let saved = null; try { saved = localStorage.getItem("lang") } catch (e) {}
setLang(saved || (new URLSearchParams(location.search).get("lang") === "en" ? "en" : "ar"));

// Rotating words in the home headline

function rotWords() {
  const r = $(".rot"); if (!r) return;
  const words = (en() ? r.dataset.wordsEn : r.dataset.words).split("|");
  r.innerHTML = words.map((w, i) => `<span class="${i ? "" : "on"}">${w}</span>`).join("");
  clearInterval(rotTimer);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  rotTimer = setInterval(() => {
    const s = r.children; s[i].classList.remove("on"); i = (i + 1) % s.length; s[i].classList.add("on");
  }, 2400);
}

// Reveal on scroll
const rv = $$(".rv");
if (STATIC || !("IntersectionObserver" in window)) rv.forEach(e => e.classList.add("in"));
else {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }), {rootMargin: "0px 0px -8% 0px"});
  rv.forEach(e => io.observe(e));
}

// Counters
$$("[data-count]").forEach(el => {
  const end = +el.dataset.count, pre = el.dataset.pre || "", run = () => {
    if (STATIC) { el.textContent = pre + end; return }
    const t0 = performance.now(), d = 1400;
    const step = t => { const k = Math.min(1, (t - t0) / d); el.textContent = pre + Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step) };
    requestAnimationFrame(step);
  };
  if (!("IntersectionObserver" in window)) return run();
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { run(); io.disconnect() } });
  io.observe(el);
});

// Sub tabs (about page), routed on the hash
const panes = $$(".tabpane");
if (panes.length) {
  const show = id => {
    if (!document.getElementById(id)) id = panes[0].id;
    panes.forEach(p => p.hidden = p.id !== id);
    $$(".stabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === id));
    $$(".tabpane#" + id + " .rv").forEach(e => e.classList.add("in"));
  };
  $$(".stabs button").forEach(b => b.onclick = () => { history.replaceState(null, "", "#" + b.dataset.tab); show(b.dataset.tab); scrollTo({top: 0}) });
  addEventListener("hashchange", () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
}

// Certificates: thumbnails with filters; "key" ones first; click to enlarge
const GROUPS = {tech: ["تقنية ومعتمدة", "Technical"], pro: ["تطوير مهني وريادة", "Professional"], honor: ["تكريم وتطوع", "Recognition"]};
const KEY = [0, 1, 2, 3, 13, 18, 19, 20];
if ($("#certlist")) CF = "key";
let SHOWN = [];
function renderCerts() {
  const box = $("#certlist"); if (!box) return;
  const L = en(), f = $("#cfilters");
  f.innerHTML = [["key", L ? `Key · ${KEY.length}` : `الأساسية · ${KEY.length}`], ["all", L ? `All · ${CERTS.length}` : `الكل · ${CERTS.length}`]]
    .concat(Object.entries(GROUPS).map(([k, v]) => [k, `${L ? v[1] : v[0]} · ${CERTS.filter(c => c.g === k).length}`]))
    .map(([k, t]) => `<button type="button" data-f="${k}" class="${k === CF ? "on" : ""}">${t}</button>`).join("");
  f.querySelectorAll("button").forEach(b => b.onclick = () => { CF = b.dataset.f; renderCerts() });
  SHOWN = CF === "key" ? KEY.filter(i => CERTS[i]) : CERTS.map((c, i) => i).filter(i => CF === "all" || CERTS[i].g === CF);
  box.innerHTML = SHOWN.map((i, k) => { const c = CERTS[i];
    return `<button type="button" class="cert" data-k="${k}"><span class="th"><img src="${c.img.replace("/certs/", "/certs/t/")}" alt="" loading="lazy" draggable="false"></span><b>${L ? c.te : c.ta}</b><small>${L ? c.ie : c.ia}${c.d ? " · " + c.d : ""}</small></button>` }).join("");
  box.querySelectorAll(".cert").forEach(b => b.onclick = () => openCert(+b.dataset.k));
}
// Lightbox shared by certificates and screenshots: LB = [{src, t, s}]
let LBK = 0, LB = [];
function openCert(k) {
  const L = en();
  LB = SHOWN.map(i => { const c = CERTS[i]; return {src: c.img, t: L ? c.te : c.ta, s: (L ? c.ie : c.ia) + (c.d ? " · " + c.d : "")} });
  openLB(k);
}
function openLB(k) {
  if (!$("#lb")) {
    document.body.insertAdjacentHTML("beforeend", `<div class="lb" id="lb" role="dialog" aria-modal="true"><img id="lbimg" alt=""><div class="cap"><b id="lbt"></b><small id="lbs"></small></div>
      <div class="ctl"><button type="button" id="lbn" aria-label="next"><svg class="i" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><span class="n" id="lbc"></span><button type="button" id="lbp" aria-label="previous"><svg class="i" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button><button type="button" id="lbx" aria-label="close">✕</button></div></div>`);
    const lb = $("#lb");
    lb.onclick = e => { if (e.target === lb) closeLB() };
    lb.oncontextmenu = e => e.preventDefault();
    $("#lbx").onclick = closeLB;
    $("#lbn").onclick = () => openLB((LBK + 1) % LB.length);
    $("#lbp").onclick = () => openLB((LBK - 1 + LB.length) % LB.length);
    let x0 = null;
    lb.addEventListener("touchstart", e => x0 = e.touches[0].clientX, {passive: true});
    lb.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) (dx > 0 ? $("#lbn") : $("#lbp")).click(); x0 = null });
  }
  LBK = k; const it = LB[k], img = $("#lbimg");
  img.style.animation = "none"; img.offsetHeight; img.style.animation = "";
  img.src = it.src; $("#lbt").textContent = it.t; $("#lbs").textContent = it.s || "";
  $("#lbc").textContent = `${k + 1} / ${LB.length}`;
  $("#lb").classList.add("on"); document.body.style.overflow = "hidden";
}
function closeLB() { const lb = $("#lb"); if (lb) lb.classList.remove("on"); document.body.style.overflow = "" }
addEventListener("keydown", e => {
  const lb = $("#lb"); if (!lb || !lb.classList.contains("on")) return;
  if (e.key === "Escape") closeLB();
  if (e.key === "ArrowLeft") $("#lbn").click();
  if (e.key === "ArrowRight") $("#lbp").click();
});
// Screenshot galleries: <div data-gallery> holding .shot buttons (data-src, title in <b>, caption in <small>)
$$("[data-gallery]").forEach(g => {
  const shots = [...g.querySelectorAll(".shot")];
  shots.forEach((b, k) => b.onclick = () => {
    LB = shots.map(x => ({src: x.dataset.src, t: x.querySelector("b").textContent, s: x.querySelector("small") ? x.querySelector("small").textContent : ""}));
    openLB(k);
  });
});
$$("[data-open-gallery]").forEach(b => b.onclick = () => { const s = document.querySelector(`#${b.dataset.openGallery} .shot`); if (s) s.click() });
if ($("#certlist")) fetch("assets/docs/certs.json").then(r => r.json()).then(c => { CERTS = c; renderCerts() }).catch(() => {});

// Books: tap to open the cover a little more
$$(".book").forEach(b => b.onclick = () => { const on = !b.classList.contains("open"); $$(".book.open").forEach(x => x.classList.remove("open")); b.classList.toggle("open", on) });

// View-only document viewer
if ($$("[data-doc]").length) {
  document.body.insertAdjacentHTML("beforeend", `<div class="viewer" id="viewer" role="dialog" aria-modal="true"><div class="vbar"><b id="vtitle"></b><small id="vcount"></small><button class="vclose" id="vclose" aria-label="إغلاق">✕</button></div><div class="vpages" id="vpages"></div></div>`);
  fetch("assets/docs/manifest.json").then(r => r.json()).then(m => MAN = m).catch(() => {});
}
function openDoc(slug, page) {
  const d = MAN && MAN[slug]; if (!d) return;
  const V = $("#viewer"), VP = $("#vpages"), L = en(), shown = d.pages.length, total = d.total;
  $("#vtitle").textContent = DOCS[slug][L ? "en" : "ar"];
  $("#vcount").textContent = shown < total ? (L ? `${shown} of ${total} pages` : `${shown} من ${total} صفحة`) : (L ? `${total} pages` : `${total} صفحة`);
  VP.innerHTML = d.pages.map(p => `<img src="${p}" alt="" loading="lazy" draggable="false">`).join("") +
    `<div class="vnote">${L ? "Preview only." : "للعرض فقط."}${shown < total ? (L ? " Full document on request." : " النسخة الكاملة عند الطلب.") : ""}</div>`;
  V.classList.add("on"); document.body.style.overflow = "hidden"; VP.scrollTop = 0;
  if (page) setTimeout(() => VP.children[page] && VP.children[page].scrollIntoView({block: "start"}), 80);
  V.onclick = e => { if (e.target === V || e.target === VP) closeDoc() };
  V.oncontextmenu = e => e.preventDefault();
  $("#vclose").onclick = closeDoc;
}
function closeDoc() { const V = $("#viewer"); if (V) V.classList.remove("on"); document.body.style.overflow = "" }
$$("[data-doc]").forEach(b => b.addEventListener("click", () => openDoc(b.dataset.doc, 0)));
addEventListener("keydown", e => { if (e.key === "Escape") closeDoc() });

// Contact page: pick a company, compose a WhatsApp message
const form = $("#cform");
if (form) {
  const sel = $("#cto");
  $$(".pick button").forEach(b => b.onclick = () => { sel.value = b.dataset.v; $$(".pick button").forEach(x => x.classList.toggle("on", x === b)) });
  const want = new URLSearchParams(location.search).get("to");
  if (want) { const b = document.querySelector(`.pick button[data-k="${want}"]`); if (b) b.click() }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const L = en(), to = sel.value, name = $("#cname").value.trim(), msg = $("#cmsg").value.trim();
    const text = (L ? `Hi, I'm contacting ${to}.` : `مرحباً، أتواصل ويا ${to}.`) + (name ? (L ? ` My name is ${name}.` : ` اسمي ${name}.`) : "") + (msg ? "\n" + msg : "");
    window.open(WA + "?text=" + encodeURIComponent(text), "_blank");
  });
}
if ($("#qr") && window.qrcode) {
  try {
    const q = qrcode(0, "M"); q.addData(SITE); q.make();
    $("#qr").innerHTML = q.createSvgTag({cellSize: 6, margin: 0, scalable: true});
  } catch (e) {}
}
const vc = $("#vcard");
if (vc) vc.onclick = () => {
  const v = ["BEGIN:VCARD", "VERSION:3.0", "N:Sajjad;Mohammed Ameen;;;", "FN:Mohammed Ameen Sajjad", "ORG:MAS Business Solutions",
    "TITLE:Electronics & Communications Engineer", "TEL;TYPE=WORK:+9647876004990", "EMAIL:mohammed.ameen.sajjad@gmail.com",
    "URL:" + SITE, "END:VCARD"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([v], {type: "text/vcard"})); a.download = "Mohammed-Ameen.vcf"; a.click();
};

// Home: a calm neural network. Nodes drift very slowly, faint links appear between close nodes, glow breathes.
const cv = $("#circuit");
if (cv && cv.getContext) {
  const ctx = cv.getContext("2d"), still = matchMedia("(prefers-reduced-motion: reduce)").matches || STATIC;
  let W, H, nodes = [], run = true, raf, t0 = performance.now();
  function build() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(14, Math.min(34, Math.round(W * H / 22000)));
    nodes = Array.from({length: n}, () => ({x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12, r: 1.4 + Math.random() * 1.8, ph: Math.random() * 6.28}));
  }
  function draw(now) {
    const t = ((now || performance.now()) - t0) / 1000, D = Math.min(190, W / 5);
    ctx.clearRect(0, 0, W, H);
    for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
      const p = nodes[a], q = nodes[b], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < D) { ctx.strokeStyle = `rgba(255,195,0,${(1 - d / D) * .14})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke() }
    }
    nodes.forEach(p => {
      const glow = .35 + .25 * Math.sin(t * .8 + p.ph);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      g.addColorStop(0, `rgba(255,205,60,${glow})`); g.addColorStop(1, "rgba(255,170,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,214,90,${.5 + glow * .5})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
    });
    if (!still && run) raf = requestAnimationFrame(draw);
  }
  build(); draw();
  addEventListener("resize", () => { build(); if (still) draw() });
  if ("IntersectionObserver" in window && !still) new IntersectionObserver(es => { run = es[0].isIntersecting; cancelAnimationFrame(raf); if (run) raf = requestAnimationFrame(draw) }).observe(cv);
}

// Intro video: plays by itself when it scrolls into view. Browsers only allow sound after the visitor has tapped the page,
// so it starts with sound if they already have, otherwise muted with a big "tap for sound" button.
const iv = $("#introv");
if (iv) {
  const um = $("#unmute"), rp = $("#replay");
  const withSound = () => { iv.muted = false; iv.currentTime = 0; um.hidden = true; rp.hidden = true; iv.play().catch(() => { iv.muted = true; um.hidden = false; iv.play().catch(() => {}) }) };
  const auto = () => {
    if (!iv.paused || iv.ended) return;
    const active = navigator.userActivation && navigator.userActivation.hasBeenActive;
    iv.muted = !active; um.hidden = active;
    iv.play().catch(() => { iv.muted = true; um.hidden = false; iv.play().catch(() => {}) });
  };
  um.onclick = withSound;
  rp.onclick = withSound;
  iv.onclick = () => { if (iv.muted) withSound(); else if (iv.paused) iv.play(); else iv.pause() };
  iv.onended = () => { rp.hidden = false; um.hidden = true };
  if ("IntersectionObserver" in window && !STATIC) {
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) auto(); else if (!iv.paused) iv.pause() }), {threshold: .45}).observe(iv);
  }
  const go = $("#playintro");
  if (go) go.onclick = () => { $("#story").scrollIntoView({behavior: "smooth", block: "center"}); withSound() };
}
