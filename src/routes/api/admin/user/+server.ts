import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }: any) => {
    const db = await clientPromise();
    const Users = db.collection('users');

    // Never expose credentials: services holds password hashes and session login tokens.
    const response = await Users.find({}, { projection: { services: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}
