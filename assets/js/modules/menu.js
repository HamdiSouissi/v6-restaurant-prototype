/**
 * menu.js — categorie con cambio animato.
 *   · la pillola scura scorre sotto la scheda attiva
 *   · il prodotto in vetrina esce ruotando, il nuovo entra con rimbalzo
 *   · le card compaiono in cascata
 */
import { $, $$, env } from './utils.js';

export function initMenu() {
    const root = $('.menu');
    if (!root) return;

    const tabsBar = $('.menu__tabs', root);
    const tabs = $$('.menu__tab', root);
    const pill = $('.menu__tab-pill', root);
    const stage = $('.menu__stage', root);
    const title = $('[data-stage-title]', root);
    const line = $('[data-stage-line]', root);
    let current = tabs.find((t) => t.classList.contains('is-active'))?.dataset.tab || tabs[0].dataset.tab;
    let busy = false;

    const panelOf = (key) => $(`[data-panel="${key}"]`, root);
    const heroOf = (key) => $(`[data-stage="${key}"]`, root);
    const dataOf = (key) => $(`[data-stage-data="${key}"]`, root).dataset;

    /** Sposta la pillola sotto la scheda attiva. */
    const movePill = (animate = true) => {
        const tab = tabs.find((t) => t.dataset.tab === current);
        if (!tab || !pill) return;
        gsap.to(pill, { x: tab.offsetLeft, width: tab.offsetWidth, duration: animate && !env.reduced ? 0.7 : 0, ease: 'expo.out', overwrite: true });
    };

    /** Cambia categoria. */
    const select = (key, { focus = false } = {}) => {
        if (key === current || busy) return;
        const prev = current;
        current = key;
        busy = true;

        tabs.forEach((t) => {
            const on = t.dataset.tab === key;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', String(on));
            t.tabIndex = on ? 0 : -1;
            if (on && focus) t.focus({ preventScroll: true });
            if (on) tabsBar.scrollTo({ left: t.offsetLeft - (tabsBar.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
        });
        movePill();

        const data = dataOf(key);
        const oldPanel = panelOf(prev);
        const newPanel = panelOf(key);
        const oldHero = heroOf(prev);
        const newHero = heroOf(key);
        stage.style.setProperty('--scene', data.color);

        if (env.reduced) {
            oldPanel.hidden = true; oldPanel.classList.remove('is-active');
            newPanel.hidden = false; newPanel.classList.add('is-active');
            oldHero.classList.remove('is-active'); newHero.classList.add('is-active');
            title.textContent = data.title; line.textContent = data.line;
            busy = false;
            return;
        }

        const tl = gsap.timeline({ onComplete: () => { busy = false; ScrollTrigger.refresh(); } });

        // Vetrina: esce il vecchio prodotto…
        tl.to(oldHero.firstElementChild, { scale: 0.4, rotation: 70, xPercent: 60, autoAlpha: 0, duration: 0.4, ease: 'power3.in' }, 0)
            .to([title, line], { y: -24, autoAlpha: 0, duration: 0.25, stagger: 0.04, ease: 'power2.in' }, 0)
            .to($$('.dish', oldPanel), { y: -18, autoAlpha: 0, duration: 0.22, stagger: 0.02, ease: 'power2.in' }, 0)
            .add(() => {
                oldHero.classList.remove('is-active');
                newHero.classList.add('is-active');
                oldPanel.hidden = true; oldPanel.classList.remove('is-active');
                newPanel.hidden = false; newPanel.classList.add('is-active');
                gsap.set($$('.dish', oldPanel), { clearProps: 'all' });
                title.textContent = data.title;
                line.textContent = data.line;
            })
            // …ed entra il nuovo, con le card in cascata.
            .fromTo(newHero.firstElementChild,
                { scale: 0.35, rotation: -80, xPercent: -60, autoAlpha: 0 },
                { scale: 1, rotation: 0, xPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'elastic.out(1, 0.65)' })
            .fromTo([title, line], { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: 'expo.out' }, '<0.05')
            .fromTo($$('.dish', newPanel),
                { y: 60, autoAlpha: 0, scale: 0.92 },
                { y: 0, autoAlpha: 1, scale: 1, duration: 0.75, ease: 'back.out(1.6)', stagger: 0.065, clearProps: 'transform,opacity,visibility' }, '<');
    };

    // Click + tastiera (frecce, Home, End) secondo il pattern ARIA "tabs".
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab.dataset.tab));
        tab.addEventListener('keydown', (e) => {
            const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
            if (!(e.key in map)) return;
            e.preventDefault();
            const next = tabs[(map[e.key] + tabs.length) % tabs.length];
            select(next.dataset.tab, { focus: true });
        });
    });

    movePill(false);
    window.addEventListener('resize', () => movePill(false), { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(false));

    if (env.reduced) return;

    // Ingresso della scena.
    gsap.from($$('.dish', panelOf(current)), {
        y: 70, autoAlpha: 0, scale: 0.92, duration: 0.9, ease: 'back.out(1.5)', stagger: 0.07, clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.menu__body', start: 'top 80%', once: true },
    });
    gsap.from(stage, { scale: 0.9, autoAlpha: 0, y: 60, duration: 1.2, scrollTrigger: { trigger: '.menu__body', start: 'top 82%', once: true } });
    gsap.from(heroOf(current).firstElementChild, {
        scale: 0.4, rotation: -60, duration: 1.4, ease: 'elastic.out(1, 0.6)',
        scrollTrigger: { trigger: '.menu__body', start: 'top 75%', once: true },
    });
    // Il prodotto in vetrina galleggia.
    gsap.to('.menu__hero', { y: -14, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
}
