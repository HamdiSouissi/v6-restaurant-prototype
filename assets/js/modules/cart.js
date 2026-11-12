/**
 * cart.js — ordine online simulato.
 *   · stato del carrello (prodotti, modalità, codice sconto) in sessionStorage
 *   · aggiunta con "volo" del prodotto verso il carrello
 *   · drawer laterale a tre passi: carrello → checkout → conferma
 *   · calcolo automatico di subtotale, sconto, consegna e totale
 * Nessun pagamento e nessuna chiamata di rete: è tutto una dimostrazione.
 */
import { $, $$, config, euro, thumb, html, icon, esc, env, wait, rand } from './utils.js';
import { lockScroll } from './scroll.js';
import { toast } from './toast.js';
import { confetti, confettiFrom } from './confetti.js';
import { validateForm, liveValidation, resetForm } from './forms.js';
import { trapFocus } from './modal.js';

const STORAGE_KEY = 'sorriso-cart-v1';
const MAX_QTY = 20;

const state = { items: {}, mode: 'consegna', promo: false };

let drawer, panel, overlay, list;
let isOpen = false;
let view = 'cart';
let lastFocus = null;

/* Stato -------------------------------------------------------------------- */

function load() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
        if (!saved) return;
        Object.entries(saved.items || {}).forEach(([id, qty]) => { if (config.catalog[id] && qty > 0) state.items[id] = Math.min(MAX_QTY, qty); });
        state.mode = saved.mode === 'asporto' ? 'asporto' : 'consegna';
        state.promo = Boolean(saved.promo);
    } catch (e) { /* storage non disponibile: si riparte da zero */ }
}

function save() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignora */ }
}

/** Calcolo automatico dei totali. */
function totals() {
    const entries = Object.entries(state.items);
    const count = entries.reduce((n, [, qty]) => n + qty, 0);
    const subtotal = entries.reduce((sum, [id, qty]) => sum + config.catalog[id].price * qty, 0);
    const discount = state.promo ? subtotal * (config.promo.percent / 100) : 0;
    const net = subtotal - discount;
    const delivery = state.mode === 'consegna';
    const shipping = delivery && count > 0 && net < config.delivery.free_from ? config.delivery.fee : 0;
    return { count, subtotal, discount, shipping, total: net + shipping, missing: Math.max(0, config.delivery.free_from - net), delivery };
}

function setQty(id, qty) {
    if (!config.catalog[id]) return;
    const next = Math.max(0, Math.min(MAX_QTY, qty));
    if (next === 0) delete state.items[id];
    else state.items[id] = next;
    save();
    render();
}

const qtyOf = (id) => state.items[id] || 0;

function setMode(mode) {
    if (mode === state.mode) return;
    state.mode = mode;
    save();
    render();
}

/* Rendering ------------------------------------------------------------------ */

const setText = (selector, text) => $$(selector).forEach((el) => {
    if (el.textContent === text) return;
    el.textContent = text;
});

function render() {
    const t = totals();
    const empty = t.count === 0;

    // Contatori (header, FAB).
    $$('[data-cart-count]').forEach((el) => {
        const changed = el.textContent !== String(t.count);
        el.textContent = t.count;
        el.classList.toggle('is-visible', !empty);
        if (changed && !empty) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); }
    });
    $('.fab')?.classList.toggle('is-visible', !empty && !isOpen);
    setText('[data-fab-total]', euro(t.total));

    // Totali (drawer + riepilogo in pagina).
    setText('[data-subtotal]', euro(t.subtotal));
    setText('[data-discount]', `−${euro(t.discount)}`);
    setText('[data-discount-code]', state.promo ? `(${config.promo.code})` : '');
    $$('[data-discount-row]').forEach((row) => { row.hidden = !state.promo || empty; });
    setText('[data-shipping]', empty ? '—' : !t.delivery ? 'Ritiro gratuito' : t.shipping === 0 ? 'Gratis' : euro(t.shipping));
    $$('[data-total]').forEach((el) => {
        const text = euro(t.total);
        if (el.textContent === text) return;
        el.textContent = text;
        if (!env.reduced) gsap.fromTo(el, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', overwrite: true, transformOrigin: '100% 50%' });
    });
    setText('[data-free-hint]', empty || !t.delivery ? '' : t.shipping === 0 ? 'Consegna gratuita sbloccata!' : `Ti mancano ${euro(t.missing)} per la consegna gratuita.`);

    // Modalità: consegna / asporto.
    $$('[data-mode]').forEach((btn) => {
        const on = btn.dataset.mode === state.mode;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-checked', String(on));
    });
    $('.drawer__switch')?.setAttribute('data-active', state.mode);
    $$('[data-mode-label]').forEach((el) => { el.innerHTML = t.delivery ? `${icon('e-bike-2-fill')} Consegna` : `${icon('takeaway-fill')} Asporto`; });
    const address = $('[data-address-field]');
    if (address) { address.hidden = !t.delivery; $('input', address).disabled = !t.delivery; }

    // Stepper nelle card + evidenza dei prodotti già nel carrello.
    $$('[data-stepper]').forEach((stepper) => {
        const qty = qtyOf(stepper.dataset.stepper);
        $('.stepper__qty', stepper).textContent = qty;
        stepper.classList.toggle('is-active', qty > 0);
        stepper.closest('.pick')?.classList.toggle('is-in', qty > 0);
    });

    // Stati vuoti.
    $$('[data-cart-empty]').forEach((el) => { el.hidden = !empty; });
    $$('[data-cart-foot]').forEach((el) => { el.hidden = empty; });
    $$('[data-summary-empty]').forEach((el) => { el.hidden = !empty; });

    renderSummary();
    renderList();
    renderPromo();
}

/** Riepilogo compatto nella sezione "Ordina online". */
function renderSummary() {
    const host = $('[data-summary-list]');
    if (!host) return;
    host.innerHTML = Object.entries(state.items).map(([id, qty]) => {
        const p = config.catalog[id];
        return `<li class="summary__line"><b>${qty}×</b><span>${esc(p.name)}</span><em>${euro(p.price * qty)}</em></li>`;
    }).join('');
}

/** Lista del drawer: aggiorna le righe esistenti, anima quelle nuove e quelle rimosse. */
function renderList() {
    if (!list) return;
    const existing = new Map($$('.cart-item', list).filter((li) => !li.dataset.leaving).map((li) => [li.dataset.id, li]));

    Object.entries(state.items).forEach(([id, qty]) => {
        const p = config.catalog[id];
        let row = existing.get(id);
        if (!row) {
            row = html(`
                <li class="cart-item" data-id="${id}" style="--scene:${p.color}">
                    <span class="cart-item__thumb"><img src="${thumb(p.img)}" width="72" height="72" alt=""></span>
                    <div>
                        <p class="cart-item__name">${esc(p.name)}</p>
                        <div class="cart-item__meta">
                            <div class="stepper stepper--light">
                                <button type="button" class="stepper__btn stepper__btn--minus" data-item-step="-1" aria-label="Diminuisci la quantità di ${esc(p.name)}">${icon('subtract-line')}</button>
                                <output class="stepper__qty" aria-live="polite"></output>
                                <button type="button" class="stepper__btn" data-item-step="1" aria-label="Aumenta la quantità di ${esc(p.name)}">${icon('add-line')}</button>
                            </div>
                        </div>
                    </div>
                    <div class="cart-item__side">
                        <button type="button" class="cart-item__remove" data-item-remove aria-label="Rimuovi ${esc(p.name)} dal carrello">${icon('delete-bin-6-line')}</button>
                        <strong class="cart-item__price"></strong>
                    </div>
                </li>`);
            list.append(row);
            if (isOpen && !env.reduced) gsap.from(row, { x: 60, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.6)' });
        }
        existing.delete(id);
        $('.stepper__qty', row).textContent = qty;
        $('.cart-item__price', row).textContent = euro(p.price * qty);
    });

    // Righe non più presenti: escono scorrendo e liberano lo spazio.
    existing.forEach((row) => {
        row.dataset.leaving = '1';
        if (!isOpen || env.reduced) { row.remove(); return; }
        gsap.timeline({ onComplete: () => row.remove() })
            .to(row, { x: 80, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
            .to(row, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: () => -parseFloat(getComputedStyle(list).rowGap || 0), duration: 0.3, ease: 'power2.out' });
    });
}

/** Stato del campo codice sconto. */
function renderPromo() {
    const form = $('[data-promo-form]');
    if (!form) return;
    const input = $('input', form);
    const button = $('button', form);
    form.classList.toggle('is-applied', state.promo);
    input.readOnly = state.promo;
    if (state.promo) input.value = config.promo.code;
    button.textContent = state.promo ? 'Rimuovi' : 'Applica';
}

/* Aggiunta al carrello --------------------------------------------------------- */

/** Bersaglio del "volo": il carrello nell'header, oppure il FAB su mobile. */
function flyTarget() {
    const fab = $('.fab');
    if (fab && getComputedStyle(fab).display !== 'none') return fab;
    const header = $('#header');
    return header && !header.classList.contains('is-hidden') ? $('.cart-btn') : null;
}

/** Una copia del prodotto vola dall'origine fino al carrello. */
function fly(id, origin) {
    const target = flyTarget();
    if (env.reduced || !origin || !target || isOpen) return;
    const from = origin.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width) return;
    const ghost = html(`<span class="fly"><img src="${thumb(config.catalog[id].img)}" alt=""></span>`);
    document.body.append(ghost);

    const sx = from.left + from.width / 2 - 32;
    const sy = from.top + from.height / 2 - 32;
    const tx = to.left + to.width / 2 - 32;
    const ty = Math.max(-20, to.top + to.height / 2 - 32);

    gsap.timeline({ onComplete: () => ghost.remove() })
        .set(ghost, { x: sx, y: sy, scale: 0.4 })
        .to(ghost, { scale: 1.25, duration: 0.25, ease: 'back.out(2)' })
        .to(ghost, { x: tx, duration: 0.75, ease: 'power2.inOut' }, 0.1)
        .to(ghost, { y: Math.min(sy, ty) - 90, duration: 0.35, ease: 'power2.out' }, 0.1)
        .to(ghost, { y: ty, duration: 0.4, ease: 'power2.in' }, 0.45)
        .to(ghost, { scale: 0.25, rotation: 200, duration: 0.5, ease: 'power2.in' }, 0.35);
}

function add(id, origin, { silent = false } = {}) {
    const p = config.catalog[id];
    if (!p) return;
    const source = origin?.closest('.spot, .dish, .pick, .hero__tag')?.querySelector('img') || origin;
    fly(id, source);
    setQty(id, qtyOf(id) + 1);
    if (!silent) toast({ strong: p.name, text: 'è nel carrello.', img: p.img, color: p.color });
}

/* Drawer ------------------------------------------------------------------------ */

const TITLES = { cart: 'Il tuo carrello', checkout: 'Checkout', done: 'Grazie!' };

function setView(next, animate = true) {
    view = next;
    $$('[data-step-view]', drawer).forEach((el) => {
        const on = el.dataset.stepView === next;
        el.hidden = !on;
        el.classList.toggle('is-active', on);
        if (on && animate && !env.reduced) gsap.fromTo(el, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', clearProps: 'transform' });
    });
    $('[data-cart-title]', drawer).textContent = TITLES[next];
    $('[data-cart-back]', drawer).hidden = next !== 'checkout';
}

function openCart() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    drawer.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    $('.fab')?.classList.remove('is-visible');

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        .set(drawer, { visibility: 'visible' })
        .to(overlay, { opacity: 1, duration: 0.5 }, 0)
        .fromTo(panel, { xPercent: 105 }, { xPercent: 0, duration: env.reduced ? 0.01 : 0.85 }, 0);
    if (!env.reduced) tl.from($$('.cart-item', list), { x: 70, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(1.4)', clearProps: 'transform,opacity,visibility' }, 0.2);
    tl.add(() => panel.focus({ preventScroll: true }), 0.1);
}

function closeCart() {
    if (!isOpen) return;
    isOpen = false;
    drawer.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    gsap.timeline({ onComplete: () => { if (view !== 'cart') setView('cart', false); render(); } })
        .to(panel, { xPercent: 105, duration: 0.5, ease: 'power3.in' }, 0)
        .to(overlay, { opacity: 0, duration: 0.4 }, 0.1)
        .set(drawer, { visibility: 'hidden' });
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

/* Checkout simulato --------------------------------------------------------------- */

async function submitCheckout(form) {
    if (validateForm(form)) return;
    const button = $('button[type="submit"]', form);
    const t = totals();
    const name = $('#ck-name', form).value.trim().split(' ')[0];

    button.classList.add('is-loading');
    await wait(1500); // finta elaborazione del pagamento
    button.classList.remove('is-loading');

    // Scontrino.
    const eta = new Date(Date.now() + (t.delivery ? 30 : 15) * 60000);
    const done = $('[data-step-view="done"]', drawer);
    $('[data-done-name]', done).textContent = name;
    $('[data-done-number]', done).textContent = `#${Math.round(rand(1000, 9999))}`;
    $('[data-done-eta-label]', done).textContent = t.delivery ? 'Consegna prevista' : 'Ritiro previsto';
    $('[data-done-eta]', done).textContent = eta.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    $('[data-done-total]', done).textContent = euro(t.total);
    $('[data-done-last]', done).textContent = t.delivery ? 'In consegna' : 'Pronto per il ritiro';

    const steps = $$('.done__steps li', done);
    steps.forEach((li, i) => li.classList.toggle('is-on', i === 0));
    setView('done');

    // Il carrello si svuota: l'ordine è "partito".
    state.items = {};
    state.promo = false;
    save();
    render();
    resetForm(form);

    if (!env.reduced) {
        gsap.fromTo($$('.done__check circle, .done__check path', done), { strokeDashoffset: 240 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.25, ease: 'power3.inOut', delay: 0.15 });
        gsap.from($$('.done > *:not(.done__check)', done), { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.07, delay: 0.3, clearProps: 'transform,opacity,visibility' });
    } else {
        gsap.set($$('.done__check circle, .done__check path', done), { strokeDashoffset: 0 });
    }
    setTimeout(() => confettiFrom($('.done__check', done), { count: 120, power: 15 }), 450);
    // Avanzamento fittizio dell'ordine.
    setTimeout(() => steps[1]?.classList.add('is-on'), 2200);
    setTimeout(() => steps[2]?.classList.add('is-on'), 4600);
}

/* Avvio ---------------------------------------------------------------------------- */

export function initCart() {
    drawer = $('#cart-drawer');
    if (!drawer) return;
    panel = $('.drawer__panel', drawer);
    overlay = $('.drawer__overlay', drawer);
    list = $('[data-cart-list]', drawer);

    load();
    render();

    document.addEventListener('click', (e) => {
        const el = e.target instanceof Element ? e.target : null;
        if (!el) return;

        // Aggiungi (card, hero, best seller).
        const addBtn = el.closest('[data-add]');
        if (addBtn) {
            add(addBtn.dataset.add, addBtn);
            addBtn.classList.add('is-added');
            setTimeout(() => addBtn.classList.remove('is-added'), 900);
            return;
        }

        // Stepper delle card "Ordina online".
        const stepBtn = el.closest('[data-stepper] [data-step]');
        if (stepBtn) {
            const id = stepBtn.closest('[data-stepper]').dataset.stepper;
            const dir = parseInt(stepBtn.dataset.step, 10);
            if (dir > 0) add(id, stepBtn, { silent: true });
            else setQty(id, qtyOf(id) - 1);
            return;
        }

        // Righe del drawer.
        const row = el.closest('.cart-item');
        if (row) {
            const id = row.dataset.id;
            const itemStep = el.closest('[data-item-step]');
            if (itemStep) return setQty(id, qtyOf(id) + parseInt(itemStep.dataset.itemStep, 10));
            if (el.closest('[data-item-remove]')) return setQty(id, 0);
        }

        // Modalità.
        const modeBtn = el.closest('[data-mode]');
        if (modeBtn) return setMode(modeBtn.dataset.mode);

        // Navigazione del drawer.
        if (el.closest('[data-cart-open]')) return openCart();
        if (el.closest('[data-cart-close]')) return closeCart();
        if (el.closest('[data-cart-back]')) return setView('cart');
        if (el.closest('[data-cart-finish]')) return closeCart();
        if (el.closest('[data-checkout-go]')) {
            if (totals().count === 0) return;
            setView('checkout');
            $('#ck-name', drawer)?.focus({ preventScroll: true });
        }
    });

    // Codice sconto.
    const promoForm = $('[data-promo-form]', drawer);
    const promoMsg = $('[data-promo-msg]', drawer);
    promoForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('input', promoForm);
        promoMsg.className = 'promo-input__msg';
        if (state.promo) {
            state.promo = false;
            input.value = '';
            promoMsg.textContent = '';
        } else if (input.value.trim().toUpperCase() === config.promo.code) {
            state.promo = true;
            promoMsg.classList.add('is-ok');
            promoMsg.textContent = `Codice applicato: −${config.promo.percent}% sul tuo ordine.`;
            confettiFrom(promoForm, { count: 50, power: 10 });
        } else {
            promoMsg.classList.add('is-ko');
            promoMsg.textContent = `Codice non valido. Prova con ${config.promo.code}.`;
            if (!env.reduced) gsap.fromTo(promoForm, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        }
        save();
        render();
    });

    // Checkout.
    const checkout = $('#checkout-form', drawer);
    if (checkout) {
        liveValidation(checkout);
        checkout.addEventListener('submit', (e) => { e.preventDefault(); submitCheckout(checkout); });
    }

    window.addEventListener('keydown', (e) => {
        if (!isOpen) return;
        if (e.key === 'Escape') closeCart();
        else trapFocus(panel, e);
    });
}
