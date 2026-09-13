// Studio Kiemt — shared prototype logic (cart, catalog, header, page widgets).
// This is a client-side demo: the cart lives in localStorage and checkout does
// not charge anything. Ported 1:1 from the Claude Design prototype's Component class.
(function () {
  "use strict";

  var CART_KEY = "sk-cart";

  var KLEUREN = [
    { naam: "Mosgroen", hex: "#6E7A5E" },
    { naam: "Saliegroen", hex: "#8A9480" },
    { naam: "Taupe", hex: "#A89684" },
    { naam: "Oudroze", hex: "#C3A29B" },
    { naam: "Bruinrood", hex: "#9A5B47" },
    { naam: "Wijnrood", hex: "#7B3B3B" }
  ];
  var MAT_KLEUREN = {
    Merinowol: ["Mosgroen", "Saliegroen", "Taupe", "Oudroze", "Bruinrood", "Wijnrood"],
    Outdoor: ["Mosgroen", "Taupe", "Bruinrood", "Wijnrood"],
    Mousseline: ["Saliegroen", "Taupe", "Oudroze"]
  };
  var UITVERKOCHT = ["Wijnrood"];
  var PRIJZEN = {
    Merinowol: { Babyschaal: 79, Peuterschaal: 89 },
    Outdoor: { Babyschaal: 75, Peuterschaal: 85 },
    Mousseline: { Babyschaal: 59, Peuterschaal: 65 }
  };
  var SEIZOENEN = {
    Merinowol: ["Winter", "Allround"],
    Outdoor: ["Winter", "Allround"],
    Mousseline: ["Zomer"]
  };
  var FOTOS = {
    Merinowol: "assets/stof-wolfleece-sq.jpg",
    Mousseline: "assets/stoffen-flatlay.jpg",
    Outdoor: "assets/sfeer-outdoor.jpg"
  };
  var KORTINGSCODE = "KIEM10";

  function fmt(n) {
    return "€" + n.toFixed(2).replace(".", ",");
  }

  function catalog() {
    var out = [];
    ["Merinowol", "Outdoor", "Mousseline"].forEach(function (m) {
      ["Babyschaal", "Peuterschaal"].forEach(function (s) {
        out.push({
          id: m + "-" + s,
          materiaal: m,
          schaal: s,
          titel: m + " hoes voor Melia " + s.toLowerCase(),
          prijs: PRIJZEN[m][s],
          prijsTekst: fmt(PRIJZEN[m][s]),
          seizoen: SEIZOENEN[m].join(" · "),
          kleuren: MAT_KLEUREN[m],
          kleurTekst: MAT_KLEUREN[m].length + " kleuren",
          foto: FOTOS[m],
          heeftFoto: !!FOTOS[m],
          briefing: "",
          voorraad: m === "Mousseline" && s === "Peuterschaal" ? "Laatste exemplaren" : "Op voorraad"
        });
      });
    });
    return out;
  }

  function getCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function setCart(cart) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }
  function cartCount(cart) {
    return cart.reduce(function (a, i) { return a + i.qty; }, 0);
  }

  function addToCart(materiaal, schaal, kleur, qty) {
    var prijs = PRIJZEN[materiaal][schaal];
    var key = materiaal + "|" + schaal + "|" + kleur;
    var cart = getCart().map(function (i) { return Object.assign({}, i); });
    var found = cart.filter(function (i) { return i.key === key; })[0];
    if (found) {
      found.qty += qty;
    } else {
      cart.push({
        key: key,
        titel: materiaal + " hoes voor Melia " + schaal.toLowerCase(),
        materiaal: materiaal,
        schaal: schaal,
        kleur: kleur,
        prijs: prijs,
        qty: qty,
        foto: FOTOS[materiaal] || ""
      });
    }
    setCart(cart);
    updateCartCount();
    showToast(materiaal + " hoes · " + kleur + " toegevoegd");
  }

  function changeQty(key, delta) {
    var cart = getCart().map(function (i) { return Object.assign({}, i); });
    cart = cart.map(function (i) {
      if (i.key === key) i.qty = Math.max(1, i.qty + delta);
      return i;
    });
    setCart(cart);
    return cart;
  }

  function removeItem(key) {
    var cart = getCart().filter(function (i) { return i.key !== key; });
    setCart(cart);
    return cart;
  }

  function totals(cart, ship, promoOk) {
    var sub = cart.reduce(function (a, i) { return a + i.prijs * i.qty; }, 0);
    var korting = promoOk ? sub * 0.1 : 0;
    var na = sub - korting;
    var verzend = 0;
    if (ship === "huis") verzend = na >= 100 || na === 0 ? 0 : 4.95;
    if (ship === "pakketpunt") verzend = na >= 100 || na === 0 ? 0 : 3.95;
    var totaal = na + verzend;
    return {
      sub: sub,
      korting: korting,
      verzend: verzend,
      totaal: totaal,
      btw: totaal - totaal / 1.21,
      tekort: Math.max(0, 100 - na)
    };
  }

  function updateCartCount() {
    var el = document.getElementById("cart-count");
    if (el) el.textContent = String(cartCount(getCart()));
  }

  var toastTimer = null;
  function showToast(text) {
    var toast = document.getElementById("toast");
    var toastText = document.getElementById("toast-text");
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 2600);
  }

  function initHeader() {
    var toggle = document.getElementById("shop-toggle");
    var flyout = document.getElementById("shop-flyout");
    var header = document.getElementById("site-header");
    var nav = document.getElementById("site-nav");
    if (!toggle || !flyout) return;

    function open() {
      flyout.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }
    function close() {
      flyout.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    // Hover (en toetsenbordfocus) opent de dropdown; klikken volgt de link naar shop.html.
    toggle.addEventListener("mouseenter", open);
    toggle.addEventListener("focus", open);
    toggle.addEventListener("click", close);

    if (nav) {
      nav.querySelectorAll("a").forEach(function (a) {
        if (a !== toggle) a.addEventListener("mouseenter", close);
      });
    }
    if (header) header.addEventListener("mouseleave", close);
    flyout.addEventListener("mouseleave", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  // ---- shop page: client-side filtering of the static product grid ----
  function initShop() {
    var root = document.getElementById("shop-filters");
    if (!root) return;
    var state = { fSchaal: "Alle", fMateriaal: "Alle", fKleur: "Alle", fSeizoen: "Alle" };
    var params = new URLSearchParams(window.location.search);
    if (params.get("materiaal")) state.fMateriaal = params.get("materiaal");
    if (params.get("schaal")) state.fSchaal = params.get("schaal");

    var cards = Array.prototype.slice.call(document.querySelectorAll("#shop-grid [data-product]"));
    var countEl = document.getElementById("shop-count");

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok =
          (state.fSchaal === "Alle" || card.dataset.schaal === state.fSchaal) &&
          (state.fMateriaal === "Alle" || card.dataset.materiaal === state.fMateriaal) &&
          (state.fKleur === "Alle" || card.dataset.kleuren.split(",").indexOf(state.fKleur) > -1) &&
          (state.fSeizoen === "Alle" || card.dataset.seizoen.split(",").indexOf(state.fSeizoen) > -1);
        card.hidden = !ok;
        if (ok) visible++;
      });
      if (countEl) countEl.textContent = visible + (visible === 1 ? " hoes" : " hoezen");
      root.querySelectorAll("[data-filter]").forEach(function (btn) {
        var field = btn.dataset.filter;
        var val = btn.dataset.value;
        btn.classList.toggle("active", state[field] === val);
      });
    }

    root.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state[btn.dataset.filter] = btn.dataset.value;
        apply();
      });
    });

    apply();
  }

  // ---- product page: variant picker ----
  function initProduct() {
    var root = document.getElementById("product-app");
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var state = {
      pSchaal: params.get("schaal") || "Babyschaal",
      pMateriaal: params.get("materiaal") || "Merinowol",
      pKleur: params.get("kleur") || "",
      pQty: 1
    };
    if (!state.pKleur || MAT_KLEUREN[state.pMateriaal].indexOf(state.pKleur) === -1) {
      state.pKleur = MAT_KLEUREN[state.pMateriaal][0];
    }

    var els = {
      breadcrumb: document.getElementById("p-breadcrumb"),
      eyebrow: document.getElementById("p-eyebrow"),
      title: document.getElementById("p-title"),
      price: document.getElementById("p-price"),
      priceSticky: document.getElementById("p-price-sticky"),
      summarySticky: document.getElementById("p-summary-sticky"),
      compatNote: document.getElementById("p-compat-note"),
      photoWrap: document.getElementById("p-photo"),
      schaalWrap: document.getElementById("p-schaal-opts"),
      materiaalWrap: document.getElementById("p-materiaal-opts"),
      kleurWrap: document.getElementById("p-kleur-opts"),
      kleurNaam: document.getElementById("p-kleur-naam"),
      kleurLabel: document.getElementById("p-kleur-label"),
      qty: document.getElementById("p-qty"),
      addBtn: document.getElementById("p-add"),
      addBtnSticky: document.getElementById("p-add-sticky"),
      voorraadTekst: document.getElementById("p-voorraad"),
      specMateriaal: document.getElementById("spec-materiaal"),
      specSchaal: document.getElementById("spec-schaal"),
      specKleur: document.getElementById("spec-kleur"),
      pasvormTekst: document.getElementById("p-pasvorm-tekst"),
      verpakkingTekst: document.getElementById("p-verpakking-tekst")
    };

    function beschikbaar() {
      return MAT_KLEUREN[state.pMateriaal].indexOf(state.pKleur) > -1 && UITVERKOCHT.indexOf(state.pKleur) === -1;
    }

    function render() {
      var titel = state.pMateriaal + " hoes voor Melia " + state.pSchaal.toLowerCase();
      var prijs = PRIJZEN[state.pMateriaal][state.pSchaal];
      var foto = FOTOS[state.pMateriaal];
      var ok = beschikbaar();

      if (els.title) els.title.textContent = titel;
      if (els.eyebrow) els.eyebrow.textContent = "Studio Kiemt · " + state.pSchaal;
      if (els.breadcrumb) els.breadcrumb.textContent = titel;
      if (els.price) els.price.textContent = fmt(prijs);
      if (els.priceSticky) els.priceSticky.textContent = fmt(prijs) + " incl. btw";
      if (els.summarySticky) els.summarySticky.textContent = state.pMateriaal + " · " + state.pKleur + " · " + state.pSchaal;
      if (els.compatNote) els.compatNote.textContent = "Ontworpen voor een goede pasvorm op de Melia " + state.pSchaal.toLowerCase() + ".";
      if (els.pasvormTekst) els.pasvormTekst.textContent = "Gemaakt naar de vorm van de Melia " + state.pSchaal.toLowerCase() + ". De hoes valt over de schaal en wordt aan de achterzijde vastgezet. De openingen voor de gordel zitten op de plek waar het gordelsysteem van de schaal doorloopt, zodat je de bevestiging van de schaal zelf niet verandert.";
      if (els.specMateriaal) els.specMateriaal.textContent = state.pMateriaal;
      if (els.specSchaal) els.specSchaal.textContent = "Melia " + state.pSchaal.toLowerCase();
      if (els.specKleur) els.specKleur.textContent = state.pKleur;
      if (els.verpakkingTekst) els.verpakkingTekst.textContent = "Eén hoes voor de Melia " + state.pSchaal.toLowerCase() + ", in de gekozen kleur";
      if (els.kleurNaam) els.kleurNaam.textContent = state.pKleur;
      if (els.qty) els.qty.textContent = String(state.pQty);

      if (els.photoWrap) {
        if (foto) {
          els.photoWrap.innerHTML = '<img src="' + foto + '" alt="' + titel + '" style="width: 100%; height: 100%; object-fit: cover; display: block;" />';
          els.photoWrap.classList.remove("ph");
        } else {
          els.photoWrap.classList.remove("ph");
          els.photoWrap.setAttribute("data-briefing", "hoofdfoto 1600×2000 · hoes in de melia schaal, licht van links");
          els.photoWrap.innerHTML = '<img src="assets/sfeer-product-main.jpg" alt="' + titel + '" style="width: 100%; height: 100%; object-fit: cover; display: block;" />';
        }
      }

      if (els.schaalWrap) {
        els.schaalWrap.querySelectorAll("button").forEach(function (btn) {
          btn.classList.toggle("active", btn.dataset.value === state.pSchaal);
        });
      }
      if (els.materiaalWrap) {
        els.materiaalWrap.querySelectorAll("button").forEach(function (btn) {
          btn.classList.toggle("active", btn.dataset.value === state.pMateriaal);
          var priceEl = btn.querySelector("[data-price]");
          if (priceEl) priceEl.textContent = fmt(PRIJZEN[btn.dataset.value][state.pSchaal]);
        });
      }
      if (els.kleurWrap) {
        els.kleurWrap.querySelectorAll("button").forEach(function (btn) {
          var naam = btn.dataset.value;
          var inMat = MAT_KLEUREN[state.pMateriaal].indexOf(naam) > -1;
          var out = UITVERKOCHT.indexOf(naam) > -1;
          btn.style.opacity = !inMat || out ? "0.32" : "1";
          btn.style.boxShadow = naam === state.pKleur ? "0 0 0 2px #34302A" : "0 0 0 1px rgba(52,48,42,0.18)";
        });
      }
      if (els.kleurLabel) {
        var out = UITVERKOCHT.indexOf(state.pKleur) > -1;
        var inMat = MAT_KLEUREN[state.pMateriaal].indexOf(state.pKleur) > -1;
        els.kleurLabel.textContent = !inMat ? "Niet in dit materiaal" : out ? "Uitverkocht" : "";
      }
      if (els.voorraadTekst) {
        els.voorraadTekst.textContent = ok ? "Op voorraad · kleine serie" : "Deze combinatie is nu niet leverbaar";
      }
      if (els.addBtn) {
        els.addBtn.disabled = !ok;
        els.addBtn.textContent = ok ? "In winkelwagen" : "Niet leverbaar";
        els.addBtn.classList.toggle("btn-tan", ok);
        els.addBtn.style.background = ok ? "" : "transparent";
        els.addBtn.style.color = ok ? "" : "#8B7B64";
        els.addBtn.style.border = ok ? "none" : "1px solid rgba(52,48,42,0.22)";
      }
      if (els.addBtnSticky) {
        els.addBtnSticky.disabled = !ok;
        els.addBtnSticky.textContent = ok ? "In winkelwagen" : "Niet leverbaar";
        els.addBtnSticky.hidden = !ok;
      }

      var url = new URL(window.location.href);
      url.searchParams.set("materiaal", state.pMateriaal);
      url.searchParams.set("schaal", state.pSchaal);
      url.searchParams.set("kleur", state.pKleur);
      window.history.replaceState(null, "", url);
    }

    if (els.schaalWrap) {
      els.schaalWrap.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.pSchaal = btn.dataset.value;
          render();
        });
      });
    }
    if (els.materiaalWrap) {
      els.materiaalWrap.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.pMateriaal = btn.dataset.value;
          if (MAT_KLEUREN[state.pMateriaal].indexOf(state.pKleur) === -1) {
            state.pKleur = MAT_KLEUREN[state.pMateriaal][0];
          }
          render();
        });
      });
    }
    if (els.kleurWrap) {
      els.kleurWrap.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.pKleur = btn.dataset.value;
          render();
        });
      });
    }
    var qtyMin = document.getElementById("p-qty-min");
    var qtyPlus = document.getElementById("p-qty-plus");
    if (qtyMin) qtyMin.addEventListener("click", function () { state.pQty = Math.max(1, state.pQty - 1); render(); });
    if (qtyPlus) qtyPlus.addEventListener("click", function () { state.pQty += 1; render(); });
    [els.addBtn, els.addBtnSticky].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener("click", function () {
        if (!beschikbaar()) return;
        addToCart(state.pMateriaal, state.pSchaal, state.pKleur, state.pQty);
      });
    });

    render();
  }

  // ---- cart page ----
  function initCart() {
    var root = document.getElementById("cart-app");
    if (!root) return;
    var emptyEl = document.getElementById("cart-empty");
    var filledEl = document.getElementById("cart-filled");
    var listEl = document.getElementById("cart-items");
    var subEl = document.getElementById("cart-sub");
    var kortingRow = document.getElementById("cart-korting-row");
    var kortingEl = document.getElementById("cart-korting");
    var verzendEl = document.getElementById("cart-verzend");
    var bijnaEl = document.getElementById("cart-bijna");
    var tekortEl = document.getElementById("cart-tekort");
    var totaalEl = document.getElementById("cart-totaal");
    var btwEl = document.getElementById("cart-btw");

    function itemRow(i) {
      var row = document.createElement("div");
      row.style.cssText = "display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 18px; border-top: 1px solid rgba(52,48,42,0.16); padding: 20px 0;";
      var photoHtml = i.foto
        ? '<div style="aspect-ratio: 4 / 5; overflow: hidden; background: #E5DED0;"><img src="' + i.foto + '" alt="' + i.titel + '" style="width: 100%; height: 100%; object-fit: cover; display: block;" /></div>'
        : "<div></div>";
      row.innerHTML =
        photoHtml +
        '<div style="display: flex; flex-direction: column; gap: 10px;">' +
        '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;">' +
        '<span class="serif" style="font-size: 19px; line-height: 1.3;">' + i.titel + "</span>" +
        '<span style="font-size: 14px;">' + fmt(i.prijs * i.qty) + "</span>" +
        "</div>" +
        '<span style="font-size: 12.5px; color: #7E6E58;">' + i.kleur + " · " + fmt(i.prijs) + " per stuk</span>" +
        '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 2px;">' +
        '<div style="display: flex; align-items: center; border: 1px solid rgba(52,48,42,0.22);">' +
        '<button type="button" data-min style="background: transparent; border: none; padding: 8px 13px;">−</button>' +
        '<span style="padding: 0 4px; font-size: 13.5px; min-width: 20px; text-align: center;">' + i.qty + "</span>" +
        '<button type="button" data-plus style="background: transparent; border: none; padding: 8px 13px;">+</button>' +
        "</div>" +
        '<button type="button" data-remove style="background: transparent; border: none; padding: 0; font-size: 12px; color: #8B7B64; border-bottom: 1px solid rgba(52,48,42,0.25);">Verwijderen</button>' +
        "</div></div>";
      row.querySelector("[data-min]").addEventListener("click", function () { changeQty(i.key, -1); renderCart(); });
      row.querySelector("[data-plus]").addEventListener("click", function () { changeQty(i.key, 1); renderCart(); });
      row.querySelector("[data-remove]").addEventListener("click", function () { removeItem(i.key); renderCart(); });
      return row;
    }

    function renderCart() {
      var cart = getCart();
      updateCartCount();
      if (cart.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        if (filledEl) filledEl.hidden = true;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;
      if (filledEl) filledEl.hidden = false;
      if (listEl) {
        listEl.innerHTML = "";
        cart.forEach(function (i) { listEl.appendChild(itemRow(i)); });
      }
      var t = totals(cart, "huis", false);
      if (subEl) subEl.textContent = fmt(t.sub);
      if (kortingRow) kortingRow.hidden = true;
      if (verzendEl) verzendEl.textContent = t.verzend === 0 ? "Gratis" : fmt(t.verzend);
      if (bijnaEl) bijnaEl.hidden = !(t.tekort > 0 && t.sub > 0);
      if (tekortEl) tekortEl.textContent = fmt(t.tekort);
      if (totaalEl) totaalEl.textContent = fmt(t.totaal);
      if (btwEl) btwEl.textContent = fmt(t.btw);
    }

    renderCart();
  }

  // ---- checkout page ----
  function initCheckout() {
    var root = document.getElementById("checkout-app");
    if (!root) return;
    var cart = getCart();
    if (cart.length === 0) {
      window.location.href = "winkelwagen.html";
      return;
    }
    var state = { ship: "huis", pay: "ideal", promo: "", promoOk: false, promoMsg: "", notes: "", news: true };

    var itemsEl = document.getElementById("co-items");
    var subEl = document.getElementById("co-sub");
    var kortingRow = document.getElementById("co-korting-row");
    var kortingEl = document.getElementById("co-korting");
    var verzendEl = document.getElementById("co-verzend");
    var totaalEl = document.getElementById("co-totaal");
    var btwEl = document.getElementById("co-btw");
    var shipWrap = document.getElementById("co-ship");
    var payWrap = document.getElementById("co-pay");
    var promoInput = document.getElementById("co-promo-input");
    var promoBtn = document.getElementById("co-promo-btn");
    var promoMsgEl = document.getElementById("co-promo-msg");
    var newsBtn = document.getElementById("co-news");
    var newsMark = document.getElementById("co-news-mark");
    var notesInput = document.getElementById("co-notes");
    var placeBtn = document.getElementById("co-place");

    var SHIP_OPTS = [
      { id: "huis", label: "Verzending naar huis", sub: "PostNL, 1–3 werkdagen" },
      { id: "pakketpunt", label: "Naar een pakketpunt", sub: "Ophalen bij een punt in de buurt" },
      { id: "afhalen", label: "Afhalen in Hooglanderveen", sub: "Op afspraak, meestal binnen een dag klaar" }
    ];
    var PAY_OPTS = [
      { id: "ideal", label: "iDEAL" },
      { id: "creditcard", label: "Creditcard" },
      { id: "bancontact", label: "Bancontact" }
    ];

    function render() {
      var t = totals(cart, state.ship, state.promoOk);

      if (itemsEl) {
        itemsEl.innerHTML = "";
        cart.forEach(function (i) {
          var row = document.createElement("div");
          row.style.cssText = "display: flex; justify-content: space-between; gap: 14px; border-bottom: 1px solid rgba(52,48,42,0.1); padding-bottom: 12px;";
          row.innerHTML =
            '<span style="display: flex; flex-direction: column; gap: 3px;">' +
            '<span style="font-size: 13.5px; line-height: 1.4;">' + i.titel + "</span>" +
            '<span style="font-size: 12px; color: #7E6E58;">' + i.kleur + " · " + i.qty + " stuk</span>" +
            "</span>" +
            '<span style="font-size: 13.5px; white-space: nowrap;">' + fmt(i.prijs * i.qty) + "</span>";
          itemsEl.appendChild(row);
        });
      }

      if (subEl) subEl.textContent = fmt(t.sub);
      if (kortingRow) kortingRow.hidden = !(t.korting > 0);
      if (kortingEl) kortingEl.textContent = "− " + fmt(t.korting);
      if (verzendEl) verzendEl.textContent = t.verzend === 0 ? "Gratis" : fmt(t.verzend);
      if (totaalEl) totaalEl.textContent = fmt(t.totaal);
      if (btwEl) btwEl.textContent = fmt(t.btw);
      if (promoMsgEl) {
        promoMsgEl.hidden = !state.promoMsg;
        promoMsgEl.textContent = state.promoMsg;
      }
      if (newsMark) newsMark.textContent = state.news ? "✓" : "";

      if (shipWrap) {
        shipWrap.querySelectorAll("[data-ship]").forEach(function (btn) {
          var id = btn.dataset.ship;
          var active = state.ship === id;
          btn.style.border = active ? "1.5px solid #34302A" : "1px solid rgba(52,48,42,0.18)";
          var priceEl = btn.querySelector("[data-ship-price]");
          if (priceEl) {
            var na = t.sub - t.korting;
            if (id === "huis") priceEl.textContent = na >= 100 || na === 0 ? "Gratis" : "€4,95";
            if (id === "pakketpunt") priceEl.textContent = na >= 100 || na === 0 ? "Gratis" : "€3,95";
            if (id === "afhalen") priceEl.textContent = "Gratis";
          }
        });
      }
      if (payWrap) {
        payWrap.querySelectorAll("[data-pay]").forEach(function (btn) {
          var active = state.pay === btn.dataset.pay;
          btn.style.border = active ? "1.5px solid #34302A" : "1px solid rgba(52,48,42,0.18)";
        });
      }
    }

    if (shipWrap) {
      shipWrap.querySelectorAll("[data-ship]").forEach(function (btn) {
        btn.addEventListener("click", function () { state.ship = btn.dataset.ship; render(); });
      });
    }
    if (payWrap) {
      payWrap.querySelectorAll("[data-pay]").forEach(function (btn) {
        btn.addEventListener("click", function () { state.pay = btn.dataset.pay; render(); });
      });
    }
    if (promoBtn) {
      promoBtn.addEventListener("click", function () {
        var code = KORTINGSCODE;
        var ok = (promoInput.value || "").trim().toUpperCase() === code;
        state.promoOk = ok;
        state.promoMsg = ok ? "Kortingscode toegepast: 10% korting" : "Deze code kennen we niet";
        render();
      });
    }
    if (newsBtn) {
      newsBtn.addEventListener("click", function () { state.news = !state.news; render(); });
    }
    if (notesInput) {
      notesInput.addEventListener("change", function () { state.notes = notesInput.value; });
    }
    if (placeBtn) {
      placeBtn.addEventListener("click", function () {
        var nr = "SK-" + String(1000 + Math.floor(Math.random() * 8999));
        setCart([]);
        updateCartCount();
        window.location.href = "bedankt.html?order=" + encodeURIComponent(nr);
      });
    }

    render();
  }

  function initBedankt() {
    var el = document.getElementById("order-nr");
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    el.textContent = params.get("order") || "SK-0000";
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    updateCartCount();
    initShop();
    initProduct();
    initCart();
    initCheckout();
    initBedankt();
  });

  window.StudioKiem = {
    KLEUREN: KLEUREN, MAT_KLEUREN: MAT_KLEUREN, UITVERKOCHT: UITVERKOCHT,
    PRIJZEN: PRIJZEN, SEIZOENEN: SEIZOENEN, FOTOS: FOTOS,
    catalog: catalog, fmt: fmt
  };
})();
