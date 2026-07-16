// Client-side analytics helpers. Everything here is fire-and-forget and
// aggregate-only; each helper no-ops for visitors with Do Not Track.

const dnt = () => typeof navigator !== 'undefined' && navigator.doNotTrack === '1';

const beacon = (payload: Record<string, unknown>) => {
	const body = JSON.stringify(payload);
	if (navigator.sendBeacon?.('/api/pageview', new Blob([body], { type: 'application/json' }))) {
		return;
	}
	fetch('/api/pageview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body,
		keepalive: true
	}).catch(() => {});
};

/** Record a conversion event (social click, project link, contact submit…). */
export const trackEvent = (event: string) => {
	if (dnt()) return;
	beacon({ path: location.pathname, event });
};

// --- Section reach -------------------------------------------------------

let seenSections = new Set<string>();
let observer: IntersectionObserver | undefined;

/**
 * Watch every `section[id]` inside <main> on the current page and remember
 * which ones the visitor actually reached. Call after each navigation;
 * previous observers are torn down.
 */
export const observeSections = () => {
	observer?.disconnect();
	seenSections = new Set();
	if (dnt() || typeof IntersectionObserver === 'undefined') return;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && entry.target.id) {
					seenSections.add(entry.target.id);
					observer?.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.4 }
	);
	document.querySelectorAll('main section[id]').forEach((el) => observer?.observe(el));
};

/** Drain the set of sections seen since the last call/navigation. */
export const takeSections = (): string[] => {
	const sections = [...seenSections];
	seenSections = new Set();
	return sections;
};
