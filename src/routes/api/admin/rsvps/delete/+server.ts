import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	const { _id } = await request.json();
	const db = await clientPromise();
	const Rsvps = db.collection<any>('rsvps');

	const response = await Rsvps.deleteOne({ _id: String(_id) });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'RSVP deleted',
			response
		})
	);
};
