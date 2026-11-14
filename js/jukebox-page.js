(() => {
  const root = document.querySelector("[data-jbox]");
  const input = document.getElementById("jsearch");
  const count = document.getElementById("jcount");
  const empty = document.getElementById("jempty");
  const chips = [...root.querySelectorAll("[data-dec]")];
  const groups = [...root.querySelectorAll("[data-group]")];
  let dec = "all";
  function apply() {
    const q = input.value.trim().toLowerCase();
    let n = 0;
    groups.forEach((g) => {
      const on = dec === "all" || g.dataset.group === dec;
      let shown = 0;
      g.querySelectorAll("li").forEach((li) => {
        const hit = on && (!q || li.dataset.q.includes(q));
        li.hidden = !hit;
        if (hit) shown++;
      });
      g.hidden = !shown;
      n += shown;
    });
    count.textContent = `${n} song${n === 1 ? "" : "s"}`;
    empty.hidden = n > 0;
  }
  input.addEventListener("input", apply);
  chips.forEach((c) => c.addEventListener("click", () => {
    dec = c.dataset.dec;
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    apply();
  }));
  apply();
})();
