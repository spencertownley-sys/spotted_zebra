/* YouTube clips: click-to-load players (no YouTube code loads until someone presses play). */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const iframe = (id, vertical) => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    f.title = "YouTube video player";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.allowFullscreen = true;
    if (vertical) f.className = "is-vertical";
    return f;
  };

  // Pause any music from the Listen player so two things don't play at once.
  const hush = () => { const a = $("#audio"); if (a && !a.paused) a.pause(); };

  /* ── Homepage theater + filmstrip ───────────────────────────────────── */
  const theater = $("[data-theater]");
  if (theater) {
    const screen = $(".theater__screen", theater);
    const title = $("[data-theater-title]", theater);
    const artist = $("[data-theater-artist]", theater);
    const link = $("[data-theater-link]", theater);

    const facade = (id, label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "yt";
      b.dataset.yt = id;
      b.setAttribute("aria-label", `Play ${label}`);
      b.innerHTML = `<img src="https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg" alt=""><span class="yt__play" aria-hidden="true"></span>`;
      return b;
    };

    screen.addEventListener("click", (e) => {
      const b = e.target.closest("[data-yt]");
      if (!b) return;
      hush();
      screen.replaceChildren(iframe(b.dataset.yt));
    });

    $$("[data-pick]").forEach((p) => p.addEventListener("click", () => {
      const id = p.dataset.pick;
      $$("[data-pick]").forEach((x) => x.classList.toggle("is-current", x === p));
      title.textContent = p.dataset.song;
      artist.textContent = p.dataset.artist ? `Originally by ${p.dataset.artist}` : "";
      link.href = `https://www.youtube.com/watch?v=${id}`;
      // Already watching something? Go straight to the new clip. Otherwise just swap the poster.
      const playing = !!$("iframe", screen);
      if (playing) { hush(); screen.replaceChildren(iframe(id)); }
      else screen.replaceChildren(facade(id, p.dataset.song));
      theater.classList.remove("is-swapped"); void theater.offsetWidth; theater.classList.add("is-swapped");
      if (theater.getBoundingClientRect().top < 0) theater.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  /* ── Modal player (shorts + videos page) ────────────────────────────── */
  const modal = $("#vmodal");
  if (modal) {
    const frame = $(".vmodal__frame", modal);
    let lastFocus;
    const close = () => {
      modal.hidden = true;
      frame.replaceChildren();
      document.body.style.overflow = "";
      lastFocus?.focus();
    };
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-yt-modal]");
      if (!b) return;
      lastFocus = b;
      hush();
      const vertical = b.hasAttribute("data-vertical");
      frame.className = "vmodal__frame" + (vertical ? " is-vertical" : "");
      frame.replaceChildren(iframe(b.dataset.ytModal, vertical));
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lightbox__close", modal).focus();
    });
    $(".lightbox__close", modal).addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  }

  /* ── Search on /videos/ ─────────────────────────────────────────────── */
  const search = $("#vsearch");
  if (search) {
    const items = $$("#vgrid > li");
    const count = $("#vcount");
    const empty = $("#vempty");
    const run = () => {
      const q = search.value.trim().toLowerCase();
      let n = 0;
      items.forEach((li) => {
        const hit = !q || li.dataset.search.includes(q);
        li.hidden = !hit;
        if (hit) n++;
      });
      count.textContent = q ? `${n} of ${items.length}` : "";
      empty.hidden = n > 0;
    };
    search.addEventListener("input", run);
  }
})();
