import { error } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { generateProfileDocument, type ProfileDocumentType } from '$lib/server/pdf/profileDocument';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params, locals }: any) => {
	const { user } = locals;
	if (!user) throw error(401, 'Unauthorized');

	const type = params.type as ProfileDocumentType;
	if (type !== 'resume' && type !== 'cv') throw error(404, 'Unknown document type');

	const db = await clientPromise();
	const Profile = db.collection('profile');
	const profile = await Profile.findOne({ username: user.username });
	if (!profile) throw error(404, 'Profile not found');

	const pdf = await generateProfileDocument(profile, type);

	const fullName = [profile.firstName, profile.lastName].filter(Boolean).join('_') || 'profile';
	const filename = `${fullName}_${type === 'cv' ? 'CV' : 'Resume'}.pdf`;

	return new Response(new Uint8Array(pdf), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Cache-Control': 'no-store'
		}
	});
};
