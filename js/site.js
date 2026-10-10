/* Shared on every page: cursor, nav, mobile menu, photo lightbox, footer links. */
(() => {
  "use strict";
  const SZ = window.SZ || {};
  const EMAIL = SZ.email || "booking@spottedzebra.party";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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

  /* ── Nav: solid background on scroll + mobile menu ──────────────────── */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40 || document.body.classList.contains("sub"));
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $(".nav__toggle");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("#navMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ── Lightbox for photo grids ───────────────────────────────────────── */
  const box = $("#lightbox");
  const links = $$("[data-lightbox]");
  if (box && links.length) {
    const img = $("img", box);
    let i = 0, lastFocus;
    const show = (n) => {
      i = (n + links.length) % links.length;
      const thumb = $("img", links[i]);
      img.src = links[i].href;
      img.alt = thumb ? thumb.alt : "";
    };
    const open = (n) => {
      lastFocus = document.activeElement;
      show(n);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lightbox__close", box).focus();
    };
    const close = () => {
      box.hidden = true;
      document.body.style.overflow = "";
      img.removeAttribute("src");
      lastFocus?.focus();
    };
    links.forEach((a, n) => a.addEventListener("click", (e) => { e.preventDefault(); open(n); }));
    $(".lightbox__close", box).addEventListener("click", close);
    $(".lightbox__prev", box).addEventListener("click", () => show(i - 1));
    $(".lightbox__next", box).addEventListener("click", () => show(i + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
    // swipe on phones
    let x0 = null;
    box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ── Footer bits ────────────────────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-email]").forEach((a) => { a.href = `mailto:${EMAIL}`; a.textContent = EMAIL; });
  $$("[data-social]").forEach((a) => { const u = SZ.socials?.[a.dataset.social]; if (u) a.href = u; });
})();
