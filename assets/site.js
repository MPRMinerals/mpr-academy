/* ===========================================================
   MPR MINERALS GROUP — site behaviour
   i18n (en/fr/es) · nav · reveal · marquee · contact form
   No dependencies. Works from file:// as well as over HTTP.
   =========================================================== */
(function () {
  "use strict";

  var DICT = window.MPR_I18N || {};
  var LANGS = ["en", "fr", "es"];
  var STORE_KEY = "mpr.lang";
  var CONTACT_EMAIL = "info@mpr-minerals.com";   // <- change here to reroute the contact form

  /* ---------------------------------------------------- helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function readStored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function writeStored(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) { /* private mode */ }
  }

  function detectLang() {
    var qs = new RegExp("[?&]lang=(" + LANGS.join("|") + ")\\b").exec(location.search);
    if (qs) return qs[1];
    var stored = readStored();
    if (stored && LANGS.indexOf(stored) > -1) return stored;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    nav = String(nav).slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) > -1 ? nav : "en";
  }

  /* ---------------------------------------------------- i18n */
  function t(key, lang) {
    var d = DICT[lang] || DICT.en || {};
    if (key in d) return d[key];
    var fb = DICT.en || {};
    return (key in fb) ? fb[key] : "";
  }

  function stripTags(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || "";
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "en";

    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(key, lang);
      if (val === "") return;

      var attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        el.setAttribute(attr, stripTags(val));
      } else if (el.tagName === "TITLE") {
        document.title = stripTags(val);
      } else {
        el.innerHTML = val;
      }
    });

    document.documentElement.setAttribute("lang", lang);

    $$(".lang button").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-lang") === lang ? "true" : "false");
    });

    writeStored(lang);
    document.documentElement.setAttribute("data-lang", lang);
  }

  /* ---------------------------------------------------- boot */
  var current = detectLang();
  applyLang(current);

  $$(".lang button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      current = btn.getAttribute("data-lang");
      applyLang(current);
    });
  });

  /* ---------------------------------------------------- header */
  var hdr = $("#hdr");
  var burger = $("#burger");
  var nav = $("#nav");

  function onScroll() {
    if (!hdr) return;
    hdr.classList.toggle("is-stuck", window.scrollY > 12);
    var top = $("#toTop");
    if (top) top.classList.toggle("is-on", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && hdr) {
    burger.addEventListener("click", function () {
      var open = hdr.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && hdr && hdr.classList.contains("is-open")) {
        hdr.classList.remove("is-open");
        if (burger) {
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  var toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
    });
  }

  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------------------------------------------------- reveal on scroll */
  var revealables = $$(".reveal");
  if (!("IntersectionObserver" in window) || prefersReduced()) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------- trust marquee (seamless loop) */
  var track = $("#trustTrack");
  if (track && !prefersReduced()) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  }

  /* ---------------------------------------------------- contact form -> mailto */
  var form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (form.elements.name && form.elements.name.value || "").trim();
      var email = (form.elements.email && form.elements.email.value || "").trim();
      var company = (form.elements.company && form.elements.company.value || "").trim();
      var country = (form.elements.country && form.elements.country.value || "").trim();
      var msg = (form.elements.message && form.elements.message.value || "").trim();

      var sel = form.elements.interest;
      var interestLabel = sel && sel.options[sel.selectedIndex]
        ? stripTags(sel.options[sel.selectedIndex].textContent)
        : "";

      if (!name || !email) {
        [form.elements.name, form.elements.email].forEach(function (f) {
          if (f && !f.value.trim()) { f.focus(); f.style.borderColor = "#C0563F"; }
        });
        return;
      }

      var subject = "MPR Minerals — " + interestLabel + (company ? " — " + company : "");
      var body = [
        t("f.name", current) + ": " + name,
        t("f.company", current) + ": " + company,
        t("f.email", current) + ": " + email,
        t("f.country", current) + ": " + country,
        t("f.interest", current) + ": " + interestLabel,
        "",
        t("f.msg", current) + ":",
        msg
      ].join("\n");

      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });

    $$("#contactForm input").forEach(function (input) {
      input.addEventListener("input", function () { input.style.borderColor = ""; });
    });
  }

  /* ---------------------------------------------------- misc */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  var mail = $("#mailLink");
  if (mail) {
    mail.setAttribute("href", "mailto:" + CONTACT_EMAIL);
    mail.textContent = CONTACT_EMAIL;
  }

  /* keep the chosen language when moving to the Academy page */
  $$('a[href^="academy.html"]').forEach(function (a) {
    a.addEventListener("click", function () { writeStored(current); });
  });
})();
