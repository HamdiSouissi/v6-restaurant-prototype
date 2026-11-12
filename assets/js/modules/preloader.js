/**
 * preloader.js — sipario d'apertura.
 * Il contatore segue il caricamento reale di font e immagine hero,
 * con una durata minima per lasciare il tempo all'animazione.
 */
import { $, $$, env } from './utils.js';
import { lockScroll } from './scroll.js';

const MIN_TIME = 1500;  // ms
const MAX_TIME = 5000;  // oltre questo tempo si parte comunque

export function runPreloader() {
    const root = $('#preloader');
    if (!root) return Promise.resolve();

    const count = $('[data-preload-count]', root);
    const words = $$('.preloader__words span', root);
    const heroImg = $('.hero__pizza');
    const state = { value: 0 };

    window.scrollTo(0, 0);
    lockScroll(true);

    const imageReady = heroImg && !heroImg.complete
        ? new Promise((res) => { heroImg.addEventListener('load', res, { once: true }); heroImg.addEventListener('error', res, { once: true }); })
        : Promise.resolve();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const minTime = new Promise((res) => setTimeout(res, env.reduced ? 200 : MIN_TIME));
    const timeout = new Promise((res) => setTimeout(res, MAX_TIME));
    const ready = Promise.race([Promise.all([imageReady, fontsReady, minTime]), timeout]);

    // Avanzamento "ottimistico" fino all'88%, poi si completa quando tutto è pronto.
    const progress = gsap.to(state, {
        value: 88, duration: MIN_TIME / 1000, ease: 'power2.out',
        onUpdate: () => { count.textContent = Math.round(state.value); },
    });
    gsap.to(words, { yPercent: -100 * (words.length - 1), duration: MIN_TIME / 1000, ease: `steps(${words.length - 1})` });
    gsap.from('.preloader__logo', { scale: 0.6, autoAlpha: 0, duration: 1, ease: 'elastic.out(1, 0.6)' });
    gsap.to('.preloader .logo__mark', { rotation: 360, duration: 1.4, ease: 'expo.inOut' });

    return ready.then(() => new Promise((resolve) => {
        progress.kill();
        gsap.timeline({ defaults: { ease: 'expo.inOut' } })
            .to(state, { value: 100, duration: 0.35, ease: 'power2.out', onUpdate: () => { count.textContent = Math.round(state.value); } })
            .to('.preloader__logo, .preloader__words, .preloader__count', { y: -60, autoAlpha: 0, duration: 0.5, stagger: 0.04, ease: 'power3.in' }, '+=0.1')
            .to('.preloader__layer--front', { yPercent: -100, duration: 0.95 }, '-=0.15')
            .to('.preloader__layer--back', { yPercent: -100, duration: 0.95 }, '-=0.8')
            .add(() => { lockScroll(false); resolve(); }, '-=0.75')
            .set(root, { display: 'none' });
    }));
}
