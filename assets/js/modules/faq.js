/**
 * faq.js — accordion: una risposta aperta alla volta, altezza animata.
 */
import { $, $$, env } from './utils.js';

export function initFaq() {
    $$('[data-accordion]').forEach((root) => {
        const items = $$('.accordion__item', root);

        const setOpen = (item, open) => {
            if (item.classList.contains('is-open') === open) return;
            const trigger = $('.accordion__trigger', item);
            const panel = $('.accordion__panel', item);
            const inner = $('.accordion__inner', item);
            const duration = env.reduced ? 0 : 0.65;
            trigger.setAttribute('aria-expanded', String(open));

            if (open) {
                item.classList.add('is-open');
                gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration, ease: 'expo.out', overwrite: true, onComplete: () => ScrollTrigger.refresh() });
                gsap.fromTo(inner, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration, delay: 0.08, overwrite: true });
            } else {
                // Fissa l'altezza corrente prima di togliere la classe (che la porterebbe a 0 di colpo).
                gsap.set(panel, { height: panel.offsetHeight });
                item.classList.remove('is-open');
                gsap.to(panel, { height: 0, duration: duration * 0.8, ease: 'expo.out', overwrite: true });
                gsap.to(inner, { autoAlpha: 0, duration: 0.2, overwrite: true });
            }
        };

        items.forEach((item) => {
            $('.accordion__trigger', item).addEventListener('click', () => {
                const willOpen = !item.classList.contains('is-open');
                items.forEach((other) => other !== item && setOpen(other, false));
                setOpen(item, willOpen);
            });
        });
    });
}
