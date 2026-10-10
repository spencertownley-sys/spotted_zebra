/* Listen section: playlist + zebra-stripe visualizer. Songs come from _data/music.yml. */
(() => {
  "use strict";
  const player = document.getElementById("player");
  if (!player) return;

  const $ = (s) => player.querySelector(s);
  const audio = $("#audio");
  const playBtn = $("#playBtn");
  const seek = $("#seek");
  const tCur = $("#tCur");
  const tDur = $("#tDur");
  const npTitle = $("#npTitle");
  const npArtist = $("#npArtist");
  const tracks = [...player.querySelectorAll("#tracks button")];
  const canvas = $("#viz");
  const g = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let idx = 0, seeking = false;

  const fmt = (t) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  function load(n, autoplay) {
    idx = (n + tracks.length) % tracks.length;
    const b = tracks[idx];
    audio.src = b.dataset.src;
    npTitle.textContent = b.dataset.title;
    npArtist.textContent = `Originally by ${b.dataset.artist}`;
    tracks.forEach((t, i) => t.classList.toggle("is-current", i === idx));
    seek.value = 0;
    tCur.textContent = "0:00";
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: b.dataset.title,
        artist: "Spotted Zebra",
        album: `Originally by ${b.dataset.artist}`,
        artwork: [{ src: "/assets/img/icon.png", sizes: "256x256", type: "image/png" }],
      });
    }
    if (autoplay) play();
  }

  // Web Audio analyser for the visualizer (created on first play, needs a user gesture)
  let ctx, analyser, bins;
  function initAudioGraph() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      bins = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser).connect(ctx.destination);
    } catch (e) { ctx = null; analyser = null; }
  }

  function play() {
    if (!audio.src) load(idx);
    initAudioGraph();
    ctx?.resume();
    audio.play().catch(() => {});
  }

  playBtn.addEventListener("click", () => (audio.paused ? play() : audio.pause()));
  tracks.forEach((b, i) => b.addEventListener("click", () => {
    if (i === idx && audio.src) { audio.paused ? play() : audio.pause(); return; }
    load(i, true);
  }));

  audio.addEventListener("play", () => { player.classList.add("is-playing"); playBtn.setAttribute("aria-label", "Pause"); });
  audio.addEventListener("pause", () => { player.classList.remove("is-playing"); playBtn.setAttribute("aria-label", "Play"); });
  audio.addEventListener("ended", () => { if (tracks.length > 1) load(idx + 1, true); });
  audio.addEventListener("loadedmetadata", () => { tDur.textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", () => {
    if (seeking || !audio.duration) return;
    seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
    tCur.textContent = fmt(audio.currentTime);
  });
  seek.addEventListener("input", () => {
    seeking = true;
    if (audio.duration) tCur.textContent = fmt((seek.value / 1000) * audio.duration);
  });
  seek.addEventListener("change", () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    seeking = false;
  });

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => load(idx - 1, true));
    navigator.mediaSession.setActionHandler("nexttrack", () => load(idx + 1, true));
  }

  /* Visualizer: zebra stripes that thicken with the music, plus a pink "spot" on the bass. */
  let W, H, DPR;
  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
  }
  size();
  addEventListener("resize", size);

  let t = 0;
  function draw() {
    t += 0.016;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.fillStyle = "#0a0a0a";
    g.fillRect(0, 0, W, H);

    const playing = !audio.paused && analyser;
    if (playing) analyser.getByteFrequencyData(bins);
    const n = 24;
    const step = W / n;
    g.fillStyle = "#e9e5dc";
    for (let i = 0; i < n; i++) {
      // map stripes onto the lower ~2/3 of the spectrum where the music lives
      const v = playing ? bins[Math.floor((i / n) * bins.length * 0.66)] / 255 : 0.15 + 0.08 * Math.sin(t * 2 + i * 0.6);
      const w = step * (0.18 + v * 0.7);
      const x = i * step + (step - w) / 2;
      const sway = Math.sin(t * 1.5 + i * 0.4) * 6;
      g.beginPath();
      g.moveTo(x + sway, 0);
      g.bezierCurveTo(x - sway, H * 0.33, x + sway, H * 0.66, x - sway, H);
      g.lineTo(x + w - sway, H);
      g.bezierCurveTo(x + w + sway, H * 0.66, x + w - sway, H * 0.33, x + w + sway, 0);
      g.closePath();
      g.fill();
    }
    if (playing) {
      const bass = (bins[1] + bins[2] + bins[3]) / (3 * 255);
      const r = Math.max(0, (bass - 0.45) * H * 0.9);
      if (r > 1) {
        g.fillStyle = `rgba(255,46,99,${Math.min(1, bass)})`;
        g.beginPath();
        g.arc(W * 0.82, H * 0.38, r, 0, Math.PI * 2);
        g.fill();
      }
    }
    running = visible && (!reduceMotion || playing);
    if (running) requestAnimationFrame(draw);
  }

  // only animate while the player is on screen
  let visible = false, running = false;
  const kick = () => { if (visible && !running) { running = true; requestAnimationFrame(draw); } };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(canvas);
  audio.addEventListener("play", kick);

  load(0);
})();
