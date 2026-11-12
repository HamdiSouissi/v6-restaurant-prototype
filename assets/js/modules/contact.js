/**
 * contact.js — mappa stilizzata: il segnaposto cade e rimbalza,
 * il rider percorre il tragitto di consegna in loop.
 */
import { $, $$, env } from './utils.js';

export function initContact() {
    const map = $('[data-map]');
    if (!map || env.reduced) return;

    const pin = $('[data-pin]', map);
    const route = $('[data-route]', map);
    const dot = $('[data-route-dot]', map);

    gsap.timeline({ scrollTrigger: { trigger: map, start: 'top 70%', once: true } })
        .from($('.map__pin-head', pin), { y: -320, autoAlpha: 0, duration: 1.1, ease: 'bounce.out' }, 0.3)
        .from($$('.map__pulse', pin), { autoAlpha: 0, duration: 0.4 }, 1.2)
        .from('.map__card', { y: 40, autoAlpha: 0, scale: 0.9, duration: 0.9, ease: 'back.out(1.6)' }, 0.9)
        .from('.map__compass', { scale: 0, duration: 0.7, ease: 'back.out(2)' }, 1);

    // Il rider segue il tracciato SVG (nessun plugin: getPointAtLength).
    if (route && dot && route.getTotalLength) {
        const length = route.getTotalLength();
        const state = { p: 0 };
        const place = () => {
            const pt = route.getPointAtLength(state.p * length);
            dot.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        };
        place();
        const ride = gsap.to(state, { p: 1, duration: 5.5, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.2, onUpdate: place, paused: true });
        ScrollTrigger.create({ trigger: map, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? ride.play() : ride.pause()) });
    }
}
