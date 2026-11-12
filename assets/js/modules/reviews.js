/**
 * reviews.js — carosello delle recensioni (Swiper) con autoplay gentile.
 */
import { $, $$, env } from './utils.js';

export function initReviews() {
    const root = $('.reviews');
    if (!root || typeof Swiper === 'undefined') return;

    new Swiper($('.reviews__swiper', root), {
        slidesPerView: 'auto',
        spaceBetween: 16,
        speed: 900,
        rewind: true,
        grabCursor: !env.fine,
        autoplay: env.reduced ? false : { delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: $('.reviews__pagination', root), clickable: true },
        keyboard: { enabled: true, onlyInViewport: true },
        breakpoints: { 900: { spaceBetween: 24 } },
    });

    if (env.reduced) return;
    gsap.from($$('.review', root), {
        y: 100, rotation: (i) => (i % 2 ? 5 : -5), autoAlpha: 0, duration: 1.2, ease: 'back.out(1.4)', stagger: 0.1,
        scrollTrigger: { trigger: '.reviews__swiper', start: 'top 88%', once: true },
    });
    // Il voto medio conta fino a 4,9.
    const score = $('.reviews__score strong', root);
    const state = { v: 0 };
    gsap.to(state, {
        v: 4.9, duration: 1.6, ease: 'power3.out',
        onUpdate: () => { score.textContent = state.v.toFixed(1).replace('.', ','); },
        scrollTrigger: { trigger: score, start: 'top 92%', once: true },
    });
}
