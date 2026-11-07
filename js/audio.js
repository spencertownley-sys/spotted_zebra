/* Shared Web Audio: one lazy context, a few synth voices and playNote().
   Used by the homepage (hero spots, booking form) and the /play/ keyboard. */
(() => {
  "use strict";
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

  window.SZAudio = {
    audio,
    playNote,
    VOICES,
    get ctx() { return ctx; },
    get master() { return master; },
    setVoice(v) { if (VOICES[v]) voice = v; },
  };
})();
