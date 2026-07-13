import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals }: any) => {
	if (!locals.user) {
		throw error(401, 'This dashboard belongs to someone. That someone is not you (yet).');
	}
	return {};
};
