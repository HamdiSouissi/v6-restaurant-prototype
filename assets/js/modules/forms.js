/**
 * forms.js — validazione lato client (simulata) per prenotazione,
 * checkout e newsletter. Nessun dato lascia il browser.
 */
import { $, $$, wait, clamp, env } from './utils.js';
import { openModal } from './modal.js';
import { confetti, confettiFrom } from './confetti.js';

const MESSAGES = {
    required: 'Questo campo è obbligatorio.',
    short: 'Sembra un po’ troppo corto.',
    email: 'Inserisci un indirizzo email valido.',
    tel: 'Inserisci un numero di telefono valido.',
    past: 'Scegli una data da oggi in poi.',
};

/** Restituisce il messaggio d'errore di un campo, oppure una stringa vuota. */
export function validate(input) {
    const value = input.value.trim();
    if (input.required && !value) return MESSAGES.required;
    if (!value) return '';
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return MESSAGES.email;
    if (input.type === 'tel' && !/^[0-9+\s().-]{6,}$/.test(value)) return MESSAGES.tel;
    if (input.minLength > 0 && value.length < input.minLength) return MESSAGES.short;
    if (input.type === 'date' && input.min && value < input.min) return MESSAGES.past;
    return '';
}

/** Mostra / nasconde l'errore accanto al campo. */
export function paint(input, message) {
    const field = input.closest('.field');
    if (!field) return;
    const slot = $(`[data-error-for="${input.id}"]`, field);
    field.classList.toggle('is-invalid', Boolean(message));
    field.classList.toggle('is-valid', !message && input.value.trim() !== '');
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (slot) slot.textContent = message;
}

/** Valida tutti i campi di un form; restituisce il primo campo non valido (o null). */
export function validateForm(form) {
    let firstInvalid = null;
    $$('input, select, textarea', form).forEach((input) => {
        if (input.disabled || input.type === 'radio' || input.closest('[hidden]')) return;
        const message = validate(input);
        paint(input, message);
        if (message && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
        if (!env.reduced) gsap.fromTo(firstInvalid.closest('.field'), { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
    }
    return firstInvalid;
}

/** Validazione "gentile": al blur, poi in tempo reale se il campo era in errore. */
export function liveValidation(form) {
    form.addEventListener('focusout', (e) => {
        if (e.target.matches('.field__input')) paint(e.target, validate(e.target));
    });
    form.addEventListener('input', (e) => {
        const field = e.target.closest('.field');
        if (field && field.classList.contains('is-invalid')) paint(e.target, validate(e.target));
    });
}

export function resetForm(form) {
    form.reset();
    $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
}

/* Prenotazione ------------------------------------------------------------- */
export function initBooking() {
    const form = $('#booking-form');
    if (!form) return;
    const people = $('#bk-people', form);
    const submit = $('button[type="submit"]', form);

    liveValidation(form);

    // Selettore del numero di persone.
    form.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-people]');
        if (!btn) return;
        const next = clamp((parseInt(people.value, 10) || 1) + parseInt(btn.dataset.people, 10), 1, 12);
        people.value = next;
        if (!env.reduced) gsap.fromTo(people, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    });
    people.addEventListener('change', () => { people.value = clamp(parseInt(people.value, 10) || 1, 1, 12); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(form)) return;

        const data = Object.fromEntries(new FormData(form));
        submit.classList.add('is-loading');
        await wait(1300); // finta chiamata al server
        submit.classList.remove('is-loading');

        const date = new Date(`${data.data}T12:00:00`);
        const modal = $('#booking-modal');
        $('[data-bk-name]', modal).textContent = data.nome.trim().split(' ')[0];
        $('[data-bk-email]', modal).textContent = data.email.trim();
        $('[data-bk-date]', modal).textContent = date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        $('[data-bk-time]', modal).textContent = `ore ${data.ora}`;
        $('[data-bk-people]', modal).textContent = `${data.persone} ${Number(data.persone) === 1 ? 'persona' : 'persone'}`;

        openModal(modal);
        setTimeout(() => {
            confetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.38, count: 110, power: 14 });
        }, 350);
        resetForm(form);
    });
}

/* Newsletter ---------------------------------------------------------------- */
export function initNewsletter() {
    const form = $('#newsletter-form');
    if (!form) return;
    const input = $('input', form);
    const msg = $('[data-newsletter-msg]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const error = validate(input);
        form.classList.remove('is-invalid');
        msg.className = 'newsletter__msg';
        if (error) {
            void form.offsetWidth; // riavvia l'animazione "shake"
            form.classList.add('is-invalid');
            msg.classList.add('is-ko');
            msg.textContent = error;
            input.focus();
            return;
        }
        await wait(500);
        msg.classList.add('is-ok');
        msg.textContent = 'Fatto! Controlla la posta: c’è un regalo di benvenuto.';
        confettiFrom($('button', form), { count: 40, power: 9 });
        form.reset();
    });
    input.addEventListener('input', () => form.classList.remove('is-invalid'));
}
