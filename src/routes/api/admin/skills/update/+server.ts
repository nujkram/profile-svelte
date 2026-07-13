import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';
import { isStaleWrite, staleWriteResponse } from '$lib/server/concurrency';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const { user }: any = locals;
	const data = await request.json();
	const db = await clientPromise();
	const Profile = db.collection('profile');

	data._id = id();
	const profile = await Profile.findOne({ username: user.username });
	if (isStaleWrite(profile, data.baseUpdatedAt)) return staleWriteResponse();
	const profileUpdate = {
		$set: {
			updatedAt: new Date(),
			updatedBy: locals.user._id,
			skills: data.cart
		}
	};

	let response: unknown;

	if (profile) {
		response = await Profile.updateOne({ _id: profile._id }, profileUpdate);
	} else {
		response = await Profile.insertOne(data);
	}

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Data updated successfully',
				response
			})
		);
	}
};
