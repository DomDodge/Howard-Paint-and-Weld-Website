/* Howard Painting & Welding — page behavior. Content lives in js/projects.js. */
(function () {
  "use strict";

  var SERVICES = window.SERVICES || {};
  var GALLERY = window.GALLERY || [];
  var SHOWCASES = window.SHOWCASES || [];
  var DEFAULT_SERVICE = "painting";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- images ---------- */

  // Optimized copy first, original as a fallback (see tools/optimize-images.py).
  function img(file, size, alt, extra) {
    var el = document.createElement("img");
    el.src = "images/" + size + "/" + file;
    el.dataset.fallback = "images/" + file;
    el.alt = alt || "";
    el.loading = "lazy";
    el.decoding = "async";
    if (extra) el.className = extra;
    return el;
  }

  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el.tagName === "IMG" && el.dataset.fallback && el.getAttribute("src") !== el.dataset.fallback) {
      el.src = el.dataset.fallback;
    }
  }, true);

  // Descriptive alt text: "Kitchen Cabinets, painting by Howard Painting & Welding"
  function altFor(service, title) {
    var s = SERVICES[service];
    return title + ", " + (s ? s.label.toLowerCase() : "work") + " by Howard Painting & Welding";
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- before/after slider ---------- */

  function buildCompare(container, before, after, size, label) {
    container.innerHTML = "";
    container.classList.add("compare");
    container.style.setProperty("--pos", "50%");

    var afterImg = img(after, size, label ? label + ", after" : "After", "compare-after");
    var beforeWrap = el("div", "compare-before");
    beforeWrap.appendChild(img(before, size, label ? label + ", before" : "Before"));
    var handle = el("div", "compare-handle");
    handle.setAttribute("aria-hidden", "true");
    var range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.value = "50";
    range.className = "compare-range";
    range.setAttribute("aria-label", "Drag to compare before and after");

    range.addEventListener("input", function () {
      container.style.setProperty("--pos", range.value + "%");
    });

    container.append(afterImg, beforeWrap, handle, el("span", "tag tag-before", "Before"), el("span", "tag tag-after", "After"), range);
  }

  /* ---------- service switching ---------- */

  var current = null;
  var filter = DEFAULT_SERVICE;

  function setService(id) {
    if (!SERVICES[id]) id = DEFAULT_SERVICE;
    var s = SERVICES[id];
    var changed = id !== current;
    current = id;
    document.body.dataset.service = id;

    $$("[data-service-link]").forEach(function (a) {
      if (a.dataset.serviceLink === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    $$("[data-service-tab]").forEach(function (b) {
      b.setAttribute("aria-selected", String(b.dataset.serviceTab === id));
    });

    if (changed) {
      $("[data-bind=title]").textContent = s.title;
      $("[data-bind=lead]").textContent = s.lead;
      $("[data-bind=cta]").textContent = s.cta;
      $("[data-bind=submit]").textContent = s.submit;
      $("[data-bind=featureCaption]").textContent = s.feature.caption;
      $("[data-bind-placeholder]").placeholder = s.placeholder;

      var list = $("[data-bind=list]");
      list.innerHTML = "";
      s.list.forEach(function (item) { list.appendChild(el("li", null, item)); });

      buildCompare($("[data-compare]"), s.feature.before, s.feature.after, "web", s.title);

      var body = $(".service-body");
      body.classList.remove("is-swapping");
      void body.offsetWidth; // restart the fade
      body.classList.add("is-swapping");
    }

    // quote form follows the selected service
    var radio = $('[data-quote-form] input[name=service][value="' + id + '"]');
    if (radio) radio.checked = true;
    $$("[data-service-fields]").forEach(function (fs) {
      var on = fs.dataset.serviceFields === id;
      fs.hidden = !on;
      fs.disabled = !on; // disabled fieldsets aren't submitted
    });

    setFilter(id);
  }

  function scrollToEl(target) {
    if (!target) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  $$("[data-service-link]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      setService(a.dataset.serviceLink);
      history.replaceState(null, "", "#" + a.dataset.serviceLink);
      closeNav();
      scrollToEl($("#services"));
    });
  });

  $$("[data-service-tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      setService(b.dataset.serviceTab);
      history.replaceState(null, "", "#" + b.dataset.serviceTab);
    });
  });

  $$("[data-quote-link]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      closeNav();
      scrollToEl($("#quote"));
      setTimeout(function () { var n = $('[name=name]'); if (n) n.focus({ preventScroll: true }); }, 500);
    });
  });

  $$('[data-quote-form] input[name=service]').forEach(function (r) {
    r.addEventListener("change", function () { if (r.checked) setService(r.value); });
  });

  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (SERVICES[id]) { setService(id); scrollToEl($("#services")); }
  });

  /* ---------- gallery ---------- */

  var galleryEl = $("[data-gallery]");
  var showcaseEl = $("[data-showcase]");

  function setFilter(f) {
    filter = f;
    $$("[data-filter]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.filter === f));
    });
    renderGallery();
    renderShowcases();
  }

  $$("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (SERVICES[b.dataset.filter]) setService(b.dataset.filter);
      else setFilter(b.dataset.filter);
    });
  });

  function visible(list) {
    return list.filter(function (item) { return filter === "all" || item.service === filter; });
  }

  function renderGallery() {
    var items = visible(GALLERY);
    galleryEl.innerHTML = "";

    items.forEach(function (item, i) {
      var card = el("figure", "g-card" + (item.before ? " has-before" : ""));
      var open = el("button", "g-open");
      open.type = "button";
      open.setAttribute("aria-label", "View larger: " + item.title);
      open.appendChild(img(item.after, "thumb", altFor(item.service, item.title) + (item.before ? " (after)" : ""), "g-after"));
      if (item.before) open.appendChild(img(item.before, "thumb", altFor(item.service, item.title) + " (before)", "g-before"));
      open.addEventListener("click", function () { openLightbox(items, i); });
      card.appendChild(open);

      if (item.before) {
        card.appendChild(el("span", "g-badge", "After"));
        var toggle = el("button", "g-toggle", "Before");
        toggle.type = "button";
        toggle.setAttribute("aria-pressed", "false");
        toggle.addEventListener("click", function () {
          var on = card.classList.toggle("show-before");
          toggle.setAttribute("aria-pressed", String(on));
          toggle.textContent = on ? "After" : "Before";
        });
        card.appendChild(toggle);
      }

      var cap = el("figcaption", "g-caption");
      cap.appendChild(el("span", "g-service", SERVICES[item.service].label));
      cap.appendChild(el("span", "g-title", item.title));
      card.appendChild(cap);
      galleryEl.appendChild(card);
    });
  }

  /* ---------- project spotlights ---------- */

  function renderShowcases() {
    var items = visible(SHOWCASES);
    showcaseEl.innerHTML = "";
    $("#projects").hidden = items.length === 0;

    items.forEach(function (p) {
      var idx = 0;
      var art = el("article", "showcase");

      var media = el("div", "showcase-media");
      var stage = el("button", "showcase-stage");
      stage.type = "button";
      var main = img(p.steps[0].src, "web", altFor(p.service, p.title) + ": " + p.steps[0].caption);
      main.loading = "lazy";
      stage.appendChild(main);
      var counter = el("span", "showcase-counter");
      stage.appendChild(counter);
      stage.addEventListener("click", function () {
        openLightbox(p.steps.map(function (s) { return { after: s.src, title: p.title + ": " + s.caption }; }), idx);
      });

      var prev = el("button", "showcase-arrow prev", "‹");
      var next = el("button", "showcase-arrow next", "›");
      prev.type = next.type = "button";
      prev.setAttribute("aria-label", "Previous step");
      next.setAttribute("aria-label", "Next step");

      var thumbs = el("div", "showcase-thumbs");
      var body = el("div", "showcase-body");
      body.appendChild(el("p", "eyebrow eyebrow-red", SERVICES[p.service].label + " · " + p.steps.length + " photos"));
      body.appendChild(el("h3", null, p.title));
      body.appendChild(el("p", "showcase-summary", p.summary));
      var stepsList = el("ol", "showcase-steps");

      function go(n) {
        idx = (n + p.steps.length) % p.steps.length;
        var step = p.steps[idx];
        main.dataset.fallback = "images/" + step.src;
        main.src = "images/web/" + step.src;
        main.alt = altFor(p.service, p.title) + ": " + step.caption;
        stage.setAttribute("aria-label", "View larger: " + step.caption);
        counter.textContent = String(idx + 1).padStart(2, "0") + " / " + String(p.steps.length).padStart(2, "0") + " — " + step.caption;
        $$("button", thumbs).forEach(function (t, i) { t.setAttribute("aria-current", String(i === idx)); });
        $$("li", stepsList).forEach(function (li, i) { li.classList.toggle("is-active", i === idx); });
      }

      p.steps.forEach(function (s, i) {
        var t = el("button", "showcase-thumb");
        t.type = "button";
        t.setAttribute("aria-label", "Step " + (i + 1) + ": " + s.caption);
        t.appendChild(img(s.src, "thumb", ""));
        t.addEventListener("click", function () { go(i); });
        thumbs.appendChild(t);

        var li = el("li");
        var b = el("button", null, s.caption);
        b.type = "button";
        b.addEventListener("click", function () { go(i); });
        li.appendChild(b);
        stepsList.appendChild(li);
      });

      prev.addEventListener("click", function () { go(idx - 1); });
      next.addEventListener("click", function () { go(idx + 1); });

      media.append(stage, prev, next, thumbs);
      body.appendChild(stepsList);
      art.append(media, body);
      showcaseEl.appendChild(art);
      go(0);
    });
  }

  /* ---------- lightbox ---------- */

  var lb = $("[data-lightbox]");
  var lbStage = $("[data-lightbox-stage]");
  var lbCaption = $("[data-lightbox-caption]");
  var lbItems = [];
  var lbIndex = 0;
  var lastFocus = null;

  function openLightbox(items, index) {
    lbItems = items;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    lb.classList.toggle("single", items.length < 2);
    showLightbox(index);
    $(".lightbox-close", lb).focus();
  }

  function showLightbox(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    var item = lbItems[lbIndex];
    lbStage.innerHTML = "";
    if (item.before) {
      var box = el("div");
      lbStage.appendChild(box);
      buildCompare(box, item.before, item.after, "web", item.title);
      lbCaption.textContent = item.title + " — drag to compare";
    } else {
      var pic = img(item.after, "web", item.title);
      pic.loading = "eager";
      lbStage.appendChild(pic);
      lbCaption.textContent = item.title;
    }
    if (lbItems.length > 1) lbCaption.textContent += "  (" + (lbIndex + 1) + " of " + lbItems.length + ")";
  }

  function closeLightbox() {
    lb.hidden = true;
    lbStage.innerHTML = "";
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  $$("[data-lightbox-close]").forEach(function (b) { b.addEventListener("click", closeLightbox); });
  $("[data-lightbox-prev]").addEventListener("click", function () { showLightbox(lbIndex - 1); });
  $("[data-lightbox-next]").addEventListener("click", function () { showLightbox(lbIndex + 1); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.target.classList && e.target.classList.contains("compare-range")) return; // let arrows move the slider
    if (e.key === "ArrowLeft" && lbItems.length > 1) showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight" && lbItems.length > 1) showLightbox(lbIndex + 1);
  });

  /* ---------- quote form ---------- */

  var form = $("[data-quote-form]");
  var statusEl = $("[data-form-status]");
  form.elements.started.value = String(Math.floor(Date.now() / 1000));

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
  }

  function fail(field, msg) {
    setStatus(msg, "error");
    field.setAttribute("aria-invalid", "true");
    field.focus();
    return false;
  }

  function validate() {
    $$("[aria-invalid]", form).forEach(function (f) { f.removeAttribute("aria-invalid"); });
    var f = form.elements;
    if (!f.name.value.trim()) return fail(f.name, "Please add your name.");
    if (f.phone.value.replace(/\D/g, "").length < 10) return fail(f.phone, "Please add a phone number we can text, with area code.");
    if (f.email.value && !/^\S+@\S+\.\S+$/.test(f.email.value)) return fail(f.email, "That email doesn’t look quite right.");
    if (!f.details.value.trim()) return fail(f.details, "Please tell us a little about the job.");
    return true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var btn = $("button[type=submit]", form);
    btn.disabled = true;
    setStatus("Sending…");

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false, message: "Unexpected response from the server." }; });
      })
      .then(function (res) {
        if (res.ok) {
          var keep = current;
          form.reset();
          setService(keep);
          form.elements.started.value = String(Math.floor(Date.now() / 1000));
          setStatus(res.message || "Thanks! Howard will get back to you soon.", "success");
        } else {
          setStatus(res.message || "Something went wrong. Please call 435-619-4656.", "error");
        }
      })
      .catch(function () {
        setStatus("Couldn’t send right now. Please call or text 435-619-4656.", "error");
      })
      .then(function () { btn.disabled = false; });
  });

  // result of a non-JS submit (contact.php redirects back with ?sent= or ?error=)
  var params = new URLSearchParams(location.search);
  if (params.has("sent")) setStatus("Thanks! Howard will get back to you soon.", "success");
  if (params.has("error")) setStatus(params.get("error") || "Something went wrong. Please call 435-619-4656.", "error");

  /* ---------- header / mobile nav ---------- */

  var header = $(".site-header");
  var navToggle = $(".nav-toggle");

  function closeNav() {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  navToggle.addEventListener("click", function () {
    var open = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $("[data-year]").textContent = new Date().getFullYear();

  /* ---------- start ---------- */

  var initial = location.hash.slice(1);
  setService(SERVICES[initial] ? initial : DEFAULT_SERVICE);
  if (SERVICES[initial]) setTimeout(function () { scrollToEl($("#services")); }, 50);
})();
