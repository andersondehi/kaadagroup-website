/* Kaada Group · interactions du site */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- En-tête, île flottante, barre mobile ---------- */
  var entete = $("#entete"), barre = $(".barre-mobile"), haut = $(".haut"), ile = $(".ile");
  function surDefilement() {
    var y = window.scrollY;
    if (entete) entete.classList.toggle("defile", y > 8);
    if (haut) haut.classList.toggle("visible", y > 900);
    if (ile) ile.classList.toggle("visible", y > 360 && !document.body.classList.contains("menu-ouvert"));
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
    var choix = -1;
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
      champ.setAttribute("aria-expanded", !!q);
      resultats.hidden = !q; choix = -1; champ.removeAttribute("aria-activedescendant");
      if (!q) { resultats.innerHTML = ""; return; }
      var mots = q.split(/\s+/);
      var trouves = index.filter(function (e) { var s = sansAccent(e.t + " " + e.s + " " + e.h); return mots.every(function (m) { return s.indexOf(m) > -1; }); }).slice(0, 8);
      resultats.innerHTML = trouves.length ? trouves.map(function (e, i) {
        return '<li><a id="pm-r' + i + '" role="option" href="' + echapper(e.h) + '"><b>' + surligner(e.t, mots[0]) + "</b><small>" + echapper(e.s) + "</small></a></li>";
      }).join("") : '<li class="pm-vide">Aucun résultat. Essayez « mobile », « EUDR » ou « Odoo », ou <a class="lien" href="contact.html">posez-nous la question</a>.</li>';
      if (trouves.length) selectionner(0);
    }
    champ.addEventListener("input", function () { filtrer(champ.value); });
    champ.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); selectionner(choix + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); selectionner(choix - 1); }
      else if (e.key === "Enter") { var a = $$("a[role=option]", resultats)[choix]; if (a) { e.preventDefault(); a.click(); } }
    });

    /* Clavier : ⌘K / Ctrl+K ou « / » pour ouvrir, Échap pour fermer, focus maintenu dans le menu */
    document.addEventListener("keydown", function (e) {
      var saisie = /input|textarea|select/i.test((e.target.tagName || "")) || e.target.isContentEditable;
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (mg.hidden) ouvrir(null, true); else champ.focus(); return; }
      if (e.key === "/" && !saisie && mg.hidden) { e.preventDefault(); ouvrir(null, true); return; }
      if (mg.hidden) return;
      if (e.key === "Escape") { if (champ.value) { champ.value = ""; filtrer(""); champ.focus(); } else fermer(); return; }
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
  function formater(n) { return Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " "); }
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
    setTimeout(function () { elements.forEach(function (el) { el.classList.add("vu"); }); }, 2600);
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
    }
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
  function majCompte() {
    var reste = echeance - Date.now();
    var j = Math.max(0, Math.floor(reste / 864e5)), h = Math.max(0, Math.floor(reste / 36e5) % 24), m = Math.max(0, Math.floor(reste / 6e4) % 60);
    $$("[data-cd='j']").forEach(function (el) { el.textContent = j; });
    $$("[data-cd='h']").forEach(function (el) { el.textContent = String(h).padStart(2, "0"); });
    $$("[data-cd='m']").forEach(function (el) { el.textContent = String(m).padStart(2, "0"); });
    $$("[data-jours-eudr]").forEach(function (el) { el.textContent = reste > 0 ? j : "0"; });
    if (reste <= 0) $$("[data-cd-note]").forEach(function (el) { el.textContent = "L'EUDR s'applique depuis le 30 décembre 2026 aux grands et moyens opérateurs."; });
  }
  if ($("[data-cd]") || $("[data-jours-eudr]")) { majCompte(); setInterval(majCompte, 30000); }

  /* ---------- Test de préparation EUDR ---------- */
  var quiz = $("#quiz");
  if (quiz) {
    var questions = $$(".question", quiz), barreQ = $("#quiz-barre"), res = $("#quiz-resultat"), scores = [], courant = 0;
    var recos = [
      "Cartographier toutes les parcelles : point GPS sous 4 ha, polygone au-delà.",
      "Relier chaque lot à ses producteurs et parcelles grâce à une traçabilité numérique.",
      "Croiser vos parcelles avec l'imagerie satellite et les cartes de couvert forestier.",
      "Centraliser les données producteurs dans une plateforme unique, à jour et sécurisée.",
      "Constituer un dossier de diligence raisonnée exploitable par vos acheteurs."
    ];
    function montrer(i) {
      questions.forEach(function (q, k) { q.classList.toggle("active", k === i); });
      if (barreQ) barreQ.style.width = (i / questions.length * 100) + "%";
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
      if (barreQ) barreQ.style.width = "100%";
      var total = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / (questions.length * 2) * 100);
      $("#quiz-score").textContent = total;
      var niv = $("#quiz-niveau"), txt = $("#quiz-texte"), ul = $("#quiz-reco");
      if (total <= 40) { niv.textContent = "Risque élevé"; niv.style.cssText = "background:#FDECEA;color:#B8361E"; txt.textContent = "Vos lots risquent d'être refusés par vos acheteurs européens. Un programme de mise en conformité est urgent."; }
      else if (total <= 75) { niv.textContent = "En bonne voie"; niv.style.cssText = "background:#FFF3EA;color:#8F3B04"; txt.textContent = "Les bases sont là, mais des maillons restent fragiles. Concentrez-vous sur les points ci-dessous."; }
      else { niv.textContent = "Bien préparé"; niv.style.cssText = "background:#E8F5EC;color:#1E5F3A"; txt.textContent = "Votre organisation est bien avancée. Sécurisez la qualité des données et l'automatisation des rapports."; }
      ul.innerHTML = "";
      scores.forEach(function (s, i) { if (s < 2) { var li = document.createElement("li"); li.textContent = recos[i]; ul.appendChild(li); } });
      if (!ul.children.length) { var li = document.createElement("li"); li.textContent = "Mettre en place un contrôle qualité continu et des rapports automatisés."; ul.appendChild(li); }
      try { sessionStorage.setItem("kdg-score-eudr", total); } catch (e) {}
      res.classList.add("active");
    }
    var refaire = $("#quiz-refaire");
    if (refaire) refaire.addEventListener("click", function () { scores = []; courant = 0; res.classList.remove("active"); montrer(0); $("button", questions[0]).focus(); });
    montrer(0);
  }

  /* ---------- Préremplissage du formulaire de contact ---------- */
  try {
    var params = new URLSearchParams(location.search), sujet = params.get("besoin");
    if (sujet) { var c = document.querySelector("input[name='besoins'][value='" + sujet + "']"); if (c) c.checked = true; }
    var poste = params.get("poste"), sel = $("#c-poste");
    if (poste && sel) { $$("option", sel).forEach(function (o) { if (o.value === poste) sel.value = poste; }); }
  } catch (e) {}

  /* ---------- Dépôt de fichier ---------- */
  $$(".fichier").forEach(function (z) {
    var input = $("input[type='file']", z), nom = $(".nom", z);
    ["dragenter", "dragover"].forEach(function (t) { z.addEventListener(t, function () { z.classList.add("survol"); }); });
    ["dragleave", "drop"].forEach(function (t) { z.addEventListener(t, function () { z.classList.remove("survol"); }); });
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) { nom.textContent = ""; return; }
      if (f.size > 8 * 1024 * 1024) { nom.textContent = "Fichier trop lourd (8 Mo maximum). Choisissez une version compressée."; input.value = ""; return; }
      nom.textContent = f.name;
    });
  });

  /* ---------- Validation des champs en direct ---------- */
  var RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function messageChamp(ch) {
    if (ch.type === "checkbox") return ch.checked ? "" : "Merci de cocher cette case pour continuer.";
    if (ch.type === "file") return (ch.files && ch.files.length) ? "" : "Merci de joindre votre CV.";
    var v = ch.value.trim();
    if (ch.required && !v) return "Ce champ est obligatoire.";
    if (ch.type === "email" && v && !RE_MAIL.test(v)) return "Cette adresse e-mail semble incomplète (exemple : nom@organisation.com).";
    if (ch.type === "url" && v && !/^https?:\/\/\S+\.\S+/.test(v)) return "Indiquez une adresse complète, commençant par https://";
    return "";
  }
  function marquer(ch, afficher) {
    var txt = messageChamp(ch), id = ch.id ? ch.id + "-msg" : null;
    var hote = ch.type === "checkbox" ? ch.closest("label") : (ch.closest(".fichier") || ch);
    var m = id && document.getElementById(id);
    if (txt && afficher) {
      if (!m && id) { m = document.createElement("span"); m.className = "champ-msg"; m.id = id; hote.insertAdjacentElement("afterend", m); }
      if (m) m.textContent = txt;
      ch.setAttribute("aria-invalid", "true");
      if (id) ch.setAttribute("aria-describedby", id);
    } else {
      if (m) m.remove();
      ch.removeAttribute("aria-invalid");
      ch.removeAttribute("aria-describedby");
      ch.classList.toggle("valide", !txt && ch.type !== "checkbox" && ch.type !== "file" && !!ch.value.trim() && (ch.required || ch.type === "email"));
    }
    return !txt;
  }
  $$("form[data-envoi]").forEach(function (form) {
    if (form.classList.contains("lettre")) return;
    $$("input, select, textarea", form).forEach(function (ch) {
      if (ch.type === "hidden" || ch.name === "site-web") return;
      ch.addEventListener("blur", function () { if (ch.value || ch.hasAttribute("aria-invalid")) marquer(ch, true); });
      ch.addEventListener("input", function () { if (ch.hasAttribute("aria-invalid")) marquer(ch, true); });
      ch.addEventListener("change", function () { if (ch.hasAttribute("aria-invalid") || ch.type === "checkbox" || ch.type === "file") marquer(ch, ch.hasAttribute("aria-invalid")); });
    });
  });

  /* ---------- Envoi des formulaires (Netlify Forms, repli par e-mail) ---------- */
  var COCHE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  $$("form[data-envoi]").forEach(function (form) {
    var lettre = form.classList.contains("lettre");
    var msg = lettre ? $(".lettre-msg", form.parentNode) : $(".message", form);
    var courriel = form.getAttribute("data-email");
    function afficher(t, ok) { if (!msg) return; msg.textContent = t; msg.className = (lettre ? "lettre-msg" : "message") + (ok ? " ok" : ""); msg.hidden = false; }
    function remercier() {
      var bloc = document.createElement("div");
      bloc.className = "merci"; bloc.setAttribute("role", "status"); bloc.tabIndex = -1;
      bloc.innerHTML = '<div class="rond">' + COCHE + '</div><h3>Message bien reçu</h3><p></p><button type="button" class="btn btn-s btn-sm">Envoyer une autre demande</button>';
      $("p", bloc).textContent = form.getAttribute("data-ok") || "Merci, votre message a bien été envoyé. Nous vous répondons sous 24 heures ouvrées.";
      Array.prototype.forEach.call(form.children, function (c) { c.setAttribute("data-masque", ""); c.hidden = true; });
      form.appendChild(bloc); bloc.focus();
      $("button", bloc).addEventListener("click", function () {
        bloc.remove();
        $$("[data-masque]", form).forEach(function (c) { c.hidden = c.classList.contains("message"); c.removeAttribute("data-masque"); });
        var premier = $("input:not([type=hidden]):not([name=site-web]), select, textarea", form); if (premier) premier.focus();
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var invalides = [];
      $$("[required]", form).forEach(function (ch) {
        if (lettre) {
          var bon = ch.value.trim() && RE_MAIL.test(ch.value.trim());
          ch.classList.toggle("erreur", !bon); if (!bon) invalides.push(ch);
        } else if (!marquer(ch, true)) invalides.push(ch);
      });
      $$("input[type=url]", form).forEach(function (ch) { if (!marquer(ch, true)) invalides.push(ch); });
      if (invalides.length) {
        if (lettre) afficher("Indiquez une adresse e-mail valide.");
        else afficher(invalides.length === 1 ? "Un champ est à corriger avant l'envoi." : invalides.length + " champs sont à corriger avant l'envoi.");
        invalides[0].focus();
        return;
      }
      if (msg) msg.hidden = true;
      var bouton = $("button[type='submit']", form), libelle = bouton ? bouton.innerHTML : "";
      if (bouton) { bouton.disabled = true; bouton.textContent = "Envoi en cours…"; }
      var donnees = new FormData(form), aFichier = !!$("input[type='file']", form);
      var options = aFichier ? { method: "POST", body: donnees } : { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(donnees).toString() };
      fetch(form.getAttribute("action") || "/", options).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        $$(".fichier .nom", form).forEach(function (n) { n.textContent = ""; });
        $$(".valide", form).forEach(function (c) { c.classList.remove("valide"); });
        if (lettre) afficher(form.getAttribute("data-ok") || "Merci, votre inscription est confirmée.", true); else remercier();
      }).catch(function () {
        afficher("L'envoi n'a pas abouti depuis cette page. Écrivez-nous directement à " + courriel + " : nous vous répondons sous 24 heures ouvrées.");
      }).then(function () { if (bouton) { bouton.disabled = false; bouton.innerHTML = libelle; } });
    });
  });

  /* ---------- Filtre des profils (carrières) ---------- */
  var filtres = $(".filtres");
  if (filtres) {
    var boutonsF = $$("button", filtres), postesF = $$(".poste[data-famille]"), compteP = $(".compte-postes", filtres);
    boutonsF.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filtre"), n = 0;
        boutonsF.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        postesF.forEach(function (p) { var ok = !f || p.getAttribute("data-famille") === f; p.hidden = !ok; if (ok) { n++; p.classList.add("vu"); } });
        if (compteP) compteP.textContent = n + (n > 1 ? " profils" : " profil");
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
    var hubs = [["Abidjan",-4.0,5.35,1],["Dakar",-17.3,14.7],["Accra",-0.2,5.6],["Lagos",3.4,6.5],["Douala",9.7,4.05],["Kinshasa",15.3,-4.3],["Nairobi",36.8,-1.3],["Addis-Abeba",38.7,9.0],["Johannesburg",28,-26.2],["Bamako",-8,12.6],["Ouagadougou",-1.5,12.4],["Le Caire",31.2,30],["Casablanca",-7.6,33.6],["Luanda",13.2,-8.8],["Dar es Salam",39.3,-6.8]];
    var liens = [[0,2],[0,3],[0,9],[0,10],[0,1],[0,4],[3,4],[4,5],[5,13],[5,6],[6,7],[6,14],[13,8],[14,8],[9,1],[9,12],[12,11],[11,7],[10,3]];
    var dedans = function (x, y, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; };
    var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
    var W, H, points = [], t0 = performance.now(), visible = true, boucle = null, fond = document.createElement("canvas"), encreFond = "", dernier = 0;
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
      if (!reduit && now - dernier < 32 && boucle) { boucle = requestAnimationFrame(dessiner); return; }
      dernier = now;
      var encre = css("--ink"), orange = css("--orange"), t = (now - t0) / 1000;
      if (encre !== encreFond) preparerFond(encre);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1; ctx.drawImage(fond, 0, 0, W, H);
      liens.forEach(function (l, i) {
        var a = proj(hubs[l[0]][1], hubs[l[0]][2]), b = proj(hubs[l[1]][1], hubs[l[1]][2]);
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * .18;
        ctx.strokeStyle = orange; ctx.globalAlpha = .45; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, b[0], b[1]); ctx.stroke();
        if (!reduit) { var p = (t * .22 + i * .137) % 1, q = 1 - p; ctx.globalAlpha = 1; ctx.fillStyle = orange; ctx.beginPath(); ctx.arc(q * q * a[0] + 2 * q * p * mx + p * p * b[0], q * q * a[1] + 2 * q * p * my + p * p * b[1], 2.1, 0, 7); ctx.fill(); }
      });
      ctx.globalAlpha = 1;
      hubs.forEach(function (h) {
        var c = proj(h[1], h[2]), principal = h[3];
        if (principal) { var pr = reduit ? 0 : (t % 2.4) / 2.4; ctx.strokeStyle = orange; ctx.globalAlpha = 1 - pr; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c[0], c[1], 7 + pr * 16, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        ctx.fillStyle = principal ? orange : encre; ctx.beginPath(); ctx.arc(c[0], c[1], principal ? 5.5 : 3, 0, 7); ctx.fill();
      });
      var ab = proj(-4.0, 5.35);
      ctx.font = "500 12px 'JetBrains Mono', monospace"; ctx.fillStyle = encre; ctx.textAlign = "right"; ctx.fillText("ABIDJAN", ab[0] - 12, ab[1] + 20);
      if (!reduit && visible && !document.hidden) boucle = requestAnimationFrame(dessiner); else boucle = null;
    };
    var relancer = function () { if (!boucle && visible && !document.hidden) boucle = requestAnimationFrame(dessiner); };
    construire(); dessiner(performance.now());
    window.addEventListener("resize", function () { construire(); if (!boucle) dessiner(performance.now()); });
    document.addEventListener("visibilitychange", relancer);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; relancer(); }).observe(cv);
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (!boucle) dessiner(performance.now()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!boucle) dessiner(performance.now()); });
  }
})();
