import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Animate a counter from 0 to a target number.
 */
export function animateCounter(element: HTMLElement, target: number, duration: number = 2) {
	const obj = { value: 0 };
	gsap.to(obj, {
		value: target,
		duration,
		ease: 'power2.out',
		onUpdate: () => {
			element.textContent = Math.round(obj.value).toString();
		}
	});
}
