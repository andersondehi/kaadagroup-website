/* Kaada Group · interactions du site */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Textes générés par le script, selon la langue de la page (ADR-020) ----------
     Clé absente ou vide en anglais : le texte français s'affiche. */
  var LANGUE = /^en/i.test(document.documentElement.lang) ? "en" : "fr";
  var TEXTES = {
    fr: {
      nombres: "fr-FR",
      resultat1: " résultat.", resultatN: " résultats.", parcourir: " Flèches haut et bas pour parcourir.", aucunResultat: "Aucun résultat.",
      jour: "jour", jours: "jours",
      eudrDepuisTitre: "EUDR", eudrDepuis: " applicable depuis le 30\u00A0décembre\u00A02026 aux grands et moyens opérateurs",
      eudrDemainTitre: "L'EUDR", eudrDemain: " s'applique demain aux grands et moyens opérateurs",
      eudrAvantTitre: "J-{j}", eudrAvant: " avant l'application de l'EUDR aux grands et moyens opérateurs",
      eudrNoteApres: "L'EUDR s'applique depuis le 30\u00A0décembre\u00A02026 aux grands et moyens opérateurs et négociants. Micro et petits opérateurs\u00A0: 30\u00A0juin\u00A02027 (déjà applicable à ceux soumis au règlement bois de l'UE).",
      reco1: "Cartographier toutes les parcelles : un point GPS pour les parcelles de 4 ha ou moins, un polygone au-delà.",
      reco2: "Relier chaque lot à ses producteurs et parcelles grâce à une traçabilité numérique.",
      reco3: "Croiser vos parcelles avec l'imagerie satellite et les cartes de couvert forestier.",
      reco4: "Centraliser les données producteurs dans un outil unique, conçu pour votre organisation, à jour et sécurisé.",
      reco5: "Constituer un dossier de diligence raisonnée exploitable par vos acheteurs.",
      recoDefaut: "Mettre en place un contrôle qualité continu et des rapports automatisés.",
      niveauEleve: "Risque élevé", texteEleve: "Vos lots risquent d'être refusés par vos acheteurs européens. Un programme de mise en conformité est urgent.",
      niveauMoyen: "En bonne voie", texteMoyen: "Les bases sont là, mais des maillons restent fragiles. Concentrez-vous sur les points ci-dessous.",
      niveauBon: "Bien préparé", texteBon: "Votre organisation est bien avancée. Sécurisez la qualité des données et l'automatisation des rapports.",
      annonce: " : {score} sur 100, {niveau}.",
      profil: " profil", profils: " profils",
      cartePause: "Mettre en pause l'animation de la carte", carteReprendre: "Reprendre l'animation de la carte"
    },
    en: {
      nombres: "en-GB",
      resultat1: " result.", resultatN: " results.", parcourir: " Use the up and down arrow keys to browse.", aucunResultat: "No results.",
      jour: "day", jours: "days",
      eudrDepuisTitre: "EUDR", eudrDepuis: " applicable since 30\u00A0December\u00A02026 to large and medium-sized operators",
      eudrDemainTitre: "The EUDR", eudrDemain: " applies tomorrow to large and medium-sized operators",
      eudrAvantTitre: "{j} days", eudrAvant: " until the EUDR applies to large and medium-sized operators",
      eudrNoteApres: "The EUDR has applied to large and medium-sized operators and traders since 30\u00A0December\u00A02026. Micro and small operators: 30\u00A0June\u00A02027 (already applicable to those covered by the EU Timber Regulation).",
      reco1: "Map every plot: a GPS point for plots of 4 ha or less, a polygon above that.",
      reco2: "Link each lot to its producers and plots through digital traceability.",
      reco3: "Cross-check your plots against satellite imagery and forest cover maps.",
      reco4: "Centralise producer data in a single tool, designed for your organisation, kept up to date and secure.",
      reco5: "Build a due diligence file your buyers can use.",
      recoDefaut: "Put continuous quality control and automated reporting in place.",
      niveauEleve: "High risk", texteEleve: "Your lots may be rejected by your European buyers. A compliance programme is urgent.",
      niveauMoyen: "On track", texteMoyen: "The foundations are in place, but some links in the chain are still weak. Focus on the points below.",
      niveauBon: "Well prepared", texteBon: "Your organisation is well advanced. Secure your data quality and automate your reporting.",
      annonce: ": {score} out of 100, {niveau}.",
      profil: " profile", profils: " profiles",
      cartePause: "Pause the map animation", carteReprendre: "Resume the map animation"
    }
  };
  function t(cle) { var v = TEXTES[LANGUE][cle]; return v ? v : TEXTES.fr[cle]; }
  // Signale que le script tourne : le secours CSS du tracé des illustrations (3 s) ne s'applique plus
  document.documentElement.classList.add("anim-pret");

  /* ---------- Images introuvables retirées (ADR-011, remplace onerror en ligne) ---------- */
  document.addEventListener("error", function (e) {
    if (e.target && e.target.tagName === "IMG") e.target.remove();
  }, true);
  $$("img").forEach(function (i) { if (i.complete && !i.naturalWidth) i.remove(); });

  /* ---------- En-tête, île flottante, barre mobile ---------- */
  var entete = $("#entete"), barre = $(".barre-mobile"), haut = $(".haut"), ile = $(".ile");
  function surDefilement() {
    var y = window.scrollY;
    if (entete) entete.classList.toggle("defile", y > 8);
    if (haut) haut.classList.toggle("visible", y > 900);
    if (ile) {
      var ileVisible = y > 360 && !document.body.classList.contains("menu-ouvert");
      ile.classList.toggle("visible", ileVisible);
      ile.inert = !ileVisible; // liens invisibles hors de la tabulation (QA-06)
    }
  }
  window.addEventListener("scroll", surDefilement, { passive: true });
  surDefilement();

  /* Indicateur qui glisse d'un lien à l'autre dans l'île */
  if (ile) {
    var indic = $(".ile-indic", ile), liensIle = $$("a:not(.ile-cta)", ile), courantIle = $("a[aria-current]", ile);
    var placer = function (a) {
      if (!a) { indic.style.opacity = 0; return; }
      indic.style.opacity = 1; indic.style.width = a.offsetWidth + "px"; indic.style.transform = "translateX(" + a.offsetLeft + "px)";
      liensIle.forEach(function (x) { x.classList.toggle("survol", x === a); });
    };
    liensIle.forEach(function (a) { a.addEventListener("mouseenter", function () { placer(a); }); a.addEventListener("focus", function () { placer(a); }); });
    ile.addEventListener("mouseleave", function () { placer(courantIle); });
    window.addEventListener("resize", function () { placer(courantIle); });
    setTimeout(function () { placer(courantIle); }, 60);
  }

  /* ---------- Menu plein écran ---------- */
  var mg = $("#menu-global"), declencheur = null;
  if (mg) {
    var champ = $("#pm-champ", mg), resultats = $("#pm-resultats", mg), liensListe = $$(".pm-liste a", mg), apercus = $$(".pm-apercu", mg);
    var index = []; try { index = JSON.parse($("#pm-index").textContent); } catch (e) {}
    var horsMenu = $$("body > *:not(#menu-global):not(script)");
    var montrerApercu = function (a) {
      var id = a.getAttribute("data-apercu");
      liensListe.forEach(function (x) { x.classList.toggle("choisi", x === a); });
      apercus.forEach(function (p) { p.hidden = p.id !== id; });
    };
    liensListe.forEach(function (a) {
      a.addEventListener("mouseenter", function () { montrerApercu(a); });
      a.addEventListener("focus", function () { montrerApercu(a); });
    });
    var initial = $(".pm-liste a[aria-current], .pm-liste a[data-actif]", mg) || liensListe[0];

    var ouvrir = function (bouton, recherche) {
      if (!mg.hidden) return;
      declencheur = bouton || $(".bouton-menu[data-ouvrir-menu]");
      if (declencheur) {
        var r = declencheur.getBoundingClientRect();
        mg.style.setProperty("--mx", (r.left + r.width / 2) + "px"); mg.style.setProperty("--my", (r.top + r.height / 2) + "px");
      }
      mg.hidden = false; mg.scrollTop = 0;
      document.body.classList.add("menu-ouvert");
      horsMenu.forEach(function (el) { el.setAttribute("inert", ""); });
      $$("[data-ouvrir-menu]").forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
      if (initial) montrerApercu(initial);
      requestAnimationFrame(function () { requestAnimationFrame(function () { mg.classList.add("ouvert"); }); });
      setTimeout(function () { (recherche ? champ : $("[data-fermer-menu]", mg)).focus(); }, recherche ? 120 : 60);
      surDefilement();
    };
    var fermer = function () {
      if (mg.hidden) return;
      mg.classList.remove("ouvert");
      $$("[data-ouvrir-menu]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      horsMenu.forEach(function (el) { el.removeAttribute("inert"); });
      document.body.classList.remove("menu-ouvert");
      annoncer(""); champ.setAttribute("aria-expanded", "false"); champ.removeAttribute("aria-activedescendant");
      setTimeout(function () { mg.hidden = true; champ.value = ""; filtrer(""); }, reduit ? 0 : 650);
      if (declencheur) declencheur.focus();
      surDefilement();
    };
    $$("[data-ouvrir-menu]").forEach(function (b) { b.addEventListener("click", function () { ouvrir(b); }); });
    $("[data-fermer-menu]", mg).addEventListener("click", fermer);
    mg.addEventListener("click", function (e) { var a = e.target.closest("a"); if (a && a.getAttribute("href").indexOf("#") > -1 && a.pathname === location.pathname) fermer(); });

    /* Recherche instantanée, insensible aux accents */
    var sansAccent = function (s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
    var echapper = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var surligner = function (txt, q) {
      var i = sansAccent(txt).indexOf(q); if (i < 0 || !q) return echapper(txt);
      return echapper(txt.slice(0, i)) + "<mark>" + echapper(txt.slice(i, i + q.length)) + "</mark>" + echapper(txt.slice(i + q.length));
    };
    var choix = -1, vide = $("#pm-vide", mg), statut = $("#pm-statut", mg), minuteStatut = null;
    /* Nombre de résultats annoncé 500 ms après la dernière frappe, pas à chaque lettre */
    var annoncer = function (t) {
      clearTimeout(minuteStatut);
      if (!statut) return;
      if (!t) { statut.textContent = ""; return; }
      minuteStatut = setTimeout(function () { statut.textContent = t; }, 500);
    };
    var selectionner = function (k) {
      var items = $$("a", resultats); if (!items.length) return;
      choix = (k + items.length) % items.length;
      items.forEach(function (a, i) { a.setAttribute("aria-selected", i === choix); });
      champ.setAttribute("aria-activedescendant", items[choix].id);
      items[choix].scrollIntoView({ block: "nearest" });
    };
    function filtrer(v) {
      var q = sansAccent(v.trim());
      mg.classList.toggle("recherche", !!q);
      choix = -1; champ.removeAttribute("aria-activedescendant");
      if (!q) { resultats.innerHTML = ""; resultats.hidden = true; if (vide) vide.hidden = true; champ.setAttribute("aria-expanded", "false"); annoncer(""); return; }
      var mots = q.split(/\s+/);
      var trouves = index.filter(function (e) { var s = sansAccent(e.t + " " + e.s + " " + e.h + " " + (e.k || "")); return mots.every(function (m) { return s.indexOf(m) > -1; }); }).slice(0, 8);
      // Le message « Aucun résultat » est hors de la liste : il contient un lien, interdit parmi les options
      resultats.innerHTML = trouves.map(function (e, i) {
        return '<li role="none"><a id="pm-r' + i + '" role="option" aria-selected="false" href="' + echapper(e.h) + '"><b>' + surligner(e.t, mots[0]) + "</b><small>" + echapper(e.s) + "</small></a></li>";
      }).join("");
      resultats.hidden = !trouves.length;
      if (vide) vide.hidden = !!trouves.length;
      champ.setAttribute("aria-expanded", trouves.length ? "true" : "false");
      if (trouves.length) selectionner(0);
      annoncer(trouves.length ? trouves.length + (trouves.length === 1 ? t("resultat1") : t("resultatN")) + t("parcourir") : t("aucunResultat"));
    }
    champ.addEventListener("input", function () { filtrer(champ.value); });
    champ.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); selectionner(choix + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); selectionner(choix - 1); }
      else if (e.key === "Enter") { var a = $$("a[role=option]", resultats)[choix]; if (a) { e.preventDefault(); a.click(); } }
    });

    /* Tabulation : chaque entrée de la liste, puis les liens de SON aperçu, puis l'entrée suivante (QA-LM-01).
       Sans colonne d'aperçus (petits écrans), l'ordre du document s'applique. */
    var droite = $(".mg-droite", mg);
    var liensApercu = function (i) { var p = document.getElementById(liensListe[i].getAttribute("data-apercu")); return p ? $$("a[href]", p) : []; };
    function tabulerApercus(e) {
      if (!droite || droite.offsetParent === null || mg.classList.contains("recherche")) return false;
      var ordre = [];
      liensListe.forEach(function (a, i) { ordre.push([a, i]); liensApercu(i).forEach(function (x) { ordre.push([x, i]); }); });
      var actif = document.activeElement, k = -1;
      ordre.forEach(function (o, n) { if (o[0] === actif) k = n; });
      var cible = null;
      if (k > -1) cible = ordre[k + (e.shiftKey ? -1 : 1)];
      else if (e.shiftKey) {
        // Retour depuis l'élément qui suit les aperçus (coordonnées) : dernier lien de l'aperçu Contact
        var focusables = $$("a[href], button, input", mg).filter(function (x) { return x.offsetParent !== null; });
        var prec = focusables[focusables.indexOf(actif) - 1];
        if (prec && (droite.contains(prec) || liensListe.indexOf(prec) > -1)) cible = ordre[ordre.length - 1];
      }
      if (!cible) return false; // avant la liste ou après le dernier aperçu : ordre du document et piège de focus
      e.preventDefault();
      montrerApercu(liensListe[cible[1]]);
      cible[0].focus();
      return true;
    }

    /* Clavier : ⌘K / Ctrl+K pour ouvrir, Échap pour fermer, focus maintenu dans le menu (raccourci « / » retiré, ADR-013) */
    document.addEventListener("keydown", function (e) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (mg.hidden) ouvrir(null, true); else champ.focus(); return; }
      if (mg.hidden) return;
      if (e.key === "Escape") { if (champ.value) { champ.value = ""; filtrer(""); champ.focus(); } else fermer(); return; }
      if (e.key === "Tab" && tabulerApercus(e)) return;
      if (e.key === "Tab") {
        var focusables = $$("a[href], button, input", mg).filter(function (x) { return x.offsetParent !== null; });
        var premier = focusables[0], dernier = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
        else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
      }
    });
    var kbd = $$(".bm-raccourci");
    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) kbd.forEach(function (k) { if (k.textContent === "⌘K") k.textContent = "Ctrl K"; });
  }
  if (haut) haut.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduit ? "auto" : "smooth" }); });
  $$("[data-annee]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Apparition et compteurs ---------- */
  function formater(n) { return Math.round(n).toLocaleString(t("nombres")).replace(/ | /g, " "); }
  function compter(el) {
    var cible = parseFloat(el.getAttribute("data-compteur"));
    if (reduit || isNaN(cible)) { el.textContent = formater(cible); return; }
    var t0 = null, duree = 1400;
    function pas(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / duree, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = formater(cible * e);
      if (p < 1) requestAnimationFrame(pas); else el.textContent = formater(cible);
    }
    requestAnimationFrame(pas);
  }
  var elements = $$(".rv"), compteurs = $$("[data-compteur]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute("data-compteur")) compter(el); else el.classList.add("vu");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    elements.forEach(function (el) { io.observe(el); });
    compteurs.forEach(function (el) { io.observe(el); });
    // Filet de sécurité pour les blocs de texte ; les illustrations tracées attendent d'être à l'écran
    setTimeout(function () { elements.forEach(function (el) { if (!el.classList.contains("illus-anim")) el.classList.add("vu"); }); }, 2600);
  } else {
    elements.forEach(function (el) { el.classList.add("vu"); });
  }

  /* ---------- Sommaire actif ---------- */
  var liensSommaire = $$(".sommaire a[href^='#']");
  if (liensSommaire.length && "IntersectionObserver" in window) {
    var parId = {};
    liensSommaire.forEach(function (a) { parId[a.getAttribute("href").slice(1)] = a; });
    var ioS = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        liensSommaire.forEach(function (a) { a.classList.remove("actif"); });
        if (parId[e.target.id]) parId[e.target.id].classList.add("actif");
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    Object.keys(parId).forEach(function (id) { var s = document.getElementById(id); if (s) ioS.observe(s); });
  }

  /* ---------- Onglets accessibles ---------- */
  $$("[role='tablist']").forEach(function (liste) {
    var onglets = $$("[role='tab']", liste);
    function activer(o, focus) {
      onglets.forEach(function (x) {
        var actif = x === o;
        x.setAttribute("aria-selected", actif);
        x.tabIndex = actif ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !actif;
      });
      if (focus) o.focus();
      placer(o);
    }
    // Indicateur qui glisse d'un onglet à l'autre (seul transform est animé)
    var indic = document.createElement("span"); indic.className = "onglets-indic"; indic.setAttribute("aria-hidden", "true"); liste.prepend(indic);
    function placer(o) { indic.style.width = o.offsetWidth + "px"; indic.style.height = o.offsetHeight + "px"; indic.style.transform = "translate(" + o.offsetLeft + "px," + o.offsetTop + "px)"; }
    activer(onglets.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0] || onglets[0]);
    requestAnimationFrame(function () { liste.classList.add("indic-pret"); });
    // Les polices chargées après coup recomposent les libellés : on recale l'indicateur (QA-AN-02)
    var recaler = function () { placer(onglets.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0]); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(recaler);
    window.addEventListener("load", recaler);
    window.addEventListener("resize", function () { placer(onglets.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0]); });
    // Lien profond vers un panneau (ex. agritech.html#p-coop) : l'onglet correspondant s'ouvre, sans voler le focus
    function suivreAncre() {
      var id = location.hash.slice(1), o = id && onglets.filter(function (x) { return x.getAttribute("aria-controls") === id; })[0];
      if (!o) return;
      activer(o);
      var panneau = document.getElementById(id), defiler = function () { panneau.scrollIntoView({ block: "start" }); };
      defiler();
      // Les images chargées au-dessus décalent le panneau : on le recale une fois la page chargée
      if (document.readyState !== "complete") window.addEventListener("load", defiler, { once: true });
    }
    suivreAncre();
    window.addEventListener("hashchange", suivreAncre);
    onglets.forEach(function (o, i) {
      o.addEventListener("click", function () {
        activer(o);
        if (window.innerWidth < 1000) { var p = document.getElementById(o.getAttribute("aria-controls")); if (p) p.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" }); }
      });
      o.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = onglets[(i + 1) % onglets.length];
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = onglets[(i - 1 + onglets.length) % onglets.length];
        if (n) { e.preventDefault(); activer(n, true); }
      });
    });
  });

  /* ---------- Compte à rebours EUDR (30 décembre 2026) ---------- */
  var echeance = new Date("2026-12-30T00:00:00Z").getTime();
  var minuterie = null;
  function majCompte() {
    var reste = echeance - Date.now();
    // Le compteur est masqué dans le HTML (pas de chiffre sans script) et après l'échéance
    $$(".compte").forEach(function (el) { el.hidden = reste <= 0; });
    // Jours calendaires restants (arrondi supérieur), même nombre pour le compteur et le menu : J-1 = veille de l'échéance
    var jours = Math.max(0, Math.ceil(reste / 864e5));
    $$("[data-cd='j']").forEach(function (el) {
      el.textContent = jours;
      if (el.nextElementSibling) el.nextElementSibling.textContent = jours === 1 ? t("jour") : t("jours");
    });
    $$("[data-eudr-menu]").forEach(function (el) {
      var b = document.createElement("b"), suite, jm = jours;
      if (reste <= 0) { b.textContent = t("eudrDepuisTitre"); suite = t("eudrDepuis"); }
      else if (jm === 1) { b.textContent = t("eudrDemainTitre"); suite = t("eudrDemain"); }
      else { b.textContent = t("eudrAvantTitre").replace("{j}", jm); suite = t("eudrAvant"); }
      el.textContent = "";
      el.append(b, suite);
    });
    if (reste <= 0) {
      $$("[data-cd-note]").forEach(function (el) { el.textContent = t("eudrNoteApres"); });
      if (minuterie) { clearInterval(minuterie); minuterie = null; }
    }
  }
  if ($("[data-cd]") || $("[data-eudr-menu]")) { minuterie = setInterval(majCompte, 60000); majCompte(); }

  /* ---------- Test de préparation EUDR ---------- */
  var quiz = $("#quiz");
  if (quiz) {
    var repli = $("[data-quiz-repli]", quiz), interactif = $("[data-quiz-interactif]", quiz);
    if (interactif) interactif.hidden = false;
    if (repli) repli.hidden = true;
    var questions = $$(".question", quiz), barreQ = $("#quiz-barre"), res = $("#quiz-resultat"), scores = [], courant = 0;
    var recos = [t("reco1"), t("reco2"), t("reco3"), t("reco4"), t("reco5")];
    function montrer(i) {
      questions.forEach(function (q, k) { q.classList.toggle("active", k === i); });
      if (barreQ) barreQ.style.transform = "scaleX(" + (i / questions.length) + ")";
    }
    questions.forEach(function (q, i) {
      $$("button", q).forEach(function (b) {
        b.addEventListener("click", function () {
          scores[i] = parseInt(b.getAttribute("data-v"), 10);
          courant = i + 1;
          if (courant < questions.length) { montrer(courant); $("button", questions[courant]).focus(); }
          else terminer();
        });
      });
    });
    function terminer() {
      questions.forEach(function (q) { q.classList.remove("active"); });
      if (barreQ) barreQ.style.transform = "none";
      var total = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / (questions.length * 2) * 100);
      $("#quiz-score").textContent = total;
      var niv = $("#quiz-niveau"), txt = $("#quiz-texte"), ul = $("#quiz-reco");
      if (total <= 40) { niv.textContent = t("niveauEleve"); niv.style.cssText = "background:#FDECEA;color:#B8361E"; txt.textContent = t("texteEleve"); }
      else if (total <= 75) { niv.textContent = t("niveauMoyen"); niv.style.cssText = "background:#FFF3EA;color:#8F3B04"; txt.textContent = t("texteMoyen"); }
      else { niv.textContent = t("niveauBon"); niv.style.cssText = "background:#E8F5EC;color:#1E5F3A"; txt.textContent = t("texteBon"); }
      ul.innerHTML = "";
      scores.forEach(function (s, i) { if (s < 2) { var li = document.createElement("li"); li.textContent = recos[i]; ul.appendChild(li); } });
      if (!ul.children.length) { var li = document.createElement("li"); li.textContent = t("recoDefaut"); ul.appendChild(li); }
      res.classList.add("active");
      $("#quiz-annonce").textContent = t("annonce").replace("{score}", total).replace("{niveau}", niv.textContent.toLowerCase());
      $("#quiz-titre-resultat").focus();
    }
    var refaire = $("#quiz-refaire");
    if (refaire) refaire.addEventListener("click", function () { scores = []; courant = 0; res.classList.remove("active"); $("#quiz-annonce").textContent = ""; montrer(0); $("button", questions[0]).focus(); });
    montrer(0);
  }

  /* ---------- Filtre des profils (carrières) ---------- */
  var filtres = $(".filtres");
  if (filtres) {
    var boutonsF = $$("button", filtres), postesF = $$(".poste[data-famille]"), compteP = $(".compte-postes", filtres);
    boutonsF.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filtre"), n = 0;
        boutonsF.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        postesF.forEach(function (p) { var ok = !f || p.getAttribute("data-famille") === f; p.hidden = !ok; if (ok) { n++; p.classList.add("vu"); } });
        if (compteP) // Pluriel : « 0 profil » en français, « 0 profiles » en anglais
        compteP.textContent = n + ((LANGUE === "en" ? n !== 1 : n > 1) ? t("profils") : t("profil"));
      });
    });
  }

  /* ---------- Progression de lecture (articles) ---------- */
  var lecture = $(".lecture"), article = $(".article");
  if (lecture && article) {
    var majLecture = function () {
      var r = article.getBoundingClientRect(), total = r.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
      lecture.style.transform = "scaleX(" + p + ")";
    };
    window.addEventListener("scroll", majLecture, { passive: true }); majLecture();
  }

  /* ---------- Parcours de la donnée : étape mise en avant tour à tour ---------- */
  $$(".flux").forEach(function (liste) {
    var etapesF = $$("li", liste), i = 0, minuterie = null;
    if (reduit || !etapesF.length) return;
    function suivant() { etapesF.forEach(function (e, k) { e.classList.toggle("actif", k === i); }); i = (i + 1) % etapesF.length; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting && !minuterie) { suivant(); minuterie = setInterval(suivant, 1800); }
          else if (!e.isIntersecting && minuterie) { clearInterval(minuterie); minuterie = null; }
        });
      }, { threshold: 0.3 }).observe(liste);
    }
  });

  /* ---------- Carte d'Afrique animée (héros d'accueil) ---------- */
  var cv = document.getElementById("afrique");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var P = [[-17,21],[-16.5,16],[-17.3,14.7],[-15,11],[-13,9],[-11,6.8],[-8,4.5],[-3,5],[2,6.2],[6,4.3],[9,4],[9.6,1],[11,-3],[12.2,-6],[13.5,-11],[12,-17],[14.5,-23],[15.5,-28],[18,-34.5],[20,-35],[26,-34],[31,-29.5],[33,-26],[35.5,-22],[35,-18],[40.5,-11],[39.3,-6],[40.2,-2.5],[42,-1],[46,2],[51,11.5],[43.5,11.8],[41,14],[39,16],[37.3,19],[36,22],[34.5,27],[32.5,30],[29,31],[25,31.8],[20,31],[20,32.5],[15,32.5],[11,33.5],[10.5,37],[3,36.8],[-2,35],[-6,35.8],[-9.5,32],[-10,29],[-13,27.5],[-15,24],[-17,21]];
    var MAD = [[44,-25],[47,-25],[50.5,-15],[49,-12],[44,-16.5]];
    /* Grandes villes et capitales réelles (longitude, latitude) ; aucune n'est nommée à l'écran, sauf Abidjan */
    var hubs = [["Abidjan",-4.03,5.36,1],["Dakar",-17.44,14.69],["Conakry",-13.71,9.64],["Monrovia",-10.8,6.3],["Bamako",-8.0,12.64],["Ouagadougou",-1.52,12.37],["Niamey",2.11,13.51],
      ["Accra",-0.19,5.6],["Lagos",3.38,6.52],["Abuja",7.49,9.06],["N'Djamena",15.04,12.13],["Douala",9.7,4.05],["Yaoundé",11.5,3.85],["Libreville",9.45,0.39],
      ["Kinshasa",15.31,-4.32],["Luanda",13.23,-8.84],["Khartoum",32.56,15.5],["Addis-Abeba",38.74,9.03],["Kampala",32.58,0.35],["Nairobi",36.82,-1.29],["Kigali",30.06,-1.95],
      ["Dar es Salam",39.28,-6.79],["Lusaka",28.32,-15.39],["Harare",31.05,-17.83],["Maputo",32.57,-25.97],["Johannesburg",28.05,-26.2],["Le Cap",18.42,-33.92],
      ["Antananarivo",47.52,-18.88],["Le Caire",31.24,30.04],["Tunis",10.18,36.81],["Alger",3.06,36.75],["Casablanca",-7.59,33.57]];
    /* Arcs orange qui partent d'Abidjan (charte ch. 05), avec un point qui circule */
    var liens = [[0,1],[0,4],[0,5],[0,7],[0,8],[0,9],[0,11],[0,14],[0,17],[0,19],[0,25],[0,28],[0,31],[0,3]];
    /* Liens secondaires entre villes : plus discrets, sans point mobile */
    var liensSec = [[1,2],[2,3],[4,6],[6,10],[8,9],[9,10],[11,12],[12,13],[14,15],[14,20],[20,18],[18,19],[19,21],[17,16],[16,28],[28,29],[29,30],[30,31],[22,23],[23,24],[24,25],[25,26],[21,22],[15,22],[21,27]];
    var dedans = function (x, y, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; };
    var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
    var W, H, points = [], t0 = performance.now(), visible = true, boucle = null, fond = document.createElement("canvas"), encreFond = "", dernier = 0;
    var enPause = false, boutonPause = $("[data-carte-pause]");
    var proj = function (lon, lat) { var pad = W * .04, s = Math.min((W - 2 * pad) / 72, (H - 2 * pad) / 74), ox = (W - 72 * s) / 2, oy = (H - 74 * s) / 2; return [ox + (lon + 19) * s, oy + (38 - lat) * s]; };
    var construire = function () {
      var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height;
      cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); points = [];
      for (var lat = 38; lat > -36; lat -= 1.55) for (var lon = -19; lon < 53; lon += 1.55) if (dedans(lon, lat, P) || dedans(lon, lat, MAD)) points.push(proj(lon, lat));
      encreFond = "";
    };
    /* Les ~1 500 points du continent sont dessinés une seule fois dans un calque, puis recopiés à chaque image */
    var preparerFond = function (encre) {
      var d = window.devicePixelRatio || 1, f = fond.getContext("2d");
      fond.width = W * d; fond.height = H * d; f.setTransform(d, 0, 0, d, 0, 0);
      f.fillStyle = encre; f.globalAlpha = .2;
      var r = Math.max(1.1, W / 330);
      points.forEach(function (p) { f.beginPath(); f.arc(p[0], p[1], r, 0, 7); f.fill(); });
      encreFond = encre;
    };
    var dessiner = function (now) {
      /* 30 images par seconde suffisent pour ces mouvements lents et ménagent la batterie des téléphones */
      if (!(reduit || enPause) && now - dernier < 32 && boucle) { boucle = requestAnimationFrame(dessiner); return; }
      dernier = now;
      var encre = css("--ink"), orange = css("--orange"), t = (now - t0) / 1000;
      if (encre !== encreFond) preparerFond(encre);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1; ctx.drawImage(fond, 0, 0, W, H);
      liensSec.forEach(function (l) {
        var a = proj(hubs[l[0]][1], hubs[l[0]][2]), b = proj(hubs[l[1]][1], hubs[l[1]][2]);
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * .18;
        ctx.strokeStyle = orange; ctx.globalAlpha = .22; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, b[0], b[1]); ctx.stroke();
      });
      liens.forEach(function (l, i) {
        var a = proj(hubs[l[0]][1], hubs[l[0]][2]), b = proj(hubs[l[1]][1], hubs[l[1]][2]);
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * .18;
        ctx.strokeStyle = orange; ctx.globalAlpha = .45; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, b[0], b[1]); ctx.stroke();
        if (!(reduit || enPause)) { var p = (t * .22 + i * .137) % 1, q = 1 - p; ctx.globalAlpha = 1; ctx.fillStyle = orange; ctx.beginPath(); ctx.arc(q * q * a[0] + 2 * q * p * mx + p * p * b[0], q * q * a[1] + 2 * q * p * my + p * p * b[1], 2.1, 0, 7); ctx.fill(); }
      });
      ctx.globalAlpha = 1;
      hubs.forEach(function (h) {
        var c = proj(h[1], h[2]), principal = h[3];
        if (principal) { var pr = (reduit || enPause) ? 0 : (t % 2.4) / 2.4; ctx.strokeStyle = orange; ctx.globalAlpha = 1 - pr; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c[0], c[1], 7 + pr * 16, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        ctx.fillStyle = principal ? orange : encre; ctx.beginPath(); ctx.arc(c[0], c[1], principal ? 5.5 : 3, 0, 7); ctx.fill();
      });
      var ab = proj(-4.0, 5.35);
      ctx.font = "400 12px 'JetBrains Mono', monospace"; ctx.fillStyle = encre; ctx.textAlign = "right"; ctx.fillText("ABIDJAN", ab[0] - 12, ab[1] + 20);
      if (!(reduit || enPause) && visible && !document.hidden) boucle = requestAnimationFrame(dessiner); else boucle = null;
    };
    var relancer = function () { if (!boucle && !(reduit || enPause) && visible && !document.hidden) boucle = requestAnimationFrame(dessiner); };
    /* Bouton pause : masqué si l'utilisateur a demandé moins d'animations (rien à arrêter) ; la pause vaut pour la page vue, rien n'est stocké dans le navigateur */
    var majPause = function () {
      var lib = enPause ? t("carteReprendre") : t("cartePause");
      boutonPause.setAttribute("aria-label", lib); boutonPause.title = lib;
      $(".ic-pause", boutonPause).toggleAttribute("hidden", enPause); $(".ic-lecture", boutonPause).toggleAttribute("hidden", !enPause);
    };
    if (boutonPause && !reduit) {
      boutonPause.hidden = false; majPause();
      boutonPause.addEventListener("click", function () {
        enPause = !enPause;
        majPause();
        if (enPause) { if (boucle) { cancelAnimationFrame(boucle); boucle = null; } dessiner(performance.now()); } else relancer();
      });
    }
    construire(); dessiner(performance.now());
    window.addEventListener("resize", function () { construire(); if (!boucle) dessiner(performance.now()); });
    document.addEventListener("visibilitychange", relancer);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; relancer(); }).observe(cv);
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (!boucle) dessiner(performance.now()); });
    document.addEventListener("kdg:theme", function () { if (!boucle) dessiner(performance.now()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!boucle) dessiner(performance.now()); });
  }
  /* MODERNISATION:DEBUT */
/* Bloc géré par outils/site-netlify/moderniser_site.py (charte v2.2, ch. 16) */
  /* ---------- Thème clair / sombre / système, mémorisé ---------- */
  (function () {
    var CLE = "kdg-theme", racine = document.documentElement;
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var LBL = LANGUE === "en" ? { dark: "Switch to dark theme", light: "Switch to light theme" } : { dark: "Passer en thème sombre", light: "Passer en thème clair" };
    // Images et couleur de barre prévues pour un thème : elles suivent le thème choisi, pas seulement celui du système
    var sources = $$('source[media*="prefers-color-scheme"], meta[name="theme-color"][media]');
    sources.forEach(function (s) { s.setAttribute("data-media-origine", s.getAttribute("media")); });
    var lire = function () { try { var v = localStorage.getItem(CLE); return v === "light" || v === "dark" ? v : "auto"; } catch (e) { return "auto"; } };
    var effectif = function (c) { return c === "auto" ? (mq.matches ? "dark" : "light") : c; };
    function appliquer(c, memoriser) {
      if (c === "auto") racine.removeAttribute("data-theme"); else racine.setAttribute("data-theme", c);
      if (memoriser) { try { if (c === "auto") localStorage.removeItem(CLE); else localStorage.setItem(CLE, c); } catch (e) {} }
      var eff = effectif(c);
      sources.forEach(function (s) {
        var o = s.getAttribute("data-media-origine");
        s.setAttribute("media", c === "auto" ? o : ((o.indexOf("dark") > -1) === (eff === "dark") ? "all" : "not all"));
      });
      $$("[data-theme-choix]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-choix") === c)); });
      $$("[data-theme-bascule]").forEach(function (b) { var l = eff === "dark" ? LBL.light : LBL.dark; b.setAttribute("aria-label", l); b.title = l; });
      document.dispatchEvent(new CustomEvent("kdg:theme", { detail: { choix: c, effectif: eff } }));
    }
    function changer(c) {
      if (document.startViewTransition && !reduit) document.startViewTransition(function () { appliquer(c, true); });
      else appliquer(c, true);
    }
    $$("[data-theme-bascule]").forEach(function (b) { b.addEventListener("click", function () { changer(effectif(lire()) === "dark" ? "light" : "dark"); }); });
    $$("[data-theme-choix]").forEach(function (b) { b.addEventListener("click", function () { changer(b.getAttribute("data-theme-choix")); }); });
    if (mq.addEventListener) mq.addEventListener("change", function () { if (lire() === "auto") appliquer("auto", false); });
    appliquer(lire(), false);
  })();

  /* ---------- En-tête : se range quand on descend, revient dès qu'on remonte ---------- */
  (function () {
    var e = $("#entete"); if (!e) return;
    var dernier = window.scrollY, attente = false;
    window.addEventListener("scroll", function () {
      if (attente) return; attente = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, d = y - dernier;
        if (document.body.classList.contains("menu-ouvert") || y < 480 || d < -6) e.classList.remove("masque");
        else if (d > 6 && !e.contains(document.activeElement)) e.classList.add("masque");
        if (Math.abs(d) > 6) dernier = y;
        attente = false;
      });
    }, { passive: true });
  })();
/* MODERNISATION:FIN */
})();
