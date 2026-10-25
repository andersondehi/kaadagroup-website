/* Sankora · démonstration animée « Sankora en action » */
(function () {
  "use strict";
  /* Compte à rebours RDUE : 30 décembre 2026 */
  var jours = Math.max(0, Math.ceil((Date.UTC(2026, 11, 30) - Date.now()) / 864e5));
  document.querySelectorAll("[data-jours-eudr]").forEach(function (el) { el.textContent = jours; });
  /* Loupe : toute capture réelle s'ouvre en grand (pages produits) */
  (function () {
    var imgs = Array.prototype.slice.call(document.querySelectorAll("img[data-zoom]")).filter(function (i) { return !i.closest("a"); });
    if (!imgs.length || typeof HTMLDialogElement !== "function") return;
    var en = document.documentElement.lang === "en";
    var T = en ? { ouvrir: "Enlarge the screenshot", fermer: "Close", plus: "Zoom in", moins: "Zoom out", aide: "Click the image to switch between fit and actual size" }
               : { ouvrir: "Agrandir la capture", fermer: "Fermer", plus: "Zoomer", moins: "Dézoomer", aide: "Cliquez sur l'image pour passer de la vue d'ensemble à la taille réelle" };
    var ico = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + "</svg>"; };
    var LOUPE = '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>';
    var dlg = document.createElement("dialog");
    dlg.className = "kc-loupe";
    dlg.setAttribute("aria-label", T.ouvrir);
    dlg.innerHTML = '<div class="kc-loupe-barre"><p class="kc-loupe-titre"></p><div class="kc-loupe-outils">' +
      '<button type="button" data-z="-1" aria-label="' + T.moins + '">' + ico('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6"/>') + "</button>" +
      '<button type="button" data-z="1" aria-label="' + T.plus + '">' + ico(LOUPE) + "</button>" +
      '<button type="button" class="kc-loupe-fermer" aria-label="' + T.fermer + '">' + ico('<path d="M6 6l12 12M18 6L6 18"/>') + "</button></div></div>" +
      '<div class="kc-loupe-zone" tabindex="0"><img alt=""></div><p class="kc-loupe-aide">' + T.aide + "</p>";
    document.body.appendChild(dlg);
    var zone = dlg.querySelector(".kc-loupe-zone"), grande = zone.querySelector("img"), titre = dlg.querySelector(".kc-loupe-titre");
    var niveau = 0; // 0 : vue d'ensemble ; 1, 2, 3 : 100 %, 150 %, 200 % de la taille réelle
    var appliquer = function () {
      dlg.classList.toggle("zoome", niveau > 0);
      grande.style.width = niveau > 0 ? Math.round(grande.naturalWidth * [0, 1, 1.5, 2][niveau] / (window.devicePixelRatio > 1 ? 1.5 : 1)) + "px" : "";
    };
    var dernier = null;
    var ouvrir = function (img) {
      dernier = document.activeElement;
      grande.src = img.getAttribute("data-zoom"); grande.alt = img.alt || "";
      var fig = img.closest("[data-i]"), b = fig && fig.parentElement && fig.parentElement.parentElement.querySelector('.kc-f[data-i="' + fig.getAttribute("data-i") + '"] b');
      titre.textContent = img.alt ? img.alt.split(" : ")[0] : (b ? b.textContent : "");
      niveau = 0; appliquer(); dlg.showModal(); zone.scrollTo(0, 0);
    };
    dlg.querySelectorAll("[data-z]").forEach(function (b) {
      b.addEventListener("click", function () { niveau = Math.max(0, Math.min(3, niveau + Number(b.getAttribute("data-z")))); appliquer(); });
    });
    grande.addEventListener("click", function (e) {
      var r = grande.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      niveau = niveau ? 0 : 1; appliquer();
      if (niveau) requestAnimationFrame(function () { zone.scrollTo(fx * grande.offsetWidth - zone.clientWidth / 2, fy * grande.offsetHeight - zone.clientHeight / 2); });
    });
    dlg.querySelector(".kc-loupe-fermer").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { grande.removeAttribute("src"); if (dernier && dernier.focus) dernier.focus(); });
    imgs.forEach(function (img) {
      var fig = img.closest("figure") || img.parentElement;
      img.addEventListener("click", function () { ouvrir(img); });
      if (fig.querySelector(":scope > .kc-zoom")) return;
      fig.classList.add("kc-zoomable");
      var b = document.createElement("button");
      b.type = "button"; b.className = "kc-zoom"; b.setAttribute("aria-label", T.ouvrir); b.title = T.ouvrir; b.innerHTML = ico(LOUPE);
      /* cadre à plusieurs écrans (récit, défilement) : on agrandit celui qui est affiché */
      b.addEventListener("click", function () { ouvrir(fig.querySelector(".actif img[data-zoom], img.actif[data-zoom]") || img); });
      fig.appendChild(b);
    });
  })();
  /* Fonctionnalités clés : l'écran suit la fonctionnalité choisie */
  document.querySelectorAll("[data-kc-fonc]").forEach(function (f) {
    var items = Array.prototype.slice.call(f.querySelectorAll(".kc-f")), pans = Array.prototype.slice.call(f.querySelectorAll(".kc-p"));
    var choisir = function (i) {
      items.forEach(function (x) { var a = x.getAttribute("data-i") === i; x.classList.toggle("actif", a); x.querySelector(".kc-f-btn").setAttribute("aria-expanded", a ? "true" : "false"); });
      pans.forEach(function (x) { x.classList.toggle("actif", x.getAttribute("data-i") === i); });
    };
    items.forEach(function (x) { x.querySelector(".kc-f-btn").addEventListener("click", function () { choisir(x.getAttribute("data-i")); }); });
  });
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
