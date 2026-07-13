import type { Action } from 'svelte/action';

type RevealOptions = {
	/** How far below the viewport edge the element must be before revealing. */
	rootMargin?: string;
	/** Delay in ms, useful for staggering siblings. */
	delay?: number;
};

/**
 * Reveals the element with a fade/rise once it scrolls into view.
 * Pairs with the `.gsap-reveal` starting styles in app.postcss.
 */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options = {}) => {
	const { rootMargin = '0px 0px -10% 0px', delay = 0 } = options;

	node.classList.add('gsap-reveal');
	node.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
	node.style.transitionDelay = `${delay}ms`;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.style.opacity = '1';
					node.style.transform = 'none';
					observer.disconnect();
				}
			}
		},
		{ rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
