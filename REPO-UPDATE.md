# Repo-update — Studio Kiemt

Plak deze bestanden over de huidige dev branch van dcdataconsultancy/studiokiem.
Alles staat al op de juiste plek: root, `src/`, `css/`, `js/`, `scripts/`, `assets/`.

## Wat er is gewijzigd

**1. Hovermenu in de header**
- `src/partials/header.html`: de Shop-trigger is een `<a href="shop.html">` geworden in plaats van een `<button>`. Klikken gaat nu naar de shop-hoofdpagina.
- `js/site.js` → `initHeader()`: de dropdown opent op `mouseenter` en op toetsenbordfocus, en sluit bij een ander menu-item, bij het verlaten van de header, en op Escape.
- Op touch is er geen hover: daar volgt een tik gewoon de link naar shop.html.

**2. Sfeerbeelden in plaats van placeholders**
- 19 `.ph` blokken in `src/pages/*.html` zijn vervangen door echte `<img>` elementen.
- De oorspronkelijke fotobriefing staat bewaard als `data-briefing` op het beeldkader, zodat de shotlist niet verloren gaat.
- 18 nieuwe bestanden in `assets/` (`sfeer-*.jpg`). Let op: dit zijn géén echte productfoto's. Ze zijn afgeleid van de bestaande stoffoto's (uitsnede + kleurgradatie per colorway, lichtval, vignette, korrel) en geven materiaal-, kleur- en lichtsfeer — niet de letterlijke scène. Vervang ze zodra er echte fotografie is.
- `js/site.js`: `FOTOS.Outdoor` wijst nu naar `assets/sfeer-outdoor.jpg`, de `briefing`-fallback in de catalogus is leeg.

**3. Merknaam en logo**
- Overal "Studio Kiem" → "Studio Kiemt", inclusief `studiokiemt.nl` en `@studiokiemt` (domein nog te bevestigen).
- Logo toegevoegd in header (`assets/logo-mark.png`, 54px) en footer (`assets/logo-mark-light.png`, 172px).
- `assets/logo-kiem.png` is het losse kiemplantje, bedoeld voor favicon-formaat.
- De logo-illustratie zelf moet nog opnieuw getekend worden (bij voorkeur SVG); de bestaande lockup draagt nog de oude naam.

## Bouwen

De root-level `*.html` bestanden in deze map zijn al gegenereerd, dus je kunt direct plakken en openen.
Na eigen wijzigingen onder `src/`:

    python3 scripts/build.py
