/**
 * cursor.js — cursore personalizzato: punto + anello che reagisce agli
 * elementi interattivi e mostra un'etichetta ([data-cursor="Testo"]).
 * Attivo solo con mouse/trackpad.
 */
import { $, env } from './utils.js';

export function initCursor() {
    const root = $('.cursor');
    if (!root || !env.fine || env.reduced) return;

    const dot = $('.cursor__dot', root);
    const ring = $('.cursor__ring', root);
    const label = $('.cursor__label', root);
    document.documentElement.classList.add('has-cursor');
    root.classList.add('is-hidden');

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    let first = true;
    window.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        if (first) { gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); first = false; }
        root.classList.remove('is-hidden');
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });

    // Stato in base all'elemento sotto il puntatore (delegation).
    const INTERACTIVE = 'a, button, [role="button"], [role="tab"], label, select, summary, .swiper-pagination-bullet';
    document.addEventListener('pointerover', (e) => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;
        // L'etichetta vince, a meno che dentro l'area etichettata ci sia un controllo più specifico.
        const labelled = target.closest('[data-cursor]');
        const interactive = target.closest(INTERACTIVE);
        const nested = interactive && labelled && labelled !== interactive && labelled.contains(interactive);
        if (labelled && !nested) {
            label.textContent = labelled.dataset.cursor;
            root.classList.add('is-label');
            root.classList.remove('is-link');
        } else {
            root.classList.remove('is-label');
            root.classList.toggle('is-link', Boolean(interactive));
        }
    }, { passive: true });

    window.addEventListener('pointerdown', () => root.classList.add('is-down'), { passive: true });
    window.addEventListener('pointerup', () => root.classList.remove('is-down'), { passive: true });
    document.addEventListener('mouseleave', () => root.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => root.classList.remove('is-hidden'));
}
