/**
 * promo.js — banner promozionale: conto alla rovescia (fittizio, fino a
 * mezzanotte), codice copiabile con coriandoli, bolle e parallasse.
 */
import { $, $$, env, rand } from './utils.js';
import { toast } from './toast.js';
import { confettiFrom } from './confetti.js';

export function initPromo() {
    const card = $('[data-promo]');
    if (!card) return;

    initCountdown($('[data-countdown]', card));
    initCoupon($('[data-copy]', card));
    if (env.reduced) return;
    buildBubbles($('.bubbles', card));

    // Ingresso: il banner si apre, il "−30%" rimbalza.
    gsap.from(card, { scale: 0.88, y: 80, autoAlpha: 0, duration: 1.3, scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 65%', once: true } })
        .from('.promo__big', { scale: 0.2, rotation: -24, autoAlpha: 0, duration: 1.3, ease: 'elastic.out(1, 0.5)' })
        .from('.promo__kicker, .promo__sub, .promo__text, .promo__row, .countdown', { y: 34, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.15)
        .from('.promo__item', { scale: 0.3, autoAlpha: 0, duration: 1.2, ease: 'back.out(1.5)', stagger: 0.12 }, 0.1)
        .from('.promo__burst', { scale: 0, rotation: -180, duration: 1, ease: 'elastic.out(1, 0.55)' }, 0.7);

    // Parallasse dei prodotti che "escono" dal banner.
    [['.promo__item--burger', -40], ['.promo__item--fries', -110], ['.promo__item--drink', -150], ['.promo__sun', 30]].forEach(([sel, y]) => {
        gsap.to(sel, { y, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    gsap.to('.promo__big', { y: -10, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
}

/** Conto alla rovescia fino alla mezzanotte locale: l'offerta "scade" ogni giorno. */
function initCountdown(root) {
    if (!root) return;
    const cells = { h: $('[data-cd="h"]', root), m: $('[data-cd="m"]', root), s: $('[data-cd="s"]', root) };
    const pad = (n) => String(n).padStart(2, '0');

    const set = (el, value) => {
        if (el.textContent === value) return;
        el.textContent = value;
        if (!env.reduced) gsap.fromTo(el, { yPercent: -35, opacity: 0.2 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)', overwrite: true });
    };
    const update = () => {
        const now = new Date();
        const end = new Date(now); end.setHours(24, 0, 0, 0);
        const left = Math.max(0, Math.floor((end - now) / 1000));
        set(cells.h, pad(Math.floor(left / 3600)));
        set(cells.m, pad(Math.floor((left % 3600) / 60)));
        set(cells.s, pad(left % 60));
    };
    update();
    setInterval(update, 1000);
}

/** Copia del codice promozionale. */
function initCoupon(button) {
    if (!button) return;
    button.addEventListener('click', async () => {
        const code = button.dataset.copy;
        try { await navigator.clipboard.writeText(code); } catch (e) { /* in demo va bene anche senza clipboard */ }
        button.classList.add('is-copied');
        toast({ strong: code, text: 'copiato. Incollalo nel carrello!', icon: 'coupon-3-line' });
        confettiFrom(button, { count: 46, power: 9 });
        setTimeout(() => button.classList.remove('is-copied'), 2200);
    });
}

/** Bolle che salgono nel banner. */
function buildBubbles(host) {
    if (!host) return;
    const total = Math.round((parseInt(host.dataset.bubbles, 10) || 10) * (env.mobile ? 0.6 : 1));
    for (let i = 0; i < total; i++) {
        const b = document.createElement('span');
        const size = rand(10, 46);
        b.className = 'bubble';
        b.style.cssText = `width:${size}px;height:${size}px;left:${rand(0, 100)}%`;
        host.append(b);
        gsap.to(b, {
            y: () => -(host.offsetHeight + 120), x: rand(-40, 40), duration: rand(7, 15), delay: rand(0, 10),
            ease: 'none', repeat: -1,
        });
    }
}
