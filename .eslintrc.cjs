/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		// Loose data flows from Mongo end to end in this codebase; typing it
		// properly is a larger refactor than a lint rule should force.
		'@typescript-eslint/no-explicit-any': 'off',
		// Allow _ placeholders in destructuring and each-blocks
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
		],
		// eslint-plugin-svelte 2.x doesn't recognise Svelte 5 warning codes
		// (e.g. state_referenced_locally), so it wrongly flags those ignores.
		'svelte/no-unused-svelte-ignore': 'off',
		// {@html} renders owner-controlled icon SVGs and JSON-LD only.
		'svelte/no-at-html-tags': 'off'
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};
