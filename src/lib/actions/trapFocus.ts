import type { Action } from 'svelte/action';

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus inside the node while mounted and restores focus to the
 * previously focused element (usually the trigger) on destroy.
 */
export const trapFocus: Action<HTMLElement> = (node) => {
	const previouslyFocused = document.activeElement as HTMLElement | null;

	const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));

	focusables()[0]?.focus();

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Tab') return;
		const items = focusables();
		if (!items.length) return;

		const first = items[0];
		const last = items[items.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			previouslyFocused?.focus();
		}
	};
};
