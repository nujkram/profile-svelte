import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** Build a 50–950 color scale backed by CSS custom properties (see app.postcss). */
const scale = (name: string) =>
	Object.fromEntries(
		[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
			step,
			`rgb(var(--color-${name}-${step}) / <alpha-value>)`
		])
	);

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: scale('primary'),
				tertiary: scale('tertiary'),
				surface: scale('surface'),
				success: colors.emerald,
				error: colors.rose,
				warning: colors.amber
			}
		}
	},
	plugins: [forms({ strategy: 'class' }), typography]
} satisfies Config;
