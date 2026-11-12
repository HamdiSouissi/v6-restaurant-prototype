/**
 * header.js — header trasparente → vetro al primo scroll, si nasconde
 * scorrendo verso il basso, link attivo, navigazione mobile a tutto schermo.
 */
import { $, $$ } from './utils.js';
import { lockScroll } from './scroll.js';

export function initHeader() {
    const header = $('#header');
    const links = $$('.nav__link');
    if (!header) return;

    // Stato "scrolled" + nascondi/mostra in base alla direzione.
    ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
            const y = self.scroll();
            header.classList.toggle('is-scrolled', y > 40);
            header.classList.toggle('is-hidden', y > 700 && self.direction === 1 && !document.documentElement.classList.contains('nav-open'));
        },
    });

    // Link attivo in base alla sezione al centro dello schermo.
    const setActive = (id) => links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    $$('[data-nav]').forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && setActive(section.dataset.nav),
        });
    });

    initMobileNav();
}

function initMobileNav() {
    const burger = $('.burger');
    const panel = $('#mobile-nav');
    if (!burger || !panel) return;
    const items = $$('.mobile-nav__links a, .mobile-nav__foot > *', panel);
    let open = false;

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
        .set(panel, { visibility: 'visible' })
        .fromTo(panel, { clipPath: 'circle(0% at calc(100% - 3rem) 3rem)' }, { clipPath: 'circle(150% at calc(100% - 3rem) 3rem)', duration: 0.9 })
        .fromTo(items, { yPercent: 80, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.045 }, 0.35);
    tl.eventCallback('onReverseComplete', () => gsap.set(panel, { visibility: 'hidden' }));

    const toggle = (state) => {
        if (state === open) return;
        open = state;
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
        panel.setAttribute('aria-hidden', String(!open));
        document.documentElement.classList.toggle('nav-open', open);
        lockScroll(open);
        open ? tl.timeScale(1).play() : tl.timeScale(1.6).reverse();
    };

    burger.addEventListener('click', () => toggle(!open));
    panel.addEventListener('click', (e) => e.target.closest('a') && toggle(false));
    window.addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false));
    window.matchMedia('(min-width: 1181px)').addEventListener('change', (e) => e.matches && toggle(false));
}
