import type { Action } from 'svelte/action';

/** Calls the callback when a pointer event lands outside the node. */
export const clickOutside: Action<HTMLElement, () => void> = (node, callback) => {
	const handler = (event: PointerEvent) => {
		if (!node.contains(event.target as Node)) callback();
	};

	document.addEventListener('pointerdown', handler, true);

	return {
		destroy() {
			document.removeEventListener('pointerdown', handler, true);
		}
	};
};
