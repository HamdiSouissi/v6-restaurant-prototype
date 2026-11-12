/**
 * utils.js — piccoli helper condivisi.
 */

export const $ = (selector, ctx = document) => ctx.querySelector(selector);
export const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Ambiente: preferenze di movimento, tipo di puntatore, breakpoint. */
export const env = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fine: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    get mobile() { return window.matchMedia('(max-width: 900px)').matches; },
};

/** Palette del brand, riusata da coriandoli e particelle. */
export const PALETTE = ['#E63946', '#FF8A30', '#FFD447', '#58A84C', '#A8D672', '#FFB6A2', '#9DD7F7'];

/** Configurazione stampata da PHP (catalogo, promo, costi di consegna). */
export const config = (() => {
    try { return JSON.parse($('#app-config').textContent); } catch (e) { return { catalog: {}, promo: {}, delivery: {} }; }
})();

/** 7.5 → "7,50 €" */
export const euro = (value) => `${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** Percorso della miniatura di un prodotto. */
export const thumb = (img, size = 160) => `assets/img/products/${img}-${size}.webp`;

/** Crea un elemento da una stringa HTML. */
export const html = (markup) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = markup.trim();
    return tpl.content.firstElementChild;
};

/** Icona dallo sprite. */
export const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#${name}"></use></svg>`;

/** Escape minimale per testo inserito dall'utente. */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Attesa in ms (per simulare le chiamate al server). */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
