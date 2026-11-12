/**
 * gallery.js — carosello (Swiper) + lightbox animata con tastiera e swipe.
 */
import { $, $$, env } from './utils.js';
import { lockScroll } from './scroll.js';
import { trapFocus } from './modal.js';

export function initGallery() {
    const root = $('.gallery');
    if (!root || typeof Swiper === 'undefined') return;

    new Swiper($('.gallery__swiper', root), {
        slidesPerView: 'auto',
        spaceBetween: 18,
        speed: 800,
        grabCursor: !env.fine,
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: { prevEl: $('.gallery__prev', root), nextEl: $('.gallery__next', root) },
        breakpoints: { 900: { spaceBetween: 28 } },
    });

    if (!env.reduced) {
        gsap.from($$('.shot', root), {
            x: 220, rotation: 7, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09,
            scrollTrigger: { trigger: '.gallery__swiper', start: 'top 88%', once: true },
        });
    }

    initLightbox($$('[data-lightbox]', root));
}

function initLightbox(triggers) {
    const box = $('#lightbox');
    if (!box || !triggers.length) return;
    const figure = $('.lightbox__figure', box);
    const img = $('.lightbox__img', box);
    const caption = $('.lightbox__caption', box);
    const count = $('.lightbox__count', box);
    const overlay = $('.lightbox__overlay', box);
    const controls = $$('.round-btn', box);
    const items = triggers.map((t) => ({ src: t.dataset.full, caption: t.dataset.caption, el: t }));
    let index = 0;
    let open = false;
    let dragMoved = false;

    const pad = (n) => String(n).padStart(2, '0');
    const render = () => {
        const item = items[index];
        img.src = item.src;
        img.alt = item.caption;
        caption.textContent = item.caption;
        count.textContent = `${pad(index + 1)} / ${pad(items.length)}`;
        // Precarica la foto successiva.
        new Image().src = items[(index + 1) % items.length].src;
    };

    const show = (i) => {
        index = (i + items.length) % items.length;
        const item = items[index];
        const from = item.el.getBoundingClientRect();
        open = true;
        render();
        box.setAttribute('aria-hidden', 'false');
        lockScroll(true);

        gsap.timeline({ defaults: { ease: 'expo.out' } })
            .set(box, { visibility: 'visible' })
            .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5 })
            // La foto "decolla" dalla miniatura.
            .fromTo(figure,
                { x: from.left + from.width / 2 - window.innerWidth / 2, y: from.top + from.height / 2 - window.innerHeight / 2, scale: 0.4, opacity: 0 },
                { x: 0, y: 0, scale: 1, opacity: 1, duration: env.reduced ? 0.01 : 0.9 }, 0)
            .fromTo(controls, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.05 }, 0.25)
            .add(() => figure.focus({ preventScroll: true }), 0.1);
    };

    const hide = () => {
        if (!open) return;
        open = false;
        box.setAttribute('aria-hidden', 'true');
        lockScroll(false);
        gsap.timeline()
            .to(figure, { scale: 0.85, opacity: 0, duration: 0.3, ease: 'power2.in' })
            .to(overlay, { opacity: 0, duration: 0.3 }, 0.05)
            .set(box, { visibility: 'hidden' });
        items[index].el.focus({ preventScroll: true });
    };

    const step = (dir) => {
        if (!open) return;
        gsap.timeline()
            .to(figure, { x: -80 * dir, opacity: 0, rotation: -3 * dir, duration: 0.22, ease: 'power2.in' })
            .add(() => { index = (index + dir + items.length) % items.length; render(); })
            .fromTo(figure, { x: 120 * dir, opacity: 0, rotation: 4 * dir }, { x: 0, opacity: 1, rotation: 0, duration: 0.6, ease: 'expo.out' });
    };

    // Swiper segnala i trascinamenti: un drag non deve aprire la lightbox.
    triggers.forEach((t, i) => {
        t.addEventListener('pointerdown', (e) => { t._x = e.clientX; dragMoved = false; });
        t.addEventListener('pointermove', (e) => { if (t._x !== undefined && Math.abs(e.clientX - t._x) > 8) dragMoved = true; });
        t.addEventListener('click', (e) => { if (dragMoved) { e.preventDefault(); return; } show(i); });
    });

    $('.lightbox__prev', box).addEventListener('click', () => step(-1));
    $('.lightbox__next', box).addEventListener('click', () => step(1));
    box.addEventListener('click', (e) => { if (e.target.closest('[data-lightbox-close]')) hide(); });
    window.addEventListener('keydown', (e) => {
        if (!open) return;
        if (e.key === 'Escape') hide();
        else if (e.key === 'ArrowRight') step(1);
        else if (e.key === 'ArrowLeft') step(-1);
        else trapFocus(box, e);
    });

    // Swipe su touch.
    let startX = null;
    figure.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    figure.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        startX = null;
    }, { passive: true });
}
