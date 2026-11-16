import { getContext, setContext } from 'svelte';
import type { SectionId } from './sections';

/** Reads a `--color-*` RGB triplet token from app.postcss as a CSS colour string. */
function token(name: string, fallback: string) {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	const parts = raw.split(/\s+/).filter(Boolean);
	return parts.length === 3 ? `rgb(${parts.join(',')})` : fallback;
}

export function buildPalette(dark: boolean) {
	const primary = token('--color-primary-500', '#3b82f6');
	const primaryDeep = token('--color-primary-700', '#1d4ed8');
	const tertiary = token('--color-tertiary-400', '#22d3ee');

	return {
		dark,
		primary,
		primaryDeep,
		tertiary,
		background: dark ? token('--color-surface-950', '#020617') : '#e8f1fb',
		wall: dark ? '#33415f' : '#e6edf7',
		wallTrim: dark ? '#1f2a44' : '#c5d2e6',
		floor: dark ? '#5a4634' : '#d9b48a',
		floorEdge: dark ? '#3b2d22' : '#b58f66',
		rug: dark ? primaryDeep : primary,
		rugTrim: tertiary,
		wood: dark ? '#7a5a3e' : '#b98555',
		woodDark: dark ? '#4f3a29' : '#8a5f3a',
		metal: dark ? '#64748b' : '#94a3b8',
		plastic: dark ? '#1e293b' : '#334155',
		paper: dark ? '#cbd5e1' : '#ffffff',
		cork: dark ? '#8a6a48' : '#c99b6b',
		board: dark ? '#475569' : '#f1f5f9',
		plant: dark ? '#2f7d4f' : '#3fae6b',
		pot: dark ? '#9a4b3c' : '#d9735b',
		skin: '#c9906a',
		hair: '#17120f',
		shirt: dark ? '#1b1e26' : '#16181d',
		collar: dark ? '#2c313d' : '#262a33',
		chair: dark ? primaryDeep : primary,
		trousers: dark ? '#1e293b' : '#334155',
		sky: dark ? '#0b1736' : '#9fd3ff',
		lamp: '#ffd27a',
		screen: dark ? '#0b1224' : '#101a33',
		notes: ['#fde68a', '#a7f3d0', '#fbcfe8', '#bae6fd', '#ddd6fe'],
		books: [primary, tertiary, '#f59e0b', '#f43f5e', '#10b981', '#8b5cf6'],
		labelBg: dark ? '#0f172a' : '#ffffff',
		labelFg: dark ? '#f1f5f9' : '#0f172a'
	};
}

export type Palette = ReturnType<typeof buildPalette>;

/** Tracks the `.dark` class that ThemeToggle flips on <html>. Call during component init. */
export function watchDarkMode() {
	let dark = $state(document.documentElement.classList.contains('dark'));

	$effect(() => {
		const root = document.documentElement;
		const observer = new MutationObserver(() => {
			dark = root.classList.contains('dark');
		});
		observer.observe(root, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	return {
		get dark() {
			return dark;
		}
	};
}

export type DioramaContext = {
	readonly pal: Palette;
	readonly active: SectionId | null;
	readonly reducedMotion: boolean;
	/** Height for fixed-size labels, as a fraction of the view. */
	readonly labelHeight: number;
	/** Shared scene state that one object changes and another reacts to. */
	readonly stage: { phoneLifted: boolean; holdPanel: boolean };
	/** The ceiling light, flipped by the wall switch or the header button. */
	readonly lightOn: boolean;
	toggleLight: () => void;
	select: (id: SectionId) => void;
	close: () => void;
};

const KEY = Symbol('diorama');

export const setDiorama = (context: DioramaContext) => setContext(KEY, context);
export const getDiorama = () => getContext<DioramaContext>(KEY);
