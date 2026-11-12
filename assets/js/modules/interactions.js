/**
 * interactions.js — micro‑interazioni riutilizzabili:
 *   [data-magnetic]  pulsanti magnetici con ritorno elastico
 *   [data-tilt]      card 3D che seguono il mouse (ombra dinamica + riflesso)
 *   [data-glow]      alone luminoso che segue il puntatore
 *   [data-float]     decorazioni con parallasse sullo scroll
 */
import { $$, env, rand } from './utils.js';

export function initInteractions() {
    initFloat();
    if (!env.fine || env.reduced) return;
    initMagnetic();
    initTilt();
    initGlow();
}

/* Pulsanti magnetici ------------------------------------------------------ */
function initMagnetic() {
    $$('[data-magnetic]').forEach((el) => {
        const strength = el.classList.contains('round-btn') || el.matches('.footer__social a, .newsletter button') ? 0.45 : 0.28;
        const inner = el.querySelector('.btn__label, .icon');
        const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            xTo(dx * strength); yTo(dy * strength);
            if (inner) gsap.to(inner, { x: dx * strength * 0.4, y: dy * strength * 0.4, duration: 0.4, ease: 'power3', overwrite: 'auto' });
        });
        el.addEventListener('pointerleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
            if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
        });
    });
}

/* Card con profondità ------------------------------------------------------ */
function initTilt() {
    $$('[data-tilt]').forEach((el) => {
        const max = 9;
        gsap.set(el, { transformPerspective: 900 });
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });

        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            ry((px - 0.5) * max * 2);
            rx((0.5 - py) * max * 2);
            el.style.setProperty('--mx', `${px * 100}%`);
            el.style.setProperty('--my', `${py * 100}%`);
            // L'ombra si sposta in direzione opposta alla luce.
            el.style.boxShadow = `${(0.5 - px) * 36}px ${28 + (0.5 - py) * 30}px 50px -22px rgba(29,29,29,.3)`;
        });
        el.addEventListener('pointerleave', () => {
            gsap.to(el, { rotationX: 0, rotationY: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
            el.style.boxShadow = '';
        });
    });
}

/* Alone luminoso ----------------------------------------------------------- */
function initGlow() {
    $$('[data-glow]').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', `${e.clientX - r.left}px`);
            el.style.setProperty('--my', `${e.clientY - r.top}px`);
        }, { passive: true });
    });
}

/* Decorazioni flottanti ------------------------------------------------------ */
function initFloat() {
    if (env.reduced) return;
    $$('[data-float]').forEach((el, i) => {
        gsap.to(el, {
            y: () => -window.innerHeight * rand(0.18, 0.4),
            rotation: `+=${i % 2 ? -70 : 80}`,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        });
    });
}
