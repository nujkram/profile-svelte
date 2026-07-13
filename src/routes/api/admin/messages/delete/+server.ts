import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }: any) => {
	const { _id } = await request.json();
	const db = await clientPromise();
	const Messages = db.collection('messages');

	const response = await Messages.deleteOne({ _id });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'Message deleted',
			response
		})
	);
};
