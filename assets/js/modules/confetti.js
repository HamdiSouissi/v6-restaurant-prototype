/**
 * confetti.js — coriandoli leggeri su canvas (nessuna libreria).
 * Il loop gira solo finché ci sono particelle vive.
 */
import { $, PALETTE, rand, pick, env } from './utils.js';

let canvas, ctx, dpr = 1;
let particles = [];
let running = false;

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
}

function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    for (const p of particles) {
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.translate(p.x * dpr, p.y * dpr);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.rot * 1.7)); // effetto "foglietto che gira"
        ctx.fillStyle = p.color;
        const s = p.size * dpr;
        if (p.shape === 0) ctx.fillRect(-s / 2, -s / 4, s, s / 2);
        else { ctx.beginPath(); ctx.arc(0, 0, s / 2.4, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    }
    if (!particles.length) {
        running = false;
        gsap.ticker.remove(tick);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Lancia una manciata di coriandoli.
 * @param {{x?: number, y?: number, count?: number, spread?: number, power?: number, angle?: number}} options — x/y in px (viewport)
 */
export function confetti({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 70, spread = Math.PI * 2, power = 11, angle = -Math.PI / 2 } = {}) {
    if (env.reduced) return;
    if (!canvas) {
        canvas = $('#confetti');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize, { passive: true });
    }
    for (let i = 0; i < count; i++) {
        const a = angle + rand(-spread / 2, spread / 2);
        const v = rand(power * 0.35, power);
        particles.push({
            x, y,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            gravity: rand(0.18, 0.32),
            size: rand(7, 13),
            rot: rand(0, Math.PI * 2),
            spin: rand(-0.25, 0.25),
            color: pick(PALETTE),
            shape: Math.random() < 0.7 ? 0 : 1,
            life: rand(70, 130),
        });
    }
    if (!running) { running = true; gsap.ticker.add(tick); }
}

/** Coriandoli che partono dal centro di un elemento. */
export function confettiFrom(el, options = {}) {
    if (!el) return confetti(options);
    const r = el.getBoundingClientRect();
    return confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...options });
}
