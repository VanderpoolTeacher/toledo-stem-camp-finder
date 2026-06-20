(function () {
  "use strict";

  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var state = { data: null, view: "events", search: "", topic: "", category: "", month: "", freeOnly: false };

  var els = {
    stats: document.getElementById("stats"),
    updated: document.getElementById("updated"),
    search: document.getElementById("search"),
    topic: document.getElementById("filter-topic"),
    category: document.getElementById("filter-category"),
    month: document.getElementById("filter-month"),
    free: document.getElementById("filter-free"),
    viewEvents: document.getElementById("view-events"),
    viewProviders: document.getElementById("view-providers"),
    reset: document.getElementById("reset"),
    results: document.getElementById("results"),
    resultCount: document.getElementById("result-count"),
    empty: document.getElementById("empty")
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    if (p.length !== 3) return iso;
    return MONTHS[parseInt(p[1], 10) - 1].slice(0, 3) + " " + parseInt(p[2], 10);
  }

  function fmtRange(start, end) {
    if (!start) return "Dates TBD";
    if (!end || end === start) return fmtDate(start);
    var ps = start.split("-"), pe = end.split("-");
    if (ps[0] === pe[0] && ps[1] === pe[1]) {
      return MONTHS[parseInt(ps[1], 10) - 1].slice(0, 3) + " " + parseInt(ps[2], 10) + "–" + parseInt(pe[2], 10);
    }
    return fmtDate(start) + " – " + fmtDate(end);
  }

  function flattenEvents() {
    var out = [];
    state.data.providers.forEach(function (p) {
      (p.events || []).forEach(function (e) { out.push({ ev: e, provider: p }); });
    });
    out.sort(function (a, b) {
      var as = a.ev.start || "9999", bs = b.ev.start || "9999";
      return as < bs ? -1 : as > bs ? 1 : 0;
    });
    return out;
  }

  function matchText(hay) { return hay.toLowerCase().indexOf(state.search.toLowerCase()) !== -1; }

  function providerMatches(p) {
    if (state.category && p.category !== state.category) return false;
    if (state.freeOnly && !p.free) return false;
    if (state.topic && (p.topics || []).indexOf(state.topic) === -1) return false;
    if (state.search) {
      var hay = [p.name, p.description, p.category, (p.topics || []).join(" "), (p.location && p.location.city) || "",
        (p.events || []).map(function (e) { return e.name + " " + e.focus; }).join(" ")].join(" ");
      if (!matchText(hay)) return false;
    }
    return true;
  }

  function eventMatches(ev, p) {
    if (state.category && p.category !== state.category) return false;
    if (state.freeOnly && !(p.free || /free/i.test(ev.cost || ""))) return false;
    var topics = (ev.topics && ev.topics.length ? ev.topics : p.topics) || [];
    if (state.topic && topics.indexOf(state.topic) === -1) return false;
    if (state.month && (!ev.start || parseInt(ev.start.split("-")[1], 10) !== parseInt(state.month, 10))) {
      // also allow if range spans the month
      if (!(ev.start && ev.end && parseInt(ev.start.split("-")[1], 10) <= parseInt(state.month, 10) && parseInt(ev.end.split("-")[1], 10) >= parseInt(state.month, 10))) return false;
    }
    if (state.search) {
      var hay = [ev.name, ev.focus, p.name, (topics).join(" "), ev.grades].join(" ");
      if (!matchText(hay)) return false;
    }
    return true;
  }

  function renderEvents() {
    var rows = flattenEvents().filter(function (r) { return eventMatches(r.ev, r.provider); });
    els.resultCount.textContent = rows.length + " camp" + (rows.length === 1 ? "" : "s") + " & event" + (rows.length === 1 ? "" : "s") + " found";
    els.empty.hidden = rows.length !== 0;
    els.results.innerHTML = rows.map(function (r) {
      var e = r.ev, p = r.provider;
      var topics = (e.topics && e.topics.length ? e.topics : p.topics) || [];
      var isFree = p.free || /free/i.test(e.cost || "");
      return '<article class="event-card">' +
        '<span class="date-badge">' + esc(fmtRange(e.start, e.end)) + "</span>" +
        "<h3>" + esc(e.name) + "</h3>" +
        '<p class="org">' + esc(p.name) + (p.location && p.location.city ? " · " + esc(p.location.city) + ", " + esc(p.location.state) : "") + "</p>" +
        '<p class="focus">' + esc(e.focus || p.description) + "</p>" +
        '<div class="meta">' +
          (e.grades ? '<span class="tag grades">' + esc(e.grades) + "</span>" : "") +
          (isFree ? '<span class="tag free">FREE</span>' : (e.cost ? '<span class="tag cost">' + esc(e.cost) + "</span>" : "")) +
          topics.slice(0, 3).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") +
        "</div>" +
        '<div class="card-foot">' +
          (e.registrationUrl ? '<a class="btn" href="' + esc(e.registrationUrl) + '" target="_blank" rel="noopener">Register / Info ↗</a>' : "") +
        "</div>" +
      "</article>";
    }).join("");
  }

  function renderProviders() {
    var list = state.data.providers.filter(providerMatches);
    els.resultCount.textContent = list.length + " organization" + (list.length === 1 ? "" : "s") + " found";
    els.empty.hidden = list.length !== 0;
    els.results.innerHTML = list.map(function (p) {
      var c = p.contact || {};
      var contactBits = [];
      if (c.phone) contactBits.push("📞 " + esc(c.phone));
      if (c.email) contactBits.push('✉️ <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>");
      if (c.namedContact) contactBits.push("👤 " + esc(c.namedContact));
      var loc = p.location || {};
      var evList = (p.events || []).slice().sort(function (a, b) { return (a.start || "9") < (b.start || "9") ? -1 : 1; });
      return '<article class="provider-card">' +
        '<p class="cat">' + esc(p.category) + (p.verified === false ? ' · <span class="badge-unverified">lead — unverified</span>' : "") + "</p>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="desc">' + esc(p.description) + "</p>" +
        '<div class="meta">' +
          (p.gradesAges ? '<span class="tag grades">' + esc(p.gradesAges) + "</span>" : "") +
          (p.free ? '<span class="tag free">FREE</span>' : (p.cost ? '<span class="tag cost">' + esc(p.cost) + "</span>" : "")) +
          (p.topics || []).slice(0, 4).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") +
        "</div>" +
        (loc.venue || loc.city ? '<p class="contact">📍 ' + esc([loc.venue, loc.city, loc.state].filter(Boolean).join(", ")) + "</p>" : "") +
        (contactBits.length ? '<p class="contact">' + contactBits.join(" &nbsp;·&nbsp; ") + "</p>" : "") +
        (evList.length ? '<ul class="events-list">' + evList.map(function (e) {
          return "<li><span class=\"ev-date\">" + esc(fmtRange(e.start, e.end)) + "</span> — " + esc(e.name) +
            (e.grades ? " <span style=\"color:var(--muted)\">(" + esc(e.grades) + ")</span>" : "") + "</li>";
        }).join("") + "</ul>" : "") +
        '<div class="card-foot">' +
          (p.contact && p.contact.website ? '<a class="btn" href="' + esc(p.contact.website) + '" target="_blank" rel="noopener">Visit website ↗</a>' : "") +
          (p.sourceUrl && p.sourceUrl !== (p.contact && p.contact.website) ? '<a class="btn secondary" href="' + esc(p.sourceUrl) + '" target="_blank" rel="noopener">Source</a>' : "") +
        "</div>" +
      "</article>";
    }).join("");
  }

  function render() {
    if (state.view === "events") renderEvents(); else renderProviders();
  }

  function populateFilters() {
    state.data.topics.slice().sort().forEach(function (t) {
      var o = document.createElement("option"); o.value = t; o.textContent = t; els.topic.appendChild(o);
    });
    state.data.categories.forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; els.category.appendChild(o);
    });
    // months present in data
    var months = {};
    state.data.providers.forEach(function (p) { (p.events || []).forEach(function (e) { if (e.start) months[parseInt(e.start.split("-")[1], 10)] = true; }); });
    Object.keys(months).map(Number).sort(function (a, b) { return a - b; }).forEach(function (m) {
      var o = document.createElement("option"); o.value = String(m); o.textContent = MONTHS[m - 1] + " 2026"; els.month.appendChild(o);
    });
  }

  function setView(v) {
    state.view = v;
    els.viewEvents.classList.toggle("active", v === "events");
    els.viewProviders.classList.toggle("active", v === "providers");
    els.month.parentElement.style.display = v === "events" ? "" : "none";
    render();
  }

  function bind() {
    els.search.addEventListener("input", function () { state.search = this.value.trim(); render(); });
    els.topic.addEventListener("change", function () { state.topic = this.value; render(); });
    els.category.addEventListener("change", function () { state.category = this.value; render(); });
    els.month.addEventListener("change", function () { state.month = this.value; render(); });
    els.free.addEventListener("change", function () { state.freeOnly = this.checked; render(); });
    els.viewEvents.addEventListener("click", function () { setView("events"); });
    els.viewProviders.addEventListener("click", function () { setView("providers"); });
    els.reset.addEventListener("click", function () {
      state.search = state.topic = state.category = state.month = ""; state.freeOnly = false;
      els.search.value = ""; els.topic.value = ""; els.category.value = ""; els.month.value = ""; els.free.checked = false;
      render();
    });
  }

  fetch("data.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;
      var evCount = data.providers.reduce(function (n, p) { return n + (p.events ? p.events.length : 0); }, 0);
      var freeCount = data.providers.filter(function (p) { return p.free; }).length;
      els.stats.innerHTML =
        '<span class="stat">' + data.providers.length + " organizations</span>" +
        '<span class="stat">' + evCount + " dated camps &amp; events</span>" +
        '<span class="stat">' + freeCount + " free programs</span>";
      els.updated.textContent = "Region: " + data.meta.region + " · Last updated " + data.meta.lastUpdated;
      populateFilters();
      bind();
      setView("events");
    })
    .catch(function (err) {
      els.results.innerHTML = '<p class="empty">Could not load camp data. (' + esc(err.message) + ")</p>";
    });
})();
