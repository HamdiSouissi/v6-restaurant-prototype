# Sorriso — Motion Collection · Fast Food Italien Premium

Démo commerciale one-page pour fast-foods italiens premium (Parme).
Tous les textes du site sont en italien ; la marque, l'adresse, le téléphone et l'e-mail sont fictifs
et se changent en une fois dans le tableau `$brand` en haut de `index.php`.

## Lancer le site

```bash
php -S localhost:8000
# puis ouvrir http://localhost:8000
```

Aucune base de données, aucun back-office, aucune dépendance à installer :
le projet se limite à `index.php` et au dossier `assets/`. Les librairies et les polices sont
hébergées localement (aucun CDN, le site fonctionne hors ligne).

## Stack

- PHP natif (données + helpers + markup dans `index.php`), HTML5, CSS3, JavaScript vanilla (modules ES)
- GSAP 3 + ScrollTrigger (toutes les animations), Lenis (scroll fluide), SwiperJS (galerie, avis), SplitType (titres)
- Icônes Remix Icon (sprite SVG), polices Poppins / Outfit / Manrope

## Structure

```
index.php                 configuration, données (menu, avis, FAQ…), helpers PHP et les 13 scènes
assets/
  css/base.css            polices, tokens (palette, rayons, ombres), reset, typographie, curseur, preloader
  css/components.css      logo, boutons, header, formulaires, panier, modale, lightbox, toasts
  css/sections.css        les scènes et tout le responsive
  js/main.js              point d'entrée : ordre de démarrage des modules
  js/modules/             un module par rôle (scroll, hero, bestsellers, menu, cart, forms, gallery…)
  img/products/           détourés WebP (160 / 320 / 640 / 1280 px)
  img/gallery/            affiches de la galerie (800 / 1400 px)
  img/icons.svg           sprite d'icônes — img/decor.svg : stickers décoratifs
  fonts/, vendor/         polices woff2 et librairies
```

## Ce qui est simulé

| Fonction | Comportement |
|---|---|
| Panier | ajout, quantités, suppression, livraison / à emporter, sous-total, frais, total, code promo `CIAO30` ; conservé pendant la session (`sessionStorage`) |
| Checkout | validation du formulaire, confirmation avec numéro de commande et suivi — aucun paiement |
| Réservation | validation des champs puis popup « La tua richiesta è stata ricevuta. » — rien n'est envoyé |
| Newsletter, compte à rebours, app mobile, QR code, carte | entièrement fictifs |

## Personnaliser pour un client

1. `$brand` : nom, baseline, adresse, téléphone, e-mail, réseaux sociaux, code promo (`promo`) et frais / seuil de livraison gratuite (`delivery`).
2. `$categories`, `$products` : la carte, les prix et les badges ; `$quickPicks` : les produits de la section « Ordina Online ».
3. `$gallery`, `$reviews`, `$faq`, `$hours` : galerie, avis, questions fréquentes, horaires.
4. Couleurs et typographies : variables CSS au début de `assets/css/base.css`.

Les animations respectent `prefers-reduced-motion` et sont allégées sur mobile
(pas de curseur personnalisé, pas de pin horizontal, parallaxe réduite).
