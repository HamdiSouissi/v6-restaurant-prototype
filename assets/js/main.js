/**
 * SORRISO — main.js
 * Punto d'ingresso: registra i plugin e avvia i moduli nell'ordine corretto.
 *
 *   core      → scroll fluido, header, cursore, micro‑interazioni
 *   scene     → animazioni legate allo scroll (una per sezione)
 *   funzioni  → carrello, prenotazione, galleria… (tutto simulato)
 */
import { env } from './modules/utils.js';
import { initScroll, refreshScroll } from './modules/scroll.js';
import { initHeader } from './modules/header.js';
import { initCursor } from './modules/cursor.js';
import { initInteractions } from './modules/interactions.js';
import { runPreloader } from './modules/preloader.js';
import { initHero, playHeroIntro } from './modules/hero.js';
import { initReveals } from './modules/reveal.js';
import { initBestSellers } from './modules/bestsellers.js';
import { initMenu } from './modules/menu.js';
import { initPromo } from './modules/promo.js';
import { initCart } from './modules/cart.js';
import { initGallery } from './modules/gallery.js';
import { initBooking, initNewsletter } from './modules/forms.js';
import { initApp } from './modules/app.js';
import { initReviews } from './modules/reviews.js';
import { initFaq } from './modules/faq.js';
import { initContact } from './modules/contact.js';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'expo.out', duration: 1 });
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

/** Esegue un modulo isolando gli errori: una scena rotta non blocca le altre. */
const safe = (name, fn) => {
    try { return fn(); } catch (err) { console.error(`[sorriso] ${name}`, err); return undefined; }
};

function boot() {
    document.documentElement.classList.toggle('is-reduced', env.reduced);

    // Core
    safe('scroll', initScroll);
    safe('header', initHeader);
    safe('cursor', initCursor);

    // Scene (l'ordine conta: i pin devono essere creati dall'alto verso il basso)
    safe('hero', initHero);
    safe('bestsellers', initBestSellers);   // pin orizzontale: va creato prima dei trigger che lo seguono
    safe('reveals', initReveals);
    safe('menu', initMenu);
    safe('promo', initPromo);
    safe('gallery', initGallery);
    safe('app', initApp);
    safe('reviews', initReviews);
    safe('faq', initFaq);
    safe('contact', initContact);

    // Funzioni simulate
    safe('cart', initCart);
    safe('booking', initBooking);
    safe('newsletter', initNewsletter);
    safe('interactions', initInteractions);

    // Sipario → intro cinematografica
    runPreloader().then(() => safe('hero intro', playHeroIntro));

    // Le immagini lazy cambiano l'altezza della pagina: ricalcola i trigger.
    window.addEventListener('load', refreshScroll, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshScroll);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
