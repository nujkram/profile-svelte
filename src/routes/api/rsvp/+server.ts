import { json } from '@sveltejs/kit';
import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';
import { getInvitation } from '$lib/server/invitation';

const MAX_PER_HOUR = 20;

let indexReady = false;

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, getClientAddress }: any) => {
	let data: any;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request' }, { status: 400 });
	}

	const name = String(data?.name ?? '')
		.trim()
		.replace(/\s+/g, ' ');
	const attending = Boolean(data?.attending);
	const plusOne = attending && Boolean(data?.plusOne);
	const plusOneName = plusOne
		? String(data?.plusOneName ?? '')
				.trim()
				.replace(/\s+/g, ' ')
		: '';
	const kids = attending ? Number(data?.kids ?? 0) : 0;
	const honeypot = String(data?.company ?? '').trim();

	// Bots fill every field; humans never see this one. Pretend it worked.
	if (honeypot) return json({ status: 'Success', message: 'RSVP received' });

	if (!name || name.length > 120) {
		return json({ status: 'Error', message: 'Please enter your name' }, { status: 400 });
	}
	if (plusOne && (!plusOneName || plusOneName.length > 120)) {
		return json({ status: 'Error', message: "Please enter your plus-one's name" }, { status: 400 });
	}
	if (!Number.isInteger(kids) || kids < 0 || kids > 10) {
		return json({ status: 'Error', message: 'Number of kids should be 0–10' }, { status: 400 });
	}

	const db = await clientPromise();
	const invitation = await getInvitation(db);
	if (!invitation.rsvpOpen) {
		return json({ status: 'Error', message: 'RSVPs are closed' }, { status: 403 });
	}

	// This app uses Meteor-style string _ids, not ObjectIds
	const Rsvps = db.collection<any>('rsvps');
	if (!indexReady) {
		await Rsvps.createIndex({ nameKey: 1 }, { unique: true });
		indexReady = true;
	}

	const ip = getClientAddress();
	const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
	const recent = await Rsvps.countDocuments({ ip, updatedAt: { $gt: hourAgo } });
	if (recent >= MAX_PER_HOUR) {
		return json(
			{ status: 'Error', message: 'Too many RSVPs — please try again later' },
			{ status: 429 }
		);
	}

	// Same name (any casing) overwrites the earlier answer
	const now = new Date();
	await Rsvps.updateOne(
		{ nameKey: name.toLowerCase() },
		{
			$set: { name, attending, plusOne, plusOneName, kids, ip, updatedAt: now },
			$setOnInsert: { _id: id(), createdAt: now }
		},
		{ upsert: true }
	);

	return json({ status: 'Success', message: 'RSVP received' });
};
