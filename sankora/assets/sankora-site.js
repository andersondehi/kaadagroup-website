/* Sankora · sous-site de kaadagroup.com : menus déroulants (survol ou clic sur grand écran, accordéon sur téléphone). */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".menu-item"));
  var menu = document.getElementById("menu");
  var burger = document.getElementById("burger");
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
    if (!e.target.closest(".menu") && !e.target.closest(".burger")) { fermerTout(); fermerMenuMobile(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var ouvert = items.filter(function (it) { return it.classList.contains("ouvert"); })[0];
    fermerTout();
    if (ouvert) ouvert.querySelector(".menu-btn").focus();
    else if (menu.classList.contains("ouvert")) { fermerMenuMobile(); burger.focus(); }
  });
})();
