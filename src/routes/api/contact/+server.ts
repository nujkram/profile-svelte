import { json } from '@sveltejs/kit';
import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

const MAX_PER_HOUR = 5;

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, getClientAddress }: any) => {
	let data: any;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request' }, { status: 400 });
	}

	const name = String(data?.name ?? '').trim();
	const email = String(data?.email ?? '').trim();
	const message = String(data?.message ?? '').trim();
	const honeypot = String(data?.company ?? '').trim();

	// Bots fill every field; humans never see this one. Pretend it worked.
	if (honeypot) return json({ status: 'Success', message: 'Message sent' });

	if (!name || name.length > 120) {
		return json({ status: 'Error', message: 'Please tell me your name' }, { status: 400 });
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
		return json({ status: 'Error', message: 'That email address looks off' }, { status: 400 });
	}
	if (message.length < 10 || message.length > 5000) {
		return json(
			{ status: 'Error', message: 'Message should be between 10 and 5000 characters' },
			{ status: 400 }
		);
	}

	const db = await clientPromise();
	// This app uses Meteor-style string _ids, not ObjectIds
	const Messages = db.collection<any>('messages');

	const ip = getClientAddress();
	const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
	const recent = await Messages.countDocuments({ ip, createdAt: { $gt: hourAgo } });
	if (recent >= MAX_PER_HOUR) {
		return json(
			{ status: 'Error', message: 'Too many messages — please try again later' },
			{ status: 429 }
		);
	}

	await Messages.insertOne({
		_id: id(),
		name,
		email,
		message,
		ip,
		isRead: false,
		createdAt: new Date()
	});

	return json({ status: 'Success', message: 'Message sent' });
};
