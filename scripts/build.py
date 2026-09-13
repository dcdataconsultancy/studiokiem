#!/usr/bin/env python3
"""Assembles the static Studio Kiemt site from src/partials + src/pages.

Usage: python3 scripts/build.py

Each output page = doctype/head (with per-page title+description) + header
partial + page fragment + footer partial + shared scripts. Run this again
after editing anything under src/ to regenerate the root-level *.html files.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

with open(os.path.join(SRC, "partials", "header.html"), encoding="utf-8") as f:
    HEADER = f.read()
with open(os.path.join(SRC, "partials", "footer.html"), encoding="utf-8") as f:
    FOOTER = f.read()

# (output filename, page fragment filename, <title>, meta description)
PAGES = [
    ("index.html", "index.html",
     "Studio Kiemt — Stijlvolle hoezen voor bakfietsschalen",
     "Studio Kiemt maakt hoogwaardige hoezen voor Melia baby- en peuterschalen in merinowol, outdoorstof en mousseline."),
    ("shop.html", "shop.html",
     "Alle hoezen — Studio Kiemt",
     "Alle hoezen van Studio Kiemt voor de Melia babyschaal en peuterschaal. Filter op schaal, materiaal, seizoen of kleur."),
    ("product.html", "product.html",
     "Hoes voor Melia schaal — Studio Kiemt",
     "Een zachtere, stijlvollere vervanging van de standaard bekleding van je Melia baby- of peuterschaal."),
    ("compatibiliteit.html", "compatibiliteit.html",
     "Compatibiliteit — Studio Kiemt",
     "Past deze hoes op jouw schaal? Bekijk de Melia babyschaal en peuterschaal waarvan we de pasvorm hebben gecontroleerd."),
    ("compatibiliteit-babyschaal.html", "compatibiliteit-babyschaal.html",
     "Melia babyschaal — Compatibiliteit — Studio Kiemt",
     "Hoezen voor de Melia babyschaal: pasvorm, plaatsing en de gordelopening uitgelegd."),
    ("compatibiliteit-peuterschaal.html", "compatibiliteit-peuterschaal.html",
     "Melia peuterschaal — Compatibiliteit — Studio Kiemt",
     "Hoezen voor de Melia peuterschaal: pasvorm, plaatsing en de gordelopening uitgelegd."),
    ("babyschaal-hoezen.html", "babyschaal-hoezen.html",
     "Babyschaal hoezen voor de bakfiets — Studio Kiemt",
     "Babyschaal hoezen voor de Melia babyschaal in merinowol, outdoorstof en mousseline. Zacht, warm en gemaakt voor dagelijks gebruik."),
    ("over-ons.html", "over-ons.html",
     "Over Studio Kiemt",
     "Studio Kiemt maakt één product tot in detail doordacht: hoezen voor bakfietsschalen."),
    ("onderhoud.html", "onderhoud.html",
     "Onderhoud — Studio Kiemt",
     "Wasinstructies per materiaal: merinowol, outdoorstof en mousseline."),
    ("reparatieservice.html", "reparatieservice.html",
     "Reparatieservice — Studio Kiemt",
     "Laat een naad los? Stuur je hoes op voor reparatie, vanaf €15."),
    ("faq.html", "faq.html",
     "Veelgestelde vragen — Studio Kiemt",
     "Antwoorden over schalen, materialen, wassen en onze service."),
    ("kennisbank.html", "kennisbank.html",
     "Kennisbank — Studio Kiemt",
     "Alles over bakfietsschalen, materialen en comfort."),
    ("kennisbank-merinowol-zomer.html", "kennisbank-merinowol-zomer.html",
     "Merinowol in de zomer: wordt het niet te warm? — Studio Kiemt",
     "Waarom wol niet hetzelfde is als warmte, en wanneer je toch beter voor mousseline kiest."),
    ("winkelwagen.html", "winkelwagen.html",
     "Winkelwagen — Studio Kiemt",
     "Bekijk en pas je winkelwagen aan."),
    ("afrekenen.html", "afrekenen.html",
     "Afrekenen — Studio Kiemt",
     "Rond je bestelling af."),
    ("bedankt.html", "bedankt.html",
     "Bestelling ontvangen — Studio Kiemt",
     "Je bestelling is bij ons binnen."),
]

HEAD_TMPL = """<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content="{description}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Work+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
"""

FOOT_TMPL = """
<script src="js/site.js" defer></script>
</body>
</html>
"""


def main():
    for out_name, page_name, title, description in PAGES:
        with open(os.path.join(SRC, "pages", page_name), encoding="utf-8") as f:
            content = f.read()
        html = (
            HEAD_TMPL.format(title=title, description=description)
            + HEADER
            + content
            + FOOTER
            + FOOT_TMPL
        )
        out_path = os.path.join(ROOT, out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("wrote", out_name)


if __name__ == "__main__":
    main()
