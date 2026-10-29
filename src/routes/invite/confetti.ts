// Tiny canvas confetti for the invite page — no dependency needed.

const COLORS = ['#fda4af', '#fb7185', '#7dd3fc', '#38bdf8', '#fcd34d', '#c4b5fd', '#86efac'];

type Options = {
	/** Burst origin as a fraction of the viewport (0–1). */
	x?: number;
	y?: number;
	count?: number;
	/** Spread in degrees around straight up. */
	spread?: number;
	/** Initial speed in px per frame. */
	speed?: number;
};

type Piece = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	color: string;
	angle: number;
	spin: number;
	shape: 'rect' | 'circle';
	life: number;
};

export const confetti = ({
	x = 0.5,
	y = 0.4,
	count = 90,
	spread = 100,
	speed = 11
}: Options = {}) => {
	if (typeof window === 'undefined') return;
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const canvas = document.createElement('canvas');
	const ratio = window.devicePixelRatio || 1;
	canvas.width = innerWidth * ratio;
	canvas.height = innerHeight * ratio;
	Object.assign(canvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
		zIndex: '60'
	});
	canvas.setAttribute('aria-hidden', 'true');
	document.body.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	if (!ctx) return canvas.remove();
	ctx.scale(ratio, ratio);

	const pieces: Piece[] = Array.from({ length: count }, () => {
		const angle = ((-90 + (Math.random() - 0.5) * spread) * Math.PI) / 180;
		const velocity = speed * (0.5 + Math.random() * 0.7);
		return {
			x: x * innerWidth,
			y: y * innerHeight,
			vx: Math.cos(angle) * velocity,
			vy: Math.sin(angle) * velocity,
			size: 6 + Math.random() * 6,
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			angle: Math.random() * Math.PI,
			spin: (Math.random() - 0.5) * 0.3,
			shape: Math.random() < 0.3 ? 'circle' : 'rect',
			life: 1
		};
	});

	const tick = () => {
		ctx.clearRect(0, 0, innerWidth, innerHeight);
		let alive = 0;
		for (const p of pieces) {
			if (p.life <= 0) continue;
			p.vy += 0.25; // gravity
			p.vx *= 0.99; // drag
			p.x += p.vx;
			p.y += p.vy;
			p.angle += p.spin;
			if (p.vy > 0) p.life -= 0.008;
			if (p.y > innerHeight + 20) p.life = 0;
			if (p.life <= 0) continue;
			alive++;

			ctx.save();
			ctx.globalAlpha = Math.min(1, p.life * 1.5);
			ctx.translate(p.x, p.y);
			ctx.rotate(p.angle);
			ctx.fillStyle = p.color;
			if (p.shape === 'circle') {
				ctx.beginPath();
				ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
				ctx.fill();
			} else {
				// Flutter: squash the width as the piece "turns"
				ctx.fillRect(
					-p.size / 2,
					-p.size / 4,
					p.size * Math.abs(Math.cos(p.angle * 2)),
					p.size / 2
				);
			}
			ctx.restore();
		}
		if (alive) requestAnimationFrame(tick);
		else canvas.remove();
	};
	requestAnimationFrame(tick);
};
