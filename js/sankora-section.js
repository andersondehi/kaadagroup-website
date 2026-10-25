/* Section Sankora : barre de navigation (menus déroulants). Généré par section_sankora.py. */
/* Sankora · sous-site de kaadagroup.com : menus déroulants (survol ou clic sur grand écran, accordéon sur téléphone). */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".sk-sousnav .menu-item"));
  var menu = document.getElementById("menu-sankora");
  var burger = document.getElementById("burger-sankora");
  if (!menu || !burger) return;
  var grandEcran = window.matchMedia("(min-width: 1141px) and (hover: hover)");

  function fermerTout(sauf) {
    items.forEach(function (it) {
      if (it === sauf) return;
      it.classList.remove("ouvert");
      var b = it.querySelector(".menu-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  function basculer(it, etat) {
    var b = it.querySelector(".menu-btn");
    if (!b) return;
    var ouvrir = etat === undefined ? !it.classList.contains("ouvert") : etat;
    if (ouvrir) fermerTout(it);
    it.classList.toggle("ouvert", ouvrir);
    b.setAttribute("aria-expanded", String(ouvrir));
  }
  function fermerMenuMobile() {
    menu.classList.remove("ouvert");
    burger.setAttribute("aria-expanded", "false");
  }

  items.forEach(function (it) {
    var b = it.querySelector(".menu-btn");
    if (!b) return;
    b.addEventListener("click", function () { basculer(it); });
    it.addEventListener("mouseenter", function () { if (grandEcran.matches) basculer(it, true); });
    it.addEventListener("mouseleave", function () { if (grandEcran.matches) basculer(it, false); });
  });
  burger.addEventListener("click", function () {
    var ouvert = menu.classList.toggle("ouvert");
    burger.setAttribute("aria-expanded", String(ouvert));
    if (!ouvert) fermerTout();
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) { fermerTout(); fermerMenuMobile(); }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".sk-sousnav")) { fermerTout(); fermerMenuMobile(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var ouvert = items.filter(function (it) { return it.classList.contains("ouvert"); })[0];
    fermerTout();
    if (ouvert) ouvert.querySelector(".menu-btn").focus();
    else if (menu.classList.contains("ouvert")) { fermerMenuMobile(); burger.focus(); }
  });
})();


/* La barre Sankora se cale sous l'en-tête Kaada Group quand celui-ci est visible (il se masque en descendant). */
(function () {
  var e = document.getElementById("entete"), n = document.querySelector(".sk-sousnav");
  if (!e || !n) return;
  var maj = function () {
    var h = e.classList.contains("masque") ? 0 : e.offsetHeight;
    n.style.setProperty("--sk-haut", h + "px");
  };
  maj();
  window.addEventListener("scroll", maj, { passive: true });
  window.addEventListener("resize", maj);
  if ("MutationObserver" in window) new MutationObserver(maj).observe(e, { attributes: true, attributeFilter: ["class"] });
})();

/* Écrans réels en fondu (accueil Sankora) : pause au survol ou au focus, arrêt si l'utilisateur réduit les animations. */
(function () {
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(document.querySelectorAll("[data-defile]"), function (f) {
    var imgs = Array.prototype.slice.call(f.querySelectorAll(".defile-pile img"));
    var pts = Array.prototype.slice.call(f.querySelectorAll(".defile-point"));
    var titre = f.querySelector(".defile-titre"), i = 0, minuteur = null, pause = false;
    if (imgs.length < 2) return;
    var montrer = function (n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (x, k) { x.classList.toggle("actif", k === i); if (k === i && x.loading === "lazy") x.loading = "eager"; });
      pts.forEach(function (x, k) { x.classList.toggle("actif", k === i); if (k === i) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
      if (titre) titre.textContent = imgs[i].getAttribute("data-titre") || "";
    };
    var lancer = function () { if (reduit) return; clearInterval(minuteur); minuteur = setInterval(function () { if (!pause && !document.hidden) montrer(i + 1); }, 4500); };
    pts.forEach(function (x, k) { x.addEventListener("click", function () { montrer(k); lancer(); }); });
    f.addEventListener("mouseenter", function () { pause = true; });
    f.addEventListener("mouseleave", function () { pause = false; });
    f.addEventListener("focusin", function () { pause = true; });
    f.addEventListener("focusout", function () { pause = false; });
    lancer();
  });
})();
