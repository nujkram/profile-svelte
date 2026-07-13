export const ssr = false;
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }: { locals: unknown }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { user }: any = locals;
	const db = await clientPromise();
	const Profile = db.collection('profile');

	const profile = await Profile.findOne({ username: user.username });

	const Messages = db.collection('messages');
	const messageCount = await Messages.countDocuments();
	const unreadMessageCount = await Messages.countDocuments({ isRead: false });

	// Page views over the last 30 days (aggregate daily counters)
	const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
	const views = await db
		.collection('pageviews')
		.aggregate([
			{ $match: { date: { $gte: since } } },
			{ $group: { _id: null, total: { $sum: '$count' } } }
		])
		.toArray();
	const viewCount = views[0]?.total || 0;

	return {
		user,
		profile,
		messageCount,
		unreadMessageCount,
		viewCount
	};
}
