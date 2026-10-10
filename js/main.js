(() => {
  "use strict";
  const SZ = window.SZ || {};
  const EMAIL = SZ.email || "SpottedZebraMusic@gmail.com";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mailto = (subject, body) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  /* ── Shared audio (lazy, created on first user gesture) ─────────────── */
  let ctx, master;
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createDynamicsCompressor();
      const vol = ctx.createGain();
      vol.gain.value = 0.6;
      master.connect(vol).connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  const freq = (semi) => 261.63 * Math.pow(2, semi / 12); // semitones from middle C

  const VOICES = {
    synth: { types: ["sawtooth", "square"], detune: 9, attack: 0.01, release: 0.5, cutoff: 2400, oct: 0 },
    organ: { types: ["sine", "sine"], detune: 1200, attack: 0.02, release: 0.3, cutoff: 5000, oct: 0 },
    bass: { types: ["triangle", "sawtooth"], detune: 4, attack: 0.005, release: 0.35, cutoff: 700, oct: -2 },
  };
  let voice = "synth";

  function playNote(semi, v = VOICES[voice], gain = 0.25) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const f = freq(semi + v.oct * 12);
    const amp = ac.createGain();
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(v.cutoff * 1.6, t);
    lp.frequency.exponentialRampToValueAtTime(v.cutoff, t + 0.25);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + v.attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + v.attack + v.release);
    lp.connect(amp).connect(master);
    v.types.forEach((type, i) => {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = i ? v.detune : 0;
      o.connect(lp);
      o.start(t);
      o.stop(t + v.attack + v.release + 0.05);
    });
  }

  /* ── Custom cursor ──────────────────────────────────────────────────── */
  const cursor = $(".cursor");
  if (cursor && matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("is-big", !!e.target.closest("a, button, label, input, .key"));
    });
  }

  /* ── Nav background on scroll ───────────────────────────────────────── */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── HERO: living zebra stripes + droppable spots ───────────────────── */
  const canvas = $("#stripes");
  const g = canvas.getContext("2d");
  const hero = $(".hero");
  let W, H, DPR;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  const spots = [];
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
  }
  resize();
  addEventListener("resize", resize);

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.tx = e.clientX - r.left;
    mouse.ty = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => { mouse.tx = mouse.ty = -9999; });

  function dropSpot(x, y, play = true) {
    const hot = Math.random() < 0.7;
    spots.push({ x, y, r: 0, max: 30 + Math.random() * 70, life: 1, color: hot ? "255,46,99" : "255,210,63" });
    if (spots.length > 40) spots.shift();
    if (play) playNote(PENTA[Math.floor((1 - y / H) * PENTA.length)] ?? 0, VOICES.synth, 0.18);
  }
  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    const r = hero.getBoundingClientRect();
    dropSpot(e.clientX - r.left, e.clientY - r.top);
    $(".hero__hint")?.remove();
  });

  let heroVisible = true;
  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);

  function drawStripes(time) {
    const t = time * 0.00025;
    if (mouse.tx > -9000) {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
    } else { mouse.x = mouse.y = -9999; }

    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.fillStyle = "#0a0a0a";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#e9e5dc";

    const count = Math.max(10, Math.round(W / 70));
    const band = W / count;
    const step = 14;
    for (let i = -2; i < count + 2; i += 2) {
      g.beginPath();
      // left edge going down, right edge going up -> a wavy filled stripe
      for (let y = -step; y <= H + step; y += step) g.lineTo(edgeX(i * band, y, t, i), y);
      for (let y = H + step; y >= -step; y -= step) g.lineTo(edgeX((i + 1) * band, y, t, i + 1), y);
      g.closePath();
      g.fill();
    }

    // spots
    for (let i = spots.length - 1; i >= 0; i--) {
      const s = spots[i];
      s.r += (s.max - s.r) * 0.18;
      if (s.r > s.max * 0.95) s.life -= 0.004;
      if (s.life <= 0) { spots.splice(i, 1); continue; }
      g.fillStyle = `rgba(${s.color},${Math.min(1, s.life * 1.4)})`;
      g.beginPath();
      g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      g.fill();
    }
  }

  function edgeX(x0, y, t, idx) {
    // layered sine waves for an organic zebra-hide look
    let x = x0
      + Math.sin(y * 0.006 + t * 3 + idx * 0.7) * 28
      + Math.sin(y * 0.017 - t * 2 + idx * 1.3) * 9
      + Math.sin(y * 0.002 + idx) * 40;
    // stripes bend away from the cursor
    const dx = x - mouse.x, dy = y - mouse.y;
    const d2 = dx * dx + dy * dy;
    const R = 180;
    if (d2 < R * R * 4) {
      const f = Math.exp(-d2 / (R * R));
      x += (dx / R) * f * 60;
    }
    return x;
  }

  function loop(time) {
    if (heroVisible) drawStripes(time);
    requestAnimationFrame(loop);
  }
  if (reduceMotion) drawStripes(0); else requestAnimationFrame(loop);

  // a couple of spots to start with so the idea is obvious
  if (!reduceMotion) setTimeout(() => {
    dropSpot(W * 0.18, H * 0.3, false);
    dropSpot(W * 0.82, H * 0.7, false);
  }, 600);

  /* ── Spotlight photo ────────────────────────────────────────────────── */
  const spot = $("#spotlight");
  if (spot) {
    let user = false, a = 0;
    const set = (x, y) => { spot.style.setProperty("--x", x + "%"); spot.style.setProperty("--y", y + "%"); };
    spot.addEventListener("pointermove", (e) => {
      user = true;
      const r = spot.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    });
    spot.addEventListener("pointerleave", () => { user = false; });
    // slow wander across the band when nobody is steering
    if (!reduceMotion) {
      (function wander() {
        if (!user) { a += 0.008; set(50 + Math.sin(a) * 34, 50 + Math.sin(a * 1.7) * 8); }
        requestAnimationFrame(wander);
      })();
    } else {
      spot.style.setProperty("--r", "120%");
    }
  }

  /* ── Count-up stats + reveal on scroll ──────────────────────────────── */
  $$(".section-head, .about__text, .spotlight, .jukebox__body, .keys, .shows__list, .book__grid").forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));

  function countUp(el) {
    const end = +el.dataset.count;
    const start = end > 1000 ? end - 40 : 0;
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / 1200);
      el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ── Jukebox ────────────────────────────────────────────────────────── */
  const setlist = SZ.setlist || {};
  const decades = Object.keys(setlist);
  const decadesEl = $(".decades");
  const songsEl = $("#songs");
  const picked = new Set();
  let current = decades[0];

  decades.forEach((d, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.role = "tab";
    b.innerHTML = `${d}<small>${String.fromCharCode(65 + i)}${i + 1}</small>`;
    b.setAttribute("aria-selected", String(d === current));
    b.addEventListener("click", () => { current = d; renderSongs(); click(); });
    decadesEl.appendChild(b);
  });

  function click() { playNote(19, VOICES.organ, 0.08); }

  function renderSongs() {
    $$("button", decadesEl).forEach((b, i) => b.setAttribute("aria-selected", String(decades[i] === current)));
    songsEl.innerHTML = "";
    (setlist[current] || []).forEach((song) => {
      const key = `${current} — ${song}`;
      const li = document.createElement("li");
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = picked.has(key);
      box.addEventListener("change", () => {
        box.checked ? picked.add(key) : picked.delete(key);
        if (box.checked) { li.classList.remove("is-pop"); void li.offsetWidth; li.classList.add("is-pop"); playNote(24, VOICES.synth, 0.1); }
        updateReq();
      });
      label.append(document.createTextNode(song), box);
      li.appendChild(label);
      songsEl.appendChild(li);
    });
  }

  const reqCount = $("#reqCount");
  const sendReq = $("#sendReq");
  function updateReq() {
    const n = picked.size;
    reqCount.textContent = `${n} request${n === 1 ? "" : "s"}`;
    sendReq.setAttribute("aria-disabled", String(n === 0));
    sendReq.href = n ? mailto("Song requests for Spotted Zebra", `Hey Spotted Zebra! Please play:\n\n${[...picked].map((s) => "• " + s).join("\n")}\n\nThanks!`) : "#";
  }

  const vinyl = $("#vinyl");
  const now = $("#now");
  $("#shuffle").addEventListener("click", () => {
    vinyl.classList.add("is-spinning");
    const all = decades.flatMap((d) => (setlist[d] || []).map((s) => [d, s]));
    if (!all.length) return;
    let n = 0;
    const roll = setInterval(() => {
      const [d, s] = all[Math.floor(Math.random() * all.length)];
      now.textContent = s;
      playNote(PENTA[n % PENTA.length], VOICES.organ, 0.05);
      if (++n > 12) {
        clearInterval(roll);
        current = d;
        renderSongs();
        now.textContent = `♫ ${s} (${d})`;
        setTimeout(() => vinyl.classList.remove("is-spinning"), 2500);
      }
    }, reduceMotion ? 1 : 90);
  });

  renderSongs();
  updateReq();

  /* ── Play the Zebra ─────────────────────────────────────────────────── */
  const keysEl = $("#keys");
  const KEYMAP = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k"];
  const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"];
  const keyEls = KEYMAP.map((k, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "key";
    b.setAttribute("aria-label", `Note ${NAMES[i]} (key ${k.toUpperCase()})`);
    b.innerHTML = `<i class="dot"></i><span>${k}</span>`;
    keysEl.appendChild(b);
    return b;
  });

  function hit(i) {
    const k = keyEls[i];
    if (!k) return;
    playNote(i);
    k.classList.remove("is-down");
    void k.offsetWidth;
    k.classList.add("is-down");
    clearTimeout(k._t);
    k._t = setTimeout(() => k.classList.remove("is-down"), 180);
  }

  // pointer: allow dragging across stripes like a glissando
  let dragging = false, lastKey = -1;
  keysEl.addEventListener("pointerdown", (e) => {
    const i = keyEls.indexOf(e.target.closest(".key"));
    if (i < 0) return;
    dragging = true; lastKey = i; hit(i);
  });
  keysEl.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const i = keyEls.indexOf(el && el.closest(".key"));
    if (i >= 0 && i !== lastKey) { lastKey = i; hit(i); }
  });
  addEventListener("pointerup", () => { dragging = false; lastKey = -1; });
  // keyboard activation on a focused key (Enter/Space) without double-firing pointer
  keyEls.forEach((k, i) => k.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(i); }
  }));

  const held = new Set();
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input, textarea")) return;
    const i = KEYMAP.indexOf(e.key.toLowerCase());
    if (i < 0 || held.has(i)) return;
    const r = keysEl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return; // only when the keyboard is on screen
    held.add(i);
    hit(i);
  });
  addEventListener("keyup", (e) => held.delete(KEYMAP.indexOf(e.key.toLowerCase())));

  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    voice = b.dataset.voice;
    $$(".seg button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    playNote(0);
  }));

  // drum machine: kick / snare / hat at 112 bpm, scheduled ahead for tight timing
  const beatBtn = $("#beat");
  let beatOn = false, nextT = 0, stepN = 0, timer;
  const BPM = 112, SIXTEENTH = 60 / BPM / 4;
  const PATTERN = {
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
    hat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
  };
  let noiseBuf;
  function noise() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    return s;
  }
  function kick(t) {
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    a.gain.setValueAtTime(0.9, t);
    a.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(a).connect(master); o.start(t); o.stop(t + 0.36);
  }
  function snare(t) {
    const n = noise(), f = ctx.createBiquadFilter(), a = ctx.createGain();
    f.type = "highpass"; f.frequency.value = 1200;
    a.gain.setValueAtTime(0.45, t);
    a.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    n.connect(f).connect(a).connect(master); n.start(t); n.stop(t + 0.2);
  }
  function hat(t) {
    const n = noise(), f = ctx.createBiquadFilter(), a = ctx.createGain();
    f.type = "highpass"; f.frequency.value = 7000;
    a.gain.setValueAtTime(0.16, t);
    a.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.connect(f).connect(a).connect(master); n.start(t); n.stop(t + 0.06);
  }
  function scheduler() {
    while (nextT < ctx.currentTime + 0.12) {
      const s = stepN % 16;
      if (PATTERN.kick[s]) kick(nextT);
      if (PATTERN.snare[s]) snare(nextT);
      if (PATTERN.hat[s]) hat(nextT);
      nextT += SIXTEENTH;
      stepN++;
    }
  }
  beatBtn.addEventListener("click", () => {
    if (!audio()) return;
    beatOn = !beatOn;
    beatBtn.setAttribute("aria-pressed", String(beatOn));
    beatBtn.textContent = `Beat: ${beatOn ? "on" : "off"}`;
    clearInterval(timer);
    if (beatOn) { nextT = ctx.currentTime + 0.05; stepN = 0; timer = setInterval(scheduler, 25); }
  });
  // stop the beat if the tab is hidden
  document.addEventListener("visibilitychange", () => { if (document.hidden && beatOn) beatBtn.click(); });

  /* ── Shows ──────────────────────────────────────────────────────────── */
  const showList = $("#showList");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = (SZ.shows || [])
    .map((s) => ({ ...s, d: new Date(s.date + "T00:00:00") }))
    .filter((s) => !isNaN(s.d) && s.d >= today)
    .sort((a, b) => a.d - b.d);

  if (!upcoming.length) {
    showList.outerHTML = `<div class="shows__empty">
      <p>No public shows on the calendar right now.</p>
      <p>Follow along on <a href="${SZ.socials?.instagram || "#"}" target="_blank" rel="noopener">Instagram</a> for the next one &mdash; or <a href="#book">book us</a> and make it yours.</p>
    </div>`;
  } else {
    upcoming.forEach((s) => {
      const li = document.createElement("li");
      li.className = "show";
      const mon = s.d.toLocaleString("en-US", { month: "short" });
      const dow = s.d.toLocaleString("en-US", { weekday: "long" });
      const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      li.innerHTML = `
        <div class="show__date">${mon}<b>${s.d.getDate()}</b></div>
        <div><div class="show__venue">${esc(s.venue)}</div><div class="show__meta">${esc(dow)}${s.time ? " · " + esc(s.time) : ""}${s.city ? " · " + esc(s.city) : ""}</div></div>
        ${s.link ? `<a class="btn btn--ghost" href="${esc(s.link)}" target="_blank" rel="noopener">Details</a>` : ""}`;
      showList.appendChild(li);
    });
  }

  /* ── Gig builder + live ticket ──────────────────────────────────────── */
  const form = $("#gig");
  const ticket = $("#ticket");
  const T = (k) => $(`[data-t="${k}"]`, ticket);
  const crowdOut = $("#crowdOut");
  $("#ticketNo").textContent = String(Math.floor(Math.random() * 9000) + 1000);

  $$(".chips", form).forEach((group) => {
    const multi = group.hasAttribute("data-multi");
    $$(".chip", group).forEach((chip) => chip.addEventListener("click", () => {
      const on = chip.getAttribute("aria-pressed") !== "true";
      if (!multi) $$(".chip", group).forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", String(on));
      if (on) playNote(12 + Math.floor(Math.random() * 7), VOICES.synth, 0.08);
      updateTicket(true);
    }));
  });
  form.addEventListener("input", () => updateTicket(false));

  const chosen = (name) => $$(`.chips[data-name="${name}"] .chip[aria-pressed="true"]`, form).map((c) => c.textContent.trim());

  function updateTicket(bump) {
    const f = form.elements;
    const ev = chosen("event")[0];
    const dec = chosen("decades");
    const crowd = f.crowd.value + (f.crowd.value === f.crowd.max ? "+" : "");
    crowdOut.textContent = `${crowd} people`;
    T("event").textContent = ev || "Your event";
    T("decades").textContent = dec.length ? dec.join(" · ") : "All of them";
    T("crowd").textContent = crowd;
    T("name").textContent = f.name.value.trim() || "You";
    T("date").textContent = f.date.value
      ? new Date(f.date.value + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "TBD";
    if (bump && !reduceMotion) { ticket.classList.remove("is-printed"); void ticket.offsetWidth; ticket.classList.add("is-printed"); }
  }
  updateTicket(false);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    const err = $("#formError");
    if (!f.name.value.trim()) { err.textContent = "Tell us your name so we know who to rock for."; f.name.focus(); return; }
    if (!f.email.value.trim() || !f.email.checkValidity()) { err.textContent = "We need a valid email to get back to you."; f.email.focus(); return; }
    err.textContent = "";
    const body = [
      `Name: ${f.name.value.trim()}`,
      `Email: ${f.email.value.trim()}`,
      `Event: ${chosen("event")[0] || "Not specified"}`,
      `Date: ${f.date.value || "TBD"}`,
      `Crowd size: ${T("crowd").textContent}`,
      `Decades: ${T("decades").textContent}`,
      picked.size ? `Song requests:\n${[...picked].map((s) => "  • " + s).join("\n")}` : null,
      "",
      f.message.value.trim(),
    ].filter((l) => l !== null).join("\n");
    location.href = mailto(`Booking request: ${chosen("event")[0] || "event"} ${f.date.value ? "on " + f.date.value : ""}`.trim(), body);
    // little celebration
    for (let i = 0; i < 5; i++) setTimeout(() => playNote([0, 4, 7, 12, 16][i], VOICES.synth, 0.12), i * 90);
    ticket.classList.remove("is-printed"); void ticket.offsetWidth; ticket.classList.add("is-printed");
  });

  /* ── Footer bits ────────────────────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-email]").forEach((a) => { a.href = `mailto:${EMAIL}`; a.textContent = EMAIL; });
  $$("[data-social]").forEach((a) => { const u = SZ.socials?.[a.dataset.social]; if (u) a.href = u; });
})();
