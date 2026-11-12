/**
 * app.js — presentazione dell'app: telefono che ruota con lo scroll,
 * notifiche che compaiono a turno, rider che avanza, punti fedeltà.
 */
import { $, $$, env } from './utils.js';

export function initApp() {
    const root = $('.app');
    if (!root || env.reduced) return;

    const phone = $('[data-phone]', root);
    const notifs = $$('[data-notif]', root);
    const fill = $('[data-route-fill]', root);
    const rider = $('[data-route-rider]', root);
    const points = $('[data-points]', root);
    const route = $('.phone__route', root);

    // Il telefono entra inclinato e si raddrizza scorrendo.
    gsap.set(phone, { transformPerspective: 1400 });
    gsap.fromTo(phone, { rotationY: -32, rotationX: 10, y: 120 }, {
        rotationY: 10, rotationX: -2, y: -40, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
    gsap.fromTo('.app__disc', { scale: 0.7 }, { scale: 1.1, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 } });

    // Sequenza: schermata → rider → punti → notifiche.
    const state = { p: 0 };
    const tl = gsap.timeline({ scrollTrigger: { trigger: phone, start: 'top 70%', once: true }, defaults: { ease: 'expo.out' } });
    tl.from($$('.phone__screen > *', root), { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.09 })
        .to(fill, { scaleX: 0.66, duration: 2.2, ease: 'power2.inOut' }, 0.5)
        .to(rider, { x: () => (route.offsetWidth - 12) * 0.66, duration: 2.2, ease: 'power2.inOut' }, 0.5)
        .to(state, { p: 82, duration: 2, ease: 'power2.out', onUpdate: () => { points.textContent = Math.round(state.p); } }, 0.6)
        .from($$('.phone__stamps i.is-on', root), { scale: 0, duration: 0.5, ease: 'back.out(3)', stagger: 0.07 }, 0.7)
        .from(notifs, { scale: 0.4, autoAlpha: 0, x: (i) => (i % 2 ? 80 : -80), duration: 1, ease: 'elastic.out(1, 0.6)', stagger: 0.35 }, 0.9);

    // Le notifiche galleggiano e il rider "vibra" mentre guida.
    notifs.forEach((n, i) => gsap.to(n, { y: i % 2 ? 12 : -12, duration: 2.6 + i * 0.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 + i * 0.3 }));
    gsap.to($('.icon', rider), { y: -2, rotation: -6, duration: 0.25, ease: 'sine.inOut', repeat: -1, yoyo: true });
}
