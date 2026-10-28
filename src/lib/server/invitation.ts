import type { Db } from 'mongodb';

// Temporary: Ada & Jin's birthday + baptism invite (Nov 28, 2026).
// Delete this file, src/routes/invite, src/routes/api/rsvp,
// src/routes/api/admin/{invitation,rsvps}, src/routes/dashboard/invitation
// and the sidebar entry once the event is over.

export const INVITATION_ID = 'birthday-2026';

export type Kid = { name: string; milestone: string };

export type Invitation = {
	_id: string;
	title: string;
	date: string;
	dateText: string;
	kids: Kid[];
	baptismTime: string;
	baptismVenue: string;
	baptismAddress: string;
	baptismMapUrl: string;
	partyTime: string;
	partyVenue: string;
	partyAddress: string;
	partyMapUrl: string;
	dressCode: string;
	message: string;
	rsvpDeadline: string;
	rsvpOpen: boolean;
	updatedAt?: Date;
};

export const DEFAULT_INVITATION: Invitation = {
	_id: INVITATION_ID,
	title: "You're invited!",
	date: '2026-11-28',
	dateText: 'Saturday, November 28, 2026',
	kids: [
		{ name: 'Ada Yvaine Gersaniva', milestone: 'Turning 3' },
		{ name: 'Jin Daven Gersaniva', milestone: 'Turning 1 & Christening' }
	],
	baptismTime: '',
	baptismVenue: '',
	baptismAddress: '',
	baptismMapUrl: '',
	partyTime: '',
	partyVenue: '',
	partyAddress: '',
	partyMapUrl: '',
	dressCode: '',
	message:
		"Join us as we celebrate Ada's 3rd birthday and Jin's 1st birthday and baptism. Your presence is the best gift!",
	rsvpDeadline: '',
	rsvpOpen: true
};

const STRING_FIELDS = [
	'title',
	'date',
	'dateText',
	'baptismTime',
	'baptismVenue',
	'baptismAddress',
	'baptismMapUrl',
	'partyTime',
	'partyVenue',
	'partyAddress',
	'partyMapUrl',
	'dressCode',
	'message',
	'rsvpDeadline'
] as const;

/** Fetch the invitation, seeding defaults the first time. */
export const getInvitation = async (db: Db): Promise<Invitation> => {
	const Invitations = db.collection<Invitation>('invitation');
	const doc = await Invitations.findOne({ _id: INVITATION_ID });
	if (doc) return { ...DEFAULT_INVITATION, ...doc };
	await Invitations.insertOne({ ...DEFAULT_INVITATION, updatedAt: new Date() });
	return DEFAULT_INVITATION;
};

/** Keep only known fields, trimmed and length-capped. */
export const sanitizeInvitation = (data: any) => {
	const clean: Record<string, unknown> = {};
	for (const key of STRING_FIELDS) {
		if (data?.[key] !== undefined) {
			clean[key] = String(data[key] ?? '')
				.trim()
				.slice(0, key === 'message' ? 2000 : 300);
		}
	}
	if (Array.isArray(data?.kids)) {
		clean.kids = data.kids.slice(0, 5).map((kid: any) => ({
			name: String(kid?.name ?? '')
				.trim()
				.slice(0, 120),
			milestone: String(kid?.milestone ?? '')
				.trim()
				.slice(0, 120)
		}));
	}
	if (data?.rsvpOpen !== undefined) clean.rsvpOpen = Boolean(data.rsvpOpen);
	return clean;
};

/** Only allow http(s) links so a typo can't become a javascript: URL. */
export const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : '');
