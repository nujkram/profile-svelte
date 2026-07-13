<script lang="ts">
	// Mirrors the .dark class set by the FOUC-guard script in app.html.
	let dark = $state(false);

	$effect(() => {
		dark = document.documentElement.classList.contains('dark');

		const handleStorage = (event: StorageEvent) => {
			if (event.key === 'theme') {
				dark = event.newValue === 'dark';
				document.documentElement.classList.toggle('dark', dark);
			}
		};

		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	});

	const toggle = () => {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	};
</script>

<button
	type="button"
	class="btn-icon btn-icon-ghost"
	title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
	aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
	onclick={toggle}
>
	{#if dark}
		<!-- sun -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
			/>
		</svg>
	{:else}
		<!-- moon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</svg>
	{/if}
</button>
