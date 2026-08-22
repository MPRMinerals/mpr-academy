(function () {
  "use strict";

  var CONTACT_EMAIL = "info@mpr-minerals.com";   /* change here to reroute the enquiry form */

  /* Video slots. Both stay off until the files are in the media folder, which
     keeps the console clean on a fresh checkout. Turn a slot on once its files
     are present; if one then fails to load, the coded animation takes over. */
  var MEDIA = { hero: false, band: false };
  var LANGS = ["en", "fr", "es"];
  var STORE = "mpr.lang";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ i18n */
  var BASE = {};   /* English, captured from the DOM */
  var DICT = window.MPR_T || {};
  var lang = "en";
  var splits = [];

  function nodes() { return $$("[data-i18n]"); }

  function captureBase() {
    nodes().forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (k in BASE) return;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) BASE[k] = el.getAttribute(attr);
      else if (el.hasAttribute("data-i18n-html")) BASE[k] = el.innerHTML;
      else BASE[k] = el.textContent;
    });
    BASE["meta.title"] = document.title;
    var d = $('meta[name="description"]');
    BASE["meta.desc"] = d ? d.getAttribute("content") : "";
  }

  function value(key, l) {
    if (l === "en") return BASE[key];
    var t = DICT[l];
    if (t && key in t) return t[key];
    return BASE[key];
  }

  function apply(l) {
    if (LANGS.indexOf(l) === -1) l = "en";
    lang = l;

    revertSplits();

    nodes().forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = value(k, l);
      if (v === undefined || v === null) return;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, v);
      else if (el.hasAttribute("data-i18n-html")) el.innerHTML = v;
      else el.textContent = v;
    });

    document.title = value("meta.title", l);
    var d = $('meta[name="description"]');
    if (d) d.setAttribute("content", value("meta.desc", l));
    document.documentElement.setAttribute("lang", l);

    $$(".lang button").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-lang") === l ? "true" : "false");
    });

    try { localStorage.setItem(STORE, l); } catch (e) {}

    resplit();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function detect() {
    var m = new RegExp("[?&]lang=(" + LANGS.join("|") + ")\\b").exec(location.search);
    if (m) return m[1];
    var stored = null;
    try { stored = localStorage.getItem(STORE); } catch (e) {}
    if (stored && LANGS.indexOf(stored) > -1) return stored;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    nav = String(nav).slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) > -1 ? nav : "en";
  }

  /* ------------------------------------------------------------ split text */
  function canSplit() { return !reduced && window.gsap && window.SplitText; }

  function revertSplits() {
    splits.forEach(function (s) { try { s.revert(); } catch (e) {} });
    splits = [];
  }

  function resplit() {
    if (!canSplit()) return;
    $$(".split").forEach(function (el) {
      var s = new SplitText(el, { type: "lines", mask: "lines", linesClass: "sline", aria: "none" });
      splits.push(s);
      gsap.fromTo(s.lines,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0, opacity: 1, duration: 1.05, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
    });
  }

  /* ------------------------------------------------------------ video */
  function mountVideo(host, base, poster, flagOn, flagOff) {
    if (!host) return;
    var portrait = window.innerWidth < 760;
    var stem = portrait && base === "hero-mine" ? "hero-mine-mobile" : base;
    var v = document.createElement("video");
    v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.preload = "metadata";
    v.poster = "media/" + poster;
    ["webm", "mp4"].forEach(function (ext) {
      var s = document.createElement("source");
      s.src = "media/" + stem + "." + ext;
      s.type = ext === "webm" ? "video/webm" : "video/mp4";
      v.appendChild(s);
    });
    var settled = false;
    function ok() {
      if (settled) return; settled = true;
      document.body.classList.add(flagOn);
      document.body.classList.remove(flagOff);
    }
    v.addEventListener("loadeddata", ok);
    v.addEventListener("canplay", ok);
    v.addEventListener("error", function () { host.innerHTML = ""; }, true);
    host.appendChild(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
    setTimeout(function () { if (!settled && v.readyState >= 2) ok(); }, 2500);
  }

  /* ------------------------------------------------------------ counters */
  function counters() {
    $$("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      if (reduced || !window.gsap) { el.textContent = String(target); return; }
      var from = target >= 1000 ? target - 60 : 0;
      var o = { n: from };
      gsap.to(o, {
        n: target, duration: 1.5, ease: "power2.out", snap: { n: 1 },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = String(Math.round(o.n)); }
      });
    });
  }

  /* ------------------------------------------------------------ header */
  function header() {
    var hdr = $("#hdr"), burger = $("#burger"), nav = $("#nav"), top = $("#toTop");
    var last = 0;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      hdr.classList.toggle("stuck", y > 12);
      if (top) top.classList.toggle("on", y > 800);
      var down = y > last && y > 260 && !hdr.classList.contains("open");
      hdr.style.transform = down ? "translateY(-100%)" : "translateY(0)";
      last = y;
    }
    hdr.style.transition = "transform .45s cubic-bezier(.22,.68,.36,1), background .4s, border-color .4s";
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    burger.addEventListener("click", function () {
      var open = hdr.classList.toggle("open");
      burger.classList.toggle("on", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) hdr.style.transform = "translateY(0)";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && hdr.classList.contains("open")) {
        hdr.classList.remove("open"); burger.classList.remove("on");
        burger.setAttribute("aria-expanded", "false");
      }
    });
    if (top) top.addEventListener("click", function () { scrollTo(0); });
  }

  /* ------------------------------------------------------------ scrolling */
  var lenis = null;
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -76, duration: 1.25 });
    else if (typeof target === "number") window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    else { var el = typeof target === "string" ? $(target) : target; if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  }

  function smooth() {
    if (reduced || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function anchors() {
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      a.addEventListener("click", function (e) {
        var el = $(id);
        if (!el) return;
        e.preventDefault();
        scrollTo(el);
        history.replaceState(null, "", id);
      });
    });
  }

  /* ------------------------------------------------------------ motion */
  function intro() {
    /* The hero opening runs in CSS so first paint does not wait on this bundle.
       Nothing to orchestrate here beyond the parallax set up further down. */
    if (reduced) $$(".anim").forEach(function (el) { el.style.opacity = 1; });
  }

  function reveals() {
    if (reduced || !window.gsap || !window.ScrollTrigger) {
      $$(".anim").forEach(function (el) { el.style.opacity = 1; });
      return;
    }
    $$(".anim").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.fromTo(el, { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: .95, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
  }

  function parallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;

    var hv = $("#heroMedia");
    if (hv) gsap.fromTo(hv, { yPercent: 0 }, { yPercent: 16, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.fromTo("#heroLogo", { yPercent: 0 }, { yPercent: 90, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.fromTo(".hero h1, .hero .lead", { yPercent: 0 }, { yPercent: 42, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.fromTo(".facts", { yPercent: 0 }, { yPercent: 18, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    var bm = $("#bandMedia");
    if (bm) gsap.fromTo(bm, { yPercent: -6 }, { yPercent: 6, ease: "none",
      scrollTrigger: { trigger: "#band", start: "top bottom", end: "bottom top", scrub: true } });

    $$(".kuba").forEach(function (k, i) {
      gsap.fromTo(k, { backgroundPositionX: "0px" },
        { backgroundPositionX: (i % 2 ? -260 : 260) + "px", ease: "none",
          scrollTrigger: { trigger: k, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  function chain() {
    var fill = $("#railFill"), list = $("#chainList");
    if (!fill || !list) return;
    if (reduced || !window.gsap || !window.ScrollTrigger) {
      fill.style.height = "100%";
      $$(".step").forEach(function (s) { s.classList.add("lit"); });
      return;
    }
    gsap.fromTo(fill, { height: "0%" }, { height: "100%", ease: "none",
      scrollTrigger: { trigger: list, start: "top 68%", end: "bottom 72%", scrub: .6 } });

    $$(".step").forEach(function (step) {
      gsap.fromTo(step, { x: 34, opacity: 0 },
        { x: 0, opacity: 1, duration: .8, ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 88%", once: true } });
      ScrollTrigger.create({
        trigger: step, start: "top 72%",
        onEnter: function () { step.classList.add("lit"); },
        onLeaveBack: function () { step.classList.remove("lit"); }
      });
    });
  }

  function pointer() {
    if (reduced || !window.gsap) return;
    if (!window.matchMedia || !window.matchMedia("(hover: hover)").matches) return;

    var ring = $("#ring");
    if (ring) {
      var rx = gsap.quickTo(ring, "x", { duration: .38, ease: "power3" });
      var ry = gsap.quickTo(ring, "y", { duration: .38, ease: "power3" });
      window.addEventListener("mousemove", function (e) {
        rx(e.clientX); ry(e.clientY);
        gsap.to(ring, { opacity: .85, duration: .3 });
      }, { passive: true });
      $$("a, button, input, select, textarea").forEach(function (el) {
        el.addEventListener("mouseenter", function () { gsap.to(ring, { scale: 1.9, opacity: .45, duration: .3 }); });
        el.addEventListener("mouseleave", function () { gsap.to(ring, { scale: 1, opacity: .85, duration: .3 }); });
      });
    }

    $$(".magnetic").forEach(function (el) {
      var qx = gsap.quickTo(el, "x", { duration: .5, ease: "power3" });
      var qy = gsap.quickTo(el, "y", { duration: .5, ease: "power3" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * .28);
        qy((e.clientY - (r.top + r.height / 2)) * .38);
      });
      el.addEventListener("mouseleave", function () { qx(0); qy(0); });
    });

    $$(".tilt").forEach(function (el) {
      var rx = gsap.quickTo(el, "rotationX", { duration: .5, ease: "power3" });
      var ry = gsap.quickTo(el, "rotationY", { duration: .5, ease: "power3" });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 7);
        rx(-((e.clientY - (r.top + r.height / 2)) / r.height) * 7);
      });
      el.addEventListener("mouseleave", function () { rx(0); ry(0); });
    });
  }

  /* ------------------------------------------------------------ form */
  function form() {
    var f = $("#form");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = function (n) { return (f.elements[n] && f.elements[n].value || "").trim(); };
      var name = g("name"), mail = g("email");
      if (!name || !mail) {
        var bad = !name ? f.elements.name : f.elements.email;
        bad.focus(); bad.style.borderColor = "#B4533A";
        return;
      }
      var sel = f.elements.interest;
      var kind = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent.trim() : "";
      var L = function (k) { return value(k, lang); };
      var body = [
        L("fm.name") + ": " + name,
        L("fm.co") + ": " + g("company"),
        L("fm.mail") + ": " + mail,
        L("fm.country") + ": " + g("country"),
        L("fm.tonnes") + ": " + g("tonnage"),
        L("fm.port") + ": " + g("destination"),
        L("fm.int") + ": " + kind,
        "",
        L("fm.msg") + ":",
        g("message")
      ].join("\n");
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("MPR Minerals, " + kind + (g("company") ? ", " + g("company") : "")) +
        "&body=" + encodeURIComponent(body);
    });
    $$("#form input").forEach(function (i) {
      i.addEventListener("input", function () { i.style.borderColor = ""; });
    });
  }

  /* ------------------------------------------------------------ boot */
  function boot() {
    captureBase();

    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.gsap && window.SplitText) gsap.registerPlugin(SplitText);

    if (MEDIA.hero) mountVideo($("#heroMedia"), "hero-mine", "hero-poster.jpg", "has-video", "no-video");
    if (MEDIA.band) mountVideo($("#bandMedia"), "plant", "plant-poster.jpg", "has-video-band", "no-video-band");

    header();
    smooth();
    anchors();
    form();

    apply(detect());

    intro();
    reveals();
    parallax();
    chain();
    counters();
    pointer();

    $$(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
    });

    var ml = $("#mailLink");
    if (ml) { ml.href = "mailto:" + CONTACT_EMAIL; ml.textContent = CONTACT_EMAIL; }

    window.addEventListener("resize", function () {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
