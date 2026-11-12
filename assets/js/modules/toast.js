/**
 * toast.js — notifiche brevi in basso (aggiunta al carrello, copie, avvisi).
 */
import { $, html, icon, esc, thumb } from './utils.js';

const MAX = 3;

/**
 * @param {{text: string, strong?: string, img?: string, color?: string, icon?: string, duration?: number}} options
 */
export function toast({ text, strong = '', img = '', color = '', icon: iconName = 'check-line', duration = 2600 }) {
    const host = $('#toasts');
    if (!host) return;

    const media = img ? `<img src="${thumb(img)}" alt="" width="40" height="40">` : icon(iconName);
    const el = html(`<div class="toast"><span class="toast__thumb"${color ? ` style="--scene:${color}"` : ''}>${media}</span><span>${strong ? `<strong>${esc(strong)}</strong> ` : ''}${esc(text)}</span></div>`);
    host.append(el);
    while (host.children.length > MAX) host.firstElementChild.remove();

    gsap.fromTo(el, { y: 40, scale: 0.8, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.8)' });
    gsap.to(el, { y: -16, autoAlpha: 0, duration: 0.4, ease: 'power2.in', delay: duration / 1000, onComplete: () => el.remove() });
}
