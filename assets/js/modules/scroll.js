/**
 * scroll.js — smooth scroll (Lenis) sincronizzato con ScrollTrigger,
 * ancore animate, barra di avanzamento, blocco dello scroll per i pannelli.
 */
import { $, env } from './utils.js';
import { toast } from './toast.js';

let lenis = null;
let locks = 0;

export function initScroll() {
    if (!env.reduced && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.6,
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // Ancore interne: scorrimento morbido con compensazione dell'header.
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        if (link.hasAttribute('data-demo-link')) {
            event.preventDefault();
            toast({ text: 'Link dimostrativo: qui andrà la tua pagina.', icon: 'information-line' });
            return;
        }
        const id = link.getAttribute('href');
        const target = id.length > 1 ? $(id) : null;
        if (!target) return;
        event.preventDefault();
        scrollToTarget(target);
        history.replaceState(null, '', id);
    });

    // Barra di avanzamento.
    gsap.to('.progress__bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

/** Scorre fino a un elemento (o a una posizione in px). */
export function scrollToTarget(target, options = {}) {
    const offset = target.id === 'home' || target.id === 'bestseller' ? 0 : -70;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4, ...options });
    else {
        const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: env.reduced ? 'auto' : 'smooth' });
    }
}

/** Blocca / sblocca lo scroll della pagina (drawer, modali, menu mobile). */
export function lockScroll(on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    const locked = locks > 0;
    if (lenis) locked ? lenis.stop() : lenis.start();
    document.documentElement.classList.toggle('is-locked', locked);
}

export const refreshScroll = () => ScrollTrigger.refresh();
