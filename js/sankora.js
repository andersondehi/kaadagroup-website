/* Sankora · démonstration animée « Sankora en action » */
(function () {
  "use strict";
  var lecteur = document.querySelector("[data-lecteur]");
  if (!lecteur) return;
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var onglets = Array.prototype.slice.call(lecteur.querySelectorAll("[role=tab]"));
  var scenes = Array.prototype.slice.call(lecteur.querySelectorAll(".sk-scene"));
  var minuteurs = [], courant = 0, lance = false, suivant = null;

  function nombres(d) { return d.match(/-?\d+(\.\d+)?/g).map(Number); }
  function morph(el, duree) {
    var pts = el.getAttribute("data-morph").split("|"), a = nombres(pts[0]), b = nombres(pts[1]), gabarit = pts[1];
    var t0 = null;
    function pas(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / duree, 1), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, i = 0;
      el.setAttribute("d", gabarit.replace(/-?\d+(\.\d+)?/g, function () { var v = a[i] + (b[i] - a[i]) * e; i++; return v.toFixed(1); }));
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }
  function remettre(scene) {
    minuteurs.forEach(clearTimeout); minuteurs = [];
    scene.querySelectorAll("[data-t]").forEach(function (el) { el.classList.remove("on", "on2"); });
    scene.querySelectorAll("[data-morph]").forEach(function (el) { el.setAttribute("d", el.getAttribute("data-morph").split("|")[0]); });
    scene.classList.remove("fin");
  }
  function finale(scene) {
    scene.querySelectorAll("[data-t]").forEach(function (el) { el.classList.add("on"); if (el.hasAttribute("data-t2")) el.classList.add("on2"); });
    scene.querySelectorAll("[data-morph]").forEach(function (el) { el.setAttribute("d", el.getAttribute("data-morph").split("|")[1]); });
    scene.classList.add("fin");
  }
  function jouer(i) {
    courant = i;
    onglets.forEach(function (o, k) { o.setAttribute("aria-selected", k === i ? "true" : "false"); o.tabIndex = k === i ? 0 : -1; o.classList.remove("joue"); });
    scenes.forEach(function (s, k) { s.hidden = k !== i; });
    var scene = scenes[i];
    remettre(scene);
    if (reduit) { finale(scene); return; }
    void scene.offsetWidth;
    onglets[i].classList.add("joue");
    scene.querySelectorAll("[data-t]").forEach(function (el) {
      minuteurs.push(setTimeout(function () { el.classList.add("on"); }, +el.getAttribute("data-t")));
      if (el.hasAttribute("data-t2")) minuteurs.push(setTimeout(function () { el.classList.add("on2"); }, +el.getAttribute("data-t2")));
    });
    scene.querySelectorAll("[data-morph]").forEach(function (el) {
      minuteurs.push(setTimeout(function () { morph(el, 900); }, +el.getAttribute("data-tm")));
    });
    var duree = +scene.getAttribute("data-duree");
    minuteurs.push(setTimeout(function () { scene.classList.add("fin"); }, duree - 200));
    minuteurs.push(setTimeout(function () { jouer((i + 1) % scenes.length); }, duree + 1600));
  }
  onglets.forEach(function (o, k) {
    o.addEventListener("click", function () { jouer(k); });
    o.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? (k + 1) % onglets.length : e.key === "ArrowLeft" ? (k - 1 + onglets.length) % onglets.length : -1;
      if (n >= 0) { e.preventDefault(); onglets[n].focus(); jouer(n); }
    });
  });
  lecteur.classList.add("anime");
  if ("IntersectionObserver" in window && !reduit) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !lance) { lance = true; jouer(0); } });
    }, { threshold: .35 });
    io.observe(lecteur);
  } else { jouer(0); }
})();
