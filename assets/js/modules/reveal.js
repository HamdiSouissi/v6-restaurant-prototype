/**
 * reveal.js — animazioni d'ingresso generiche guidate dallo scroll.
 *   [data-split]        titoli lettera per lettera
 *   [data-reveal]       comparsa morbida dal basso
 *   [data-reveal-card]  card con rimbalzo, in cascata
 *   [data-scrub-words]  frase che si "accende" parola per parola
 *   [data-count]        numeri che contano
 *   [data-bg]           il colore di fondo cambia da una scena all'altra
 *   [data-marquee]      nastri infiniti sensibili alla velocità di scroll
 */
import { $, $$, env, clamp } from './utils.js';

export function initReveals() {
    initBackgrounds();
    initMarquees();
    if (env.reduced) return;
    initTitles();
    initFades();
    initCards();
    initScrubWords();
    initCounters();
    initFooterWord();
}

/* Titoli ------------------------------------------------------------------- */
function initTitles() {
    $$('[data-split]').forEach((title) => {
        const split = new SplitType(title, { types: 'words,chars', tagName: 'span' });
        gsap.from(split.chars, {
            yPercent: 115, rotation: 6, duration: 0.95, ease: 'expo.out', stagger: 0.016,
            scrollTrigger: { trigger: title, start: 'top 88%', once: true },
        });
    });
}

/* Comparsa dal basso --------------------------------------------------------- */
function initFades() {
    const items = $$('[data-reveal]');
    gsap.set(items, { autoAlpha: 0, y: 36 });
    ScrollTrigger.batch(items, {
        start: 'top 90%', once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
}

/* Card in cascata ------------------------------------------------------------ */
function initCards() {
    const cards = $$('[data-reveal-card]');
    gsap.set(cards, { autoAlpha: 0, y: 90, scale: 0.9, rotation: (i) => (i % 2 ? 2.5 : -2.5) });
    ScrollTrigger.batch(cards, {
        start: 'top 92%', once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 1.15, ease: 'back.out(1.5)', stagger: 0.09, overwrite: true }),
    });
}

/* Frase che si accende parola per parola -------------------------------------- */
function initScrubWords() {
    $$('[data-scrub-words]').forEach((block) => {
        // Avvolge ogni parola in uno <span class="w"> preservando i tag interni (<mark>).
        const wrap = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                node.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.append(' '); return; }
                    const span = document.createElement('span');
                    span.className = 'w';
                    span.textContent = part;
                    frag.append(span);
                });
                node.replaceWith(frag);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Array.from(node.childNodes).forEach(wrap);
            }
        };
        Array.from(block.childNodes).forEach(wrap);

        gsap.to($$('.w', block), {
            opacity: 1, ease: 'none', stagger: 0.12, duration: 0.3,
            scrollTrigger: { trigger: block, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
        });
    });
}

/* Contatori -------------------------------------------------------------------- */
function initCounters() {
    $$('[data-count]').forEach((el) => {
        const raw = el.dataset.count;
        const decimals = raw.includes(',') ? raw.split(',')[1].length : 0;
        const end = parseFloat(raw.replace(',', '.'));
        const state = { v: 0 };
        const render = () => { el.textContent = state.v.toFixed(decimals).replace('.', ','); };
        render();
        gsap.to(state, {
            v: end, duration: 2, ease: 'power3.out', onUpdate: render,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
    });
}

/* Colore di fondo per scena ------------------------------------------------------ */
function initBackgrounds() {
    const scenes = $$('[data-bg]');
    if (!scenes.length) return;
    const base = getComputedStyle(document.body).backgroundColor;
    const active = new Set();
    let current = base;
    // Vince sempre l'ultima scena attiva nell'ordine del documento: così anche un salto
    // di scroll (ancora, tasto Fine) arriva sul colore giusto senza passaggi intermedi.
    const sync = () => {
        const scene = scenes.filter((s) => active.has(s)).pop();
        const color = scene ? scene.dataset.bg : base;
        if (color === current) return;
        current = color;
        gsap.to(document.body, { backgroundColor: color, duration: env.reduced ? 0 : 0.9, ease: 'power2.out', overwrite: 'auto' });
    };
    scenes.forEach((scene) => {
        ScrollTrigger.create({
            trigger: scene, start: 'top 55%', end: 'bottom 55%',
            onToggle: (self) => { active[self.isActive ? 'add' : 'delete'](scene); sync(); },
        });
    });
}

/* Nastri infiniti ------------------------------------------------------------------ */
function initMarquees() {
    if (env.reduced) return;
    $$('[data-marquee]').forEach((band) => {
        const track = $('.ribbon__track', band);
        if (!track) return;
        const dir = parseFloat(band.dataset.marquee) < 0 ? -1 : 1;
        // Il contenuto è ripetuto in PHP: duplichiamo il blocco per un loop senza salti.
        track.innerHTML += track.innerHTML;
        const tween = gsap.fromTo(track,
            { xPercent: dir > 0 ? 0 : -50 },
            { xPercent: dir > 0 ? -50 : 0, duration: 46, ease: 'none', repeat: -1 });

        ScrollTrigger.create({
            start: 0, end: 'max',
            onUpdate(self) {
                const boost = clamp(Math.abs(self.getVelocity()) / 260, 0, 7);
                gsap.to(tween, { timeScale: 1 + boost, duration: 0.2, overwrite: true });
                gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.25 });
            },
        });
    });
}

/* Wordmark gigante del footer ------------------------------------------------------- */
function initFooterWord() {
    const word = $('.footer__word');
    if (!word) return;
    gsap.from(word, {
        yPercent: 45, ease: 'none',
        scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    });
}
