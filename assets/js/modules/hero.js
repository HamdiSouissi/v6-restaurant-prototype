/**
 * hero.js — scena d'apertura.
 *   · intro cinematografica (titolo lettera per lettera, pizza che atterra,
 *     ingredienti che esplodono verso l'esterno)
 *   · "camera" che segue il mouse + parallasse a profondità variabile
 *   · racconto in scroll: la pizza ruota e cresce, gli ingredienti volano via
 */
import { $, $$, env, rand, pick, PALETTE } from './utils.js';

let hero, stage, camera, floaters, titleChars;
let introPlayed = false;

export function initHero() {
    hero = $('.hero');
    if (!hero) return;
    stage = $('.hero__stage', hero);
    camera = $('.hero__camera', hero);
    floaters = $$('.floater', hero);

    // Titolo: parole + lettere (SplitType), mascherate per parola.
    titleChars = [];
    $$('[data-hero-split]', hero).forEach((el) => {
        const split = new SplitType(el, { types: 'words,chars', tagName: 'span' });
        titleChars.push(...split.chars);
    });

    buildParticles($('.particles', hero));

    if (env.reduced) return;

    // Stato iniziale (coperto dal preloader).
    gsap.set(titleChars, { yPercent: 115 });
    gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 30 });
    gsap.set('[data-hero-pop]', { autoAlpha: 0, scale: 0.6, y: 40 });
    gsap.set('.hero__product', { scale: 0.3, rotation: -160, autoAlpha: 0 });
    gsap.set('.hero__halo, .hero__shadow', { scale: 0.4, autoAlpha: 0 });
    gsap.set('.hero__seal', { scale: 0, rotation: -120 });
    gsap.set('.smile__line path', { strokeDasharray: 320, strokeDashoffset: 320 });
    gsap.set('.header__inner', { yPercent: -160 });
    gsap.set('.ribbon__band', { autoAlpha: 0 });
    floaters.forEach((f) => gsap.set(f.querySelector('img, svg'), { scale: 0 }));

    // Sfondo vivo: le macchie di colore respirano lentamente.
    $$('.blob', hero).forEach((blob, i) => {
        gsap.to(blob, { x: () => rand(-60, 60), y: () => rand(-50, 50), scale: rand(0.92, 1.14), duration: rand(7, 11), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.4 });
    });

    initScrollStory();
}

/** Intro: parte quando il sipario si alza. */
export function playHeroIntro() {
    if (!hero || introPlayed) return;
    introPlayed = true;
    if (env.reduced) return;

    const center = stage.getBoundingClientRect();
    const cx = center.left + center.width / 2;
    const cy = center.top + center.height / 2;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: enableLiveMotion });

    tl.to('.header__inner', { yPercent: 0, duration: 1.1 }, 0.1)
        .to('.hero__halo, .hero__shadow', { scale: 1, autoAlpha: 1, duration: 1.6 }, 0)
        .to('.hero__product', { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.9, ease: 'expo.out' }, 0)
        .to(titleChars, { yPercent: 0, duration: 1.05, stagger: 0.022 }, 0.15)
        .to('.smile__line path', { strokeDashoffset: 0, duration: 0.9, ease: 'power3.inOut' }, 0.95)
        .to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.7)
        .to('.hero__seal', { scale: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.55)' }, 0.9)
        .to('[data-hero-pop]', { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: 'elastic.out(1, 0.6)', stagger: 0.12 }, 1.1)
        .to('.ribbon__band', { autoAlpha: 1, duration: 0.6, stagger: 0.1 }, 0.9);

    // Gli ingredienti partono da dietro la pizza e "esplodono" verso la loro posizione.
    floaters.forEach((f, i) => {
        const el = f.querySelector('img, svg');
        const r = f.getBoundingClientRect();
        const dx = cx - (r.left + r.width / 2);
        const dy = cy - (r.top + r.height / 2);
        tl.fromTo(el,
            { x: dx * 0.75, y: dy * 0.75, scale: 0, rotation: rand(-140, 140) },
            { x: 0, y: 0, scale: 1, rotation: 0, duration: 1.5, ease: 'elastic.out(1, 0.7)' },
            0.55 + i * 0.055);
    });
}

/** Movimento continuo: rotazione lenta, galleggiamento, parallasse del mouse. */
function enableLiveMotion() {
    gsap.to('.hero__pizza', { rotation: 360, duration: 110, ease: 'none', repeat: -1 });

    floaters.forEach((f) => {
        const el = f.querySelector('img, svg');
        gsap.to(el, { y: rand(-16, -28), rotation: rand(-10, 10), duration: rand(2.6, 4.2), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: rand(0, 1.2) });
    });
    gsap.to('.hero__tag', { y: -10, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to('.hero__chip', { y: 9, duration: 3.3, ease: 'sine.inOut', repeat: -1, yoyo: true });

    if (!env.fine) return;

    // Mouse → camera (leggera) + ingredienti (in base alla profondità).
    const camX = gsap.quickTo(camera, 'x', { duration: 1.1, ease: 'power3' });
    const camY = gsap.quickTo(camera, 'y', { duration: 1.1, ease: 'power3' });
    const camR = gsap.quickTo(camera, 'rotation', { duration: 1.4, ease: 'power3' });
    const layers = $$('[data-depth]', hero).map((el) => {
        const target = el.querySelector('.floater__p') || el;
        return {
            depth: parseFloat(el.dataset.depth) || 0.5,
            x: gsap.quickTo(target, 'x', { duration: 0.9, ease: 'power3' }),
            y: gsap.quickTo(target, 'y', { duration: 0.9, ease: 'power3' }),
        };
    });

    hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        camX(nx * -26); camY(ny * -18); camR(nx * 2.2);
        layers.forEach((l) => { l.x(nx * -70 * l.depth); l.y(ny * -55 * l.depth); });
    }, { passive: true });
}

/** Racconto in scroll: il prodotto diventa protagonista mentre il testo esce di scena. */
function initScrollStory() {
    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
    });

    tl.to('.hero__product', { rotation: 110, scale: 1.16 }, 0)
        .to(stage, { yPercent: 9 }, 0)
        .to('.hero__copy', { yPercent: -22, autoAlpha: 0.15 }, 0)
        .to('.hero__rings', { scale: 1.25, autoAlpha: 0 }, 0)
        .to('.blob--sun', { yPercent: 18 }, 0)
        .to('.blob--peach', { yPercent: -22 }, 0)
        .to('.scroll-indicator', { autoAlpha: 0, duration: 0.15 }, 0);

    // Ogni ingrediente si allontana dal centro, più veloce se è "più vicino".
    const box = stage.getBoundingClientRect();
    floaters.forEach((f) => {
        const r = f.getBoundingClientRect();
        const vx = (r.left + r.width / 2) - (box.left + box.width / 2);
        const vy = (r.top + r.height / 2) - (box.top + box.height / 2);
        const depth = parseFloat(f.dataset.depth) || 0.6;
        tl.to(f, { x: vx * 0.55 * depth, y: vy * 0.55 * depth - 120 * depth, rotation: (vx > 0 ? 1 : -1) * 40 * depth }, 0);
    });
}

/** Piccole particelle colorate che fluttuano nello sfondo. */
function buildParticles(host) {
    if (!host) return;
    const total = Math.round((parseInt(host.dataset.particles, 10) || 14) * (env.mobile ? 0.5 : 1));
    for (let i = 0; i < total; i++) {
        const p = document.createElement('span');
        const size = rand(6, 16);
        p.className = 'particle';
        p.style.cssText = `width:${size}px;height:${size}px;left:${rand(2, 98)}%;top:${rand(6, 94)}%;background:${pick(PALETTE)};opacity:${rand(0.35, 0.8)}`;
        host.append(p);
        if (env.reduced) continue;
        gsap.to(p, { x: rand(-50, 50), y: rand(-70, 70), scale: rand(0.5, 1.4), duration: rand(4, 9), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: rand(0, 3) });
    }
}
