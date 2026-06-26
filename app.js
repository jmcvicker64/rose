(function () {
  "use strict";

  const { CONFIG, MESSAGES } = window.ROSE;
  const SPECIAL_MESSAGES = window.ROSE.SPECIAL_MESSAGES || {};
  const PINNED = window.ROSE.PINNED || {};
  const PHOTOS = window.ROSE_PHOTOS || [];

  // --- index photos by calendar day (MM-DD), and by file path ---
  const byMD = {};
  const fileMeta = {};
  for (const p of PHOTOS) {
    fileMeta[p.f] = p;
    if (!p.d) continue;
    const md = p.d.slice(5); // "MM-DD"
    (byMD[md] || (byMD[md] = [])).push(p);
  }
  for (const md in byMD) byMD[md].sort((a, b) => (a.d < b.d ? -1 : 1));

  const el = (id) => document.getElementById(id);
  const els = {
    photo: el("photo"),
    fallback: el("photoFallback"),
    badge: el("badge"),
    greeting: el("greeting"),
    message: el("message"),
    signoff: el("signoff"),
    dateLabel: el("dateLabel"),
    dateSub: el("dateSub"),
    prev: el("prevBtn"),
    next: el("nextBtn"),
    today: el("todayBtn"),
    heart: el("heartBtn"),
    hearts: el("hearts"),
    card: el("card"),
  };

  const MONTHS = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];

  const pad = (n) => String(n).padStart(2, "0");
  const mdOf = (d) => pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const dayNumber = (d) =>
    Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  const sameDay = (a, b) => dayNumber(a) === dayNumber(b);

  function timeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  // Stable, well-spread pseudo-random in [0,1) from an integer seed.
  function seededRand(n) {
    let x = (n + 0x9e3779b9) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
    x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
    x = (x ^ (x >>> 15)) >>> 0;
    return x / 4294967296;
  }

  // The photos that AREN'T this year's "On This Day" pick for their own date —
  // i.e. the surplus shots that would otherwise never be seen. These are what we
  // sprinkle onto empty days. Cached per year (the picks rotate yearly).
  const _unscheduledByYear = {};
  function unscheduledForYear(year) {
    if (_unscheduledByYear[year]) return _unscheduledByYear[year];
    const scheduled = new Set();
    for (const md in byMD) {
      const m = byMD[md];
      const i = ((year % m.length) + m.length) % m.length; // same pick as pickPhoto()
      scheduled.add(m[i].f);
    }
    const pool = PHOTOS.filter((p) => !scheduled.has(p.f));
    _unscheduledByYear[year] = pool.length ? pool : PHOTOS.slice();
    return _unscheduledByYear[year];
  }

  // Choose the photo (and any memory badge) for a given date.
  function pickPhoto(view) {
    const md = mdOf(view);
    const matches = byMD[md];

    // A hand-picked (pinned) photo for this day wins; else the automatic pick.
    let chosenFile = null, chosenDate = null, fromThisDay = false;
    const pinnedFile = PINNED[md];
    if (pinnedFile && fileMeta[pinnedFile]) {
      chosenFile = pinnedFile;
      chosenDate = fileMeta[pinnedFile].d;
      fromThisDay = !!chosenDate && chosenDate.slice(5) === md;
    } else if (matches && matches.length) {
      const i = ((view.getFullYear() % matches.length) + matches.length) % matches.length;
      chosenFile = matches[i].f;
      chosenDate = matches[i].d;
      fromThisDay = true;
    }

    if (chosenFile) {
      const photoYear = chosenDate ? +chosenDate.slice(0, 4) : null;

      if (md === CONFIG.anniversary) {
        const yrs = view.getFullYear() - (CONFIG.weddingYear || photoYear || view.getFullYear());
        const badge = yrs > 0
          ? `💍 Married ${yrs} year${yrs === 1 ? "" : "s"} ago today`
          : `💍 Our wedding day`;
        return { file: chosenFile, badge, soft: false };
      }
      if (fromThisDay && photoYear) {
        const yearsAgo = view.getFullYear() - photoYear;
        const badge = yearsAgo > 0
          ? `✨ On this day · ${yearsAgo} year${yearsAgo === 1 ? "" : "s"} ago`
          : `✨ On this day`;
        return { file: chosenFile, badge, soft: false };
      }
      // A pinned photo from a different day → gentle caption.
      let badge = null;
      if (photoYear) badge = `A moment from ${MONTHS[+chosenDate.slice(5, 7) - 1]} ${photoYear}`;
      return { file: chosenFile, badge, soft: true };
    }

    // No memory for this date: surface an "unscheduled" photo (one not tied to
    // its own day this year), chosen at random but stable for the whole day.
    const pool = unscheduledForYear(view.getFullYear());
    if (pool.length) {
      const idx = Math.floor(seededRand(dayNumber(view)) * pool.length) % pool.length;
      const chosen = pool[idx];
      let badge = null;
      if (chosen.d) {
        const m = MONTHS[+chosen.d.slice(5, 7) - 1];
        badge = `A moment from ${m} ${chosen.d.slice(0, 4)}`;
      }
      return { file: chosen.f, badge, soft: true };
    }
    return { file: null, badge: null, soft: true };
  }

  let view = new Date();
  let pinnedToday = true; // is she following "today" (vs browsing a past day)?

  function render() {
    const isToday = sameDay(view, new Date());

    // --- photo ---
    const pick = pickPhoto(view);
    if (pick.file) {
      els.photo.style.backgroundImage = `url("${pick.file}")`;
      els.fallback.style.display = "none";
    } else {
      els.photo.style.backgroundImage =
        "linear-gradient(140deg,#ff9a9e 0%,#fad0c4 100%)";
      els.fallback.style.display = "";
    }

    // --- memory badge ---
    if (pick.badge) {
      els.badge.textContent = pick.badge;
      els.badge.classList.toggle("badge--soft", !!pick.soft);
      els.badge.hidden = false;
    } else {
      els.badge.hidden = true;
    }

    // --- special day? (birthday / anniversary override the greeting + message) ---
    const special = SPECIAL_MESSAGES[mdOf(view)];

    // --- greeting ---
    const name = CONFIG.recipientName ? `, ${CONFIG.recipientName}` : "";
    if (special && special.greeting) {
      els.greeting.textContent = special.greeting;
    } else {
      els.greeting.textContent = isToday
        ? `${timeGreeting()}${name} 🌹`
        : `A memory for you 💞`;
    }

    // --- message (special override, else the daily rotation) ---
    if (special) {
      let txt = special.message;
      if (txt.indexOf("{years}") !== -1) {
        const yrs = view.getFullYear() - (CONFIG.weddingYear || view.getFullYear());
        txt = txt.replace("{years}", yrs > 0 ? yrs : "");
      }
      if (txt.indexOf("{age}") !== -1) {
        const age = view.getFullYear() - (CONFIG.birthYear || view.getFullYear());
        txt = txt.replace("{age}", age > 0 ? age : "");
      }
      els.message.textContent = txt;
    } else {
      const mi = ((dayNumber(view) % MESSAGES.length) + MESSAGES.length) % MESSAGES.length;
      els.message.textContent = MESSAGES[mi];
    }

    // --- sign-off ---
    if (CONFIG.fromName) {
      els.signoff.textContent = `— ${CONFIG.fromName}`;
      els.signoff.hidden = false;
    } else {
      els.signoff.hidden = true;
    }

    // --- date bar ---
    els.dateLabel.textContent = isToday
      ? "Today"
      : view.toLocaleDateString(undefined, { weekday: "long" });
    els.dateSub.textContent = view.toLocaleDateString(undefined, {
      day: "numeric", month: "long",
    });
    els.today.hidden = isToday;

    // gentle re-entry animation
    els.card.style.animation = "none";
    void els.card.offsetWidth;
    els.card.style.animation = "";
  }

  function shift(deltaDays) {
    const d = new Date(view);
    d.setDate(d.getDate() + deltaDays);
    view = d;
    pinnedToday = sameDay(view, new Date());
    render();
  }

  // --- floating hearts ---
  function burstHearts() {
    const symbols = ["💗", "💕", "🌹", "💞", "❤️"];
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span");
      s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      s.style.left = 10 + Math.random() * 80 + "vw";
      s.style.fontSize = 20 + Math.random() * 22 + "px";
      s.style.animationDelay = Math.random() * 0.3 + "s";
      els.hearts.appendChild(s);
      setTimeout(() => s.remove(), 2200);
    }
  }

  // --- events ---
  els.prev.addEventListener("click", () => shift(-1));
  els.next.addEventListener("click", () => shift(1));
  els.today.addEventListener("click", () => { view = new Date(); pinnedToday = true; render(); });
  els.heart.addEventListener("click", burstHearts);

  // swipe left/right to change days
  let touchX = null;
  els.card.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  els.card.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) shift(dx < 0 ? 1 : -1);
    touchX = null;
  });

  // if she leaves the app open past midnight, roll over to the new day on return
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pinnedToday && !sameDay(view, new Date())) {
      view = new Date();
      render();
    }
  });

  render();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
})();
