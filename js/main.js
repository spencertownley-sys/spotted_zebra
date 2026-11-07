(() => {
  "use strict";
  const SZ = window.SZ || {};
  const EMAIL = SZ.email || "contact@spottedzebra.party";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mailto = (subject, body) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  /* ── HERO: living zebra stripes ─────────────────────────────────────── */
  const canvas = $("#stripes");
  const g = canvas.getContext("2d");
  const hero = $(".hero");
  const heroVideo = $(".hero__video");
  // Respect reduced motion: hold the video on its first frame / poster.
  if (heroVideo && reduceMotion) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }
  let W, H, DPR;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

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
  if (heroVideo) { /* the video is the background; no stripes to draw */ }
  else if (reduceMotion) drawStripes(0); else requestAnimationFrame(loop);

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
  $$(".section-head, .about__text, .spotlight, .shows__list, .book__grid, .player, .gallery, .post-cards, .theater, .filmstrip, .shorts").forEach((el) => el.classList.add("reveal"));
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
      if (s.flyer) {
        // Featured layout: flyer on one side, the details on the other.
        li.className = "show show--featured";
        const full = new Date(s.date + "T00:00:00").toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" });
        const where = [s.address, s.city].filter(Boolean).join(", ");
        const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.venue, where].filter(Boolean).join(", "))}`;
        const times = [s.doors && `Doors ${s.doors}`, s.time && `Music ${s.time}${s.end ? "–" + s.end : ""}`].filter(Boolean).join(" · ");
        const bill = (s.with || []).length ? `<p class="show__with">with ${s.with.map(esc).join(" &amp; ")}</p>` : "";
        li.innerHTML = `
          <a class="show__flyer" href="${esc(s.flyer)}" target="_blank" rel="noopener" aria-label="Open the full-size flyer">
            <img src="${esc(s.flyerSmall || s.flyer)}" alt="Flyer: ${esc(s.title || "Spotted Zebra live")} at ${esc(s.venue)}, ${esc(full)}" width="800" height="1035" loading="lazy" decoding="async">
          </a>
          <div class="show__body">
            <p class="show__tag">Next show</p>
            <div class="show__head">
              <div class="show__date">${mon}<b>${s.d.getDate()}</b></div>
              <div>
                ${s.title ? `<h3 class="show__title">${esc(s.title)}</h3>` : ""}
                <div class="show__venue">${esc(s.venue)}</div>
              </div>
            </div>
            ${bill}
            <ul class="show__facts">
              <li><span>When</span>${esc(full)}${times ? `<br>${esc(times)}` : ""}</li>
              ${where ? `<li><span>Where</span>${esc(s.venue)}<br>${esc(where)}</li>` : ""}
              ${s.price ? `<li><span>Tickets</span>${esc(s.price)}</li>` : ""}
            </ul>
            <div class="show__actions">
              ${s.link ? `<a class="btn" href="${esc(s.link)}" target="_blank" rel="noopener">Get tickets</a>` : ""}
              <a class="btn btn--ghost" href="${esc(maps)}" target="_blank" rel="noopener">Directions</a>
              <a class="btn btn--ghost" href="${esc(s.flyer)}" target="_blank" rel="noopener">View flyer</a>
            </div>
          </div>`;
        showList.appendChild(li);
        return;
      }
      li.innerHTML = `
        <div class="show__date">${mon}<b>${s.d.getDate()}</b></div>
        <div><div class="show__venue">${esc(s.venue)}</div><div class="show__meta">${esc(dow)}${s.time ? " · " + esc(s.time) : ""}${s.city ? " · " + esc(s.city) : ""}</div></div>
        ${s.link ? `<a class="btn btn--ghost" href="${esc(s.link)}" target="_blank" rel="noopener">Details</a>` : ""}`;
      showList.appendChild(li);
    });

    // Tell Google about each show (Event rich results / "live music near me").
    const toTime = (t) => {
      const m = String(t || "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
      if (!m) return "";
      let h = +m[1];
      if (m[3]) h = (h % 12) + (/pm/i.test(m[3]) ? 12 : 0);
      return `T${String(h).padStart(2, "0")}:${m[2] || "00"}`;
    };
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify(upcoming.map((s) => ({
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: s.title ? `${s.title}: Spotted Zebra live at ${s.venue}` : `Spotted Zebra live at ${s.venue}`,
      startDate: s.date + toTime(s.time),
      endDate: s.end ? s.date + toTime(s.end) : undefined,
      doorTime: s.doors ? s.date + toTime(s.doors) : undefined,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: s.venue,
        address: { "@type": "PostalAddress", streetAddress: s.address || undefined, addressLocality: (s.city || "Seattle, WA").split(",")[0].trim(), addressRegion: "WA", addressCountry: "US" },
      },
      performer: [{ "@type": "MusicGroup", name: "Spotted Zebra", url: "https://spottedzebra.party/" }]
        .concat((s.with || []).map((name) => ({ "@type": "MusicGroup", name }))),
      organizer: { "@type": "Organization", name: s.venue },
      image: s.flyer ? new URL(s.flyer, location.origin).href : "https://spottedzebra.party/assets/img/og.jpg",
      offers: s.price ? {
        "@type": "Offer",
        price: (String(s.price).match(/\$(\d+(?:\.\d+)?)/) || [])[1],
        priceCurrency: "USD",
        url: s.link || "https://spottedzebra.party/#shows",
        availability: "https://schema.org/InStock",
      } : undefined,
      description: `Spotted Zebra, a Seattle cover band, plays 80s, 90s, 2000s and modern hits live at ${s.venue}.`,
      url: s.link || "https://spottedzebra.party/#shows",
    })));
    document.head.appendChild(ld);

    /* Pop-up poster for the next show (once per visit). */
    const next = upcoming.find((s) => s.flyer && s.link && s.popup !== false);
    const seenKey = "sz-popup-" + (next && next.date);
    let seen = false;
    try { seen = sessionStorage.getItem(seenKey) === "1"; } catch (e) {}
    if (next && SZ.popup !== false && !seen && window.HTMLDialogElement) {
      const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const full = next.d.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" });
      const dlg = document.createElement("dialog");
      dlg.className = "showpop";
      dlg.setAttribute("aria-labelledby", "showpopTitle");
      dlg.innerHTML = `
        <button type="button" class="showpop__close" aria-label="Close">&times;</button>
        <img class="showpop__flyer" src="${esc(next.flyerSmall || next.flyer)}" alt="Flyer: ${esc(next.title || "Spotted Zebra live")} at ${esc(next.venue)}, ${esc(full)}" width="800" height="1035" decoding="async">
        <div class="showpop__body">
          <p class="showpop__tag">Next show</p>
          <p class="showpop__title" id="showpopTitle">${esc(next.title || "Spotted Zebra live")}</p>
          <p class="showpop__meta">${esc(full)}${next.time ? " · " + esc(next.time) : ""} · ${esc(next.venue)}</p>
          ${next.price ? `<p class="showpop__price">${esc(next.price)}</p>` : ""}
          <div class="showpop__actions">
            <a class="btn btn--spot" href="${esc(next.link)}" target="_blank" rel="noopener">Buy tickets</a>
            <a class="btn btn--ghost" href="#shows" data-close>Details</a>
          </div>
        </div>`;
      document.body.appendChild(dlg);
      const close = () => dlg.close();
      $(".showpop__close", dlg).addEventListener("click", close);
      $("[data-close]", dlg).addEventListener("click", close);
      $(".btn--spot", dlg).addEventListener("click", close);
      // click on the dark backdrop (outside the card) closes it
      dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
      dlg.addEventListener("close", () => document.documentElement.classList.remove("has-pop"));
      setTimeout(() => {
        if (document.querySelector("dialog[open], .lightbox:not([hidden]), .vmodal:not([hidden])")) return;
        try { sessionStorage.setItem(seenKey, "1"); } catch (e) {}
        document.documentElement.classList.add("has-pop");
        dlg.showModal();
        $(".btn--spot", dlg).focus();
      }, 1200);
    }
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

  const sendBtn = $("#gigSend");
  const done = $("#gigDone");
  const err = $("#formError");

  function bookingDetails() {
    const f = form.elements;
    return {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      event: chosen("event")[0] || "Not specified",
      date: f.date.value || "TBD",
      crowd: T("crowd").textContent,
      decades: T("decades").textContent,
      message: f.message.value.trim(),
    };
  }

  function bookingSubject(d) {
    return `Booking request: ${d.event === "Not specified" ? "event" : d.event}${d.date !== "TBD" ? " on " + d.date : ""}`;
  }

  // Old-school fallback: open the visitor's email app with everything filled in.
  function bookingMailto(d) {
    const body = [
      `Name: ${d.name}`, `Email: ${d.email}`, `Event: ${d.event}`, `Date: ${d.date}`,
      `Crowd size: ${d.crowd}`, `Decades: ${d.decades}`,
      "", d.message,
    ].filter((l) => l !== null).join("\n");
    return mailto(bookingSubject(d), body);
  }

  function celebrate() {
    ticket.classList.remove("is-printed"); void ticket.offsetWidth; ticket.classList.add("is-printed");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements;
    if (!f.name.value.trim()) { err.textContent = "Tell us your name so we know who to rock for."; f.name.focus(); return; }
    if (!f.email.value.trim() || !f.email.checkValidity()) { err.textContent = "We need a valid email to get back to you."; f.email.focus(); return; }
    err.textContent = "";
    const d = bookingDetails();

    if (!SZ.formEndpoint) { location.href = bookingMailto(d); celebrate(); return; }

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    try {
      const res = await fetch(SZ.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: bookingSubject(d),
          _template: "table",
          _honey: f._honey.value,
          name: d.name,
          email: d.email,
          event: d.event,
          date: d.date,
          "crowd size": d.crowd,
          decades: d.decades,
          message: d.message || "(none)",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || `HTTP ${res.status}`);

      celebrate();
      ticket.classList.add("is-sent");
      $("#gigDoneName").textContent = d.name.split(" ")[0];
      $("#gigDoneEmail").textContent = d.email;
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (ex) {
      err.innerHTML = "";
      err.append("Hmm, that didn't go through. ");
      const a = document.createElement("a");
      a.href = bookingMailto(d);
      a.textContent = "Send it by email instead";
      err.append(a, ".");
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send it";
    }
  });

  $("#gigAgain").addEventListener("click", () => {
    form.reset();
    $$(".chip", form).forEach((c) => c.setAttribute("aria-pressed", "false"));
    $("#ticketNo").textContent = String(Math.floor(Math.random() * 9000) + 1000);
    ticket.classList.remove("is-sent");
    updateTicket(false);
    done.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
