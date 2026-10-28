import clientPromise from '$lib/server/mongo';
import { getInvitation, safeUrl } from '$lib/server/invitation';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const db = await clientPromise();
	const invitation = await getInvitation(db);

	return {
		invitation: {
			...invitation,
			baptismMapUrl: safeUrl(invitation.baptismMapUrl),
			partyMapUrl: safeUrl(invitation.partyMapUrl),
			updatedAt: undefined
		}
	};
}
