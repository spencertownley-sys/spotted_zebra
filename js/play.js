/* Play the Zebra: a playable zebra-stripe keyboard with three sounds and a drum beat. */
(() => {
  "use strict";
  const A = window.SZAudio;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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
    A.playNote(i);
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
    A.setVoice(b.dataset.voice);
    $$(".seg button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    A.playNote(0);
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
      noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate * 0.5, A.ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = A.ctx.createBufferSource();
    s.buffer = noiseBuf;
    return s;
  }
  function kick(t) {
    const o = A.ctx.createOscillator(), a = A.ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    a.gain.setValueAtTime(0.9, t);
    a.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(a).connect(A.master); o.start(t); o.stop(t + 0.36);
  }
  function snare(t) {
    const n = noise(), f = A.ctx.createBiquadFilter(), a = A.ctx.createGain();
    f.type = "highpass"; f.frequency.value = 1200;
    a.gain.setValueAtTime(0.45, t);
    a.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    n.connect(f).connect(a).connect(A.master); n.start(t); n.stop(t + 0.2);
  }
  function hat(t) {
    const n = noise(), f = A.ctx.createBiquadFilter(), a = A.ctx.createGain();
    f.type = "highpass"; f.frequency.value = 7000;
    a.gain.setValueAtTime(0.16, t);
    a.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.connect(f).connect(a).connect(A.master); n.start(t); n.stop(t + 0.06);
  }
  function scheduler() {
    while (nextT < A.ctx.currentTime + 0.12) {
      const s = stepN % 16;
      if (PATTERN.kick[s]) kick(nextT);
      if (PATTERN.snare[s]) snare(nextT);
      if (PATTERN.hat[s]) hat(nextT);
      nextT += SIXTEENTH;
      stepN++;
    }
  }
  beatBtn.addEventListener("click", () => {
    if (!A.audio()) return;
    beatOn = !beatOn;
    beatBtn.setAttribute("aria-pressed", String(beatOn));
    beatBtn.textContent = `Beat: ${beatOn ? "on" : "off"}`;
    clearInterval(timer);
    if (beatOn) { nextT = A.ctx.currentTime + 0.05; stepN = 0; timer = setInterval(scheduler, 25); }
  });
  // stop the beat if the tab is hidden
  document.addEventListener("visibilitychange", () => { if (document.hidden && beatOn) beatBtn.click(); });
})();
