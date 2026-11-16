import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from 'three';

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

function finish(canvas: HTMLCanvasElement) {
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

/** A rounded pill with text, for sprites that float above objects. */
export function labelTexture(text: string, bg: string, fg: string) {
	const size = 44;
	const padX = 26;
	const height = 80;
	const probe = document.createElement('canvas').getContext('2d')!;
	probe.font = `600 ${size}px ${FONT}`;
	const width = Math.ceil(probe.measureText(text).width) + padX * 2;

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = bg;
	ctx.beginPath();
	ctx.roundRect(0, 0, width, height, height / 2);
	ctx.fill();
	ctx.font = `600 ${size}px ${FONT}`;
	ctx.fillStyle = fg;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, width / 2, height / 2 + 3);

	return { texture: finish(canvas), aspect: width / height };
}

/** The monitor: a tiny editor window listing project titles. */
export function screenTexture(titles: string[], bg: string, accent: string, accent2: string) {
	const canvas = document.createElement('canvas');
	canvas.width = 512;
	canvas.height = 320;
	const ctx = canvas.getContext('2d')!;

	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, 512, 320);
	ctx.fillStyle = 'rgba(255,255,255,0.08)';
	ctx.fillRect(0, 0, 512, 44);
	['#f87171', '#fbbf24', '#34d399'].forEach((dot, i) => {
		ctx.fillStyle = dot;
		ctx.beginPath();
		ctx.arc(26 + i * 26, 22, 8, 0, Math.PI * 2);
		ctx.fill();
	});

	ctx.textBaseline = 'middle';
	const rows = titles.length ? titles.slice(0, 5) : ['hello world'];
	rows.forEach((title, i) => {
		const y = 82 + i * 48;
		ctx.fillStyle = i % 2 ? accent2 : accent;
		ctx.font = `700 26px ui-monospace, Menlo, monospace`;
		ctx.fillText('>', 24, y);
		ctx.fillStyle = '#e2e8f0';
		ctx.font = `600 26px ${FONT}`;
		let text = title;
		while (text.length > 3 && ctx.measureText(text).width > 430) text = text.slice(0, -2);
		ctx.fillText(text === title ? text : `${text.trimEnd()}…`, 54, y);
	});

	return finish(canvas);
}

/**
 * Rasterises an SVG string (skill icons are stored as raw SVG in the database).
 * Resolves to null if the browser can't draw it, so callers can leave the tile blank.
 */
export function svgTexture(svg: string, color: string): Promise<Texture | null> {
	return new Promise((resolve) => {
		if (!svg || !svg.includes('<svg')) return resolve(null);
		let markup = svg.replace(/currentColor/g, color);
		if (!/xmlns=/.test(markup)) {
			markup = markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
		}
		// A default fill for icons that rely on the page's `fill: currentColor` rule.
		markup = markup.replace('<svg', `<svg fill="${color}"`);

		const image = new Image();
		image.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				canvas.width = 128;
				canvas.height = 128;
				canvas.getContext('2d')!.drawImage(image, 14, 14, 100, 100);
				resolve(finish(canvas));
			} catch {
				resolve(null);
			}
		};
		image.onerror = () => resolve(null);
		image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	});
}

/** Loads an image and crops it to a centred square. */
export function squarePhoto(url: string): Promise<Texture | null> {
	return new Promise((resolve) => {
		new TextureLoader().load(
			url,
			(texture) => {
				texture.colorSpace = SRGBColorSpace;
				const { width, height } = texture.image as { width: number; height: number };
				if (width > height) {
					texture.repeat.set(height / width, 1);
					texture.offset.set((1 - height / width) / 2, 0);
				} else if (height > width) {
					texture.repeat.set(1, width / height);
					texture.offset.set(0, (1 - width / height) / 2);
				}
				resolve(texture);
			},
			undefined,
			() => resolve(null)
		);
	});
}
