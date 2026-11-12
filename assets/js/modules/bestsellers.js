/**
 * bestsellers.js — ogni prodotto è lo spot di sé stesso.
 *   Desktop: sezione bloccata (pin) con scorrimento orizzontale, il colore
 *            della scena cambia da uno spot all'altro.
 *   Mobile:  card impilate con ingresso animato.
 */
import { $, $$, env } from './utils.js';

export function initBestSellers() {
    const section = $('.best');
    if (!section) return;
    const track = $('.best__track', section);
    const spots = $$('.spot', section);
    const bar = $('.best__progress span', section);
    if (env.reduced) return;

    const mm = gsap.matchMedia();

    /* Desktop: scroll orizzontale ------------------------------------------- */
    mm.add('(min-width: 901px)', () => {
        const distance = () => track.scrollWidth - window.innerWidth;

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: '.best__pin',
                pin: true,
                scrub: 0.7,
                start: 'top top',
                end: () => `+=${distance()}`,
                invalidateOnRefresh: true,
                anticipatePin: 1,
                onUpdate(self) {
                    gsap.set(bar, { scaleX: Math.max(0.02, self.progress) });
                    const index = Math.round(self.progress * (spots.length - 1));
                    section.classList.toggle('is-light', spots[index].dataset.theme === 'light');
                },
            },
        });
        tl.to(track, { x: () => -distance(), duration: spots.length - 1 }, 0);
        spots.forEach((spot, i) => {
            if (i) tl.to(section, { backgroundColor: spot.dataset.color, duration: 0.55 }, i - 0.8);
        });

        spots.forEach((spot, i) => {
            const product = $('.spot__product', spot);
            const price = $('.spot__price', spot);
            const info = $$('.spot__info > *', spot);
            const word = $('.spot__word', spot);
            const decos = $$('.spot__deco', spot);

            // La parola gigante scorre più lenta del pannello (parallasse).
            gsap.fromTo(word, { xPercent: 22 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: spot, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } });
            decos.forEach((d, k) => gsap.fromTo(d, { x: 120 + k * 80 }, { x: -120 - k * 80, ease: 'none', scrollTrigger: { trigger: spot, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } }));

            // Il primo spot entra con lo scroll verticale, gli altri con quello orizzontale.
            const trigger = i === 0
                ? { trigger: section, start: 'top 60%', toggleActions: 'play none none reverse' }
                : { trigger: spot, containerAnimation: tl, start: 'left 62%', toggleActions: 'play none none reverse' };

            gsap.timeline({ scrollTrigger: trigger, defaults: { ease: 'expo.out' } })
                .from(product, { scale: 0.45, rotation: i % 2 ? 50 : -50, xPercent: 40, autoAlpha: 0, duration: 1.3, ease: 'back.out(1.3)' }, 0)
                .from(price, { scale: 0, rotation: -90, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 0.35)
                .from(info, { x: 90, autoAlpha: 0, duration: 0.9, stagger: 0.07 }, 0.1);
        });

        // Mouse: gli elementi attorno al prodotto si muovono a profondità diverse.
        if (env.fine) {
            spots.forEach((spot) => {
                const layers = [[$('.spot__disc', spot), 14], [$('.spot__price', spot), -26], ...$$('.spot__deco', spot).map((d, k) => [d, 34 + k * 16])]
                    .filter(([el]) => el)
                    .map(([el, amount]) => ({ amount, y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }) }));
                const tilt = gsap.quickTo($('.spot__img', spot), 'rotation', { duration: 1, ease: 'power3' });
                spot.addEventListener('pointermove', (e) => {
                    const nx = e.clientX / window.innerWidth - 0.5;
                    const ny = e.clientY / window.innerHeight - 0.5;
                    layers.forEach((l) => l.y(ny * l.amount));
                    tilt(nx * 10);
                }, { passive: true });
            });
        }

        return () => gsap.set([section, track], { clearProps: 'all' });
    });

    /* Mobile: card impilate --------------------------------------------------- */
    mm.add('(max-width: 900px)', () => {
        spots.forEach((spot, i) => {
            gsap.timeline({ scrollTrigger: { trigger: spot, start: 'top 82%', once: true }, defaults: { ease: 'expo.out' } })
                .from(spot, { y: 80, autoAlpha: 0, scale: 0.94, duration: 1 }, 0)
                .from($('.spot__product', spot), { scale: 0.5, rotation: i % 2 ? 40 : -40, duration: 1.2, ease: 'back.out(1.4)' }, 0.1)
                .from($('.spot__price', spot), { scale: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }, 0.5)
                .from($$('.spot__info > *', spot), { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.25);
        });
    });

    // Galleggiamento continuo (indipendente dal layout).
    $$('.spot__img', section).forEach((img, i) => gsap.to(img, { y: -16, duration: 2.4 + i * 0.25, ease: 'sine.inOut', repeat: -1, yoyo: true }));
    $$('.spot__disc', section).forEach((disc, i) => gsap.to(disc, { scale: 1.06, duration: 3 + i * 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true }));
}
