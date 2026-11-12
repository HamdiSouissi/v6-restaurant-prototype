/**
 * modal.js — apertura/chiusura animata di una finestra modale
 * con gestione del focus e del tasto Esc.
 */
import { $, $$, env } from './utils.js';
import { lockScroll } from './scroll.js';

let active = null;
let lastFocus = null;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Mantiene il focus dentro un contenitore (Tab ciclico). */
export function trapFocus(container, event) {
    if (event.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function openModal(modal) {
    if (!modal || active === modal) return;
    active = modal;
    lastFocus = document.activeElement;
    const card = $('.modal__card', modal);
    const check = $$('.modal__check circle, .modal__check path', modal);

    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true);

    gsap.timeline({ defaults: { ease: 'expo.out' } })
        .set(modal, { visibility: 'visible' })
        .fromTo($('.modal__overlay', modal), { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(card, { y: 90, scale: 0.86, opacity: 0, rotation: -3 }, { y: 0, scale: 1, opacity: 1, rotation: 0, duration: env.reduced ? 0.01 : 0.9, ease: 'back.out(1.5)' }, 0.05)
        .fromTo(check, { strokeDashoffset: 240 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.25, ease: 'power3.inOut' }, 0.35)
        .fromTo($$('.modal__card > *:not(.modal__close):not(.modal__art)', modal), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, 0.3)
        .add(() => card.focus({ preventScroll: true }), 0.1);
}

export function closeModal(modal = active) {
    if (!modal || active !== modal) return;
    active = null;
    modal.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    gsap.timeline()
        .to($('.modal__card', modal), { y: 40, scale: 0.92, opacity: 0, duration: 0.3, ease: 'power2.in' })
        .to($('.modal__overlay', modal), { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.05)
        .set(modal, { visibility: 'hidden' });
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

// Chiusura: overlay, pulsanti [data-modal-close], Esc.
document.addEventListener('click', (e) => {
    if (active && e.target.closest('[data-modal-close]')) closeModal();
});
window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'Escape') closeModal();
    else trapFocus($('.modal__card', active), e);
});
