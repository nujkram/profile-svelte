export type SectionId =
	'about' | 'experience' | 'projects' | 'education' | 'skills' | 'testimonials' | 'contact';

export type Vec3 = [number, number, number];

export type Section = {
	id: SectionId;
	label: string;
	/** What the camera looks at when this section is open. */
	target: Vec3;
	/** Camera position relative to the target. Must stay in the +x/+z quadrant. */
	offset: Vec3;
};

export type Experience = {
	title?: string;
	date?: string;
	company?: string;
	location?: string;
	delegation?: string;
};
export type Project = {
	title?: string;
	description?: string;
	tech?: string;
	link?: string;
	repo?: string;
};
export type Skill = { name?: string; icon?: string };
export type Testimonial = {
	message?: string;
	name?: string;
	position?: string;
	company?: string;
	image?: string;
};

// Loose on purpose: the document comes straight from Mongo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Profile = Record<string, any> & {
	experiences?: Experience[];
	portfolio?: Project[];
	skills?: Skill[];
	testimonials?: Testimonial[];
};

const ALL: Section[] = [
	{ id: 'about', label: 'About', target: [-0.9, 1.5, -2.0], offset: [3.4, 2.0, 4.4] },
	{ id: 'experience', label: 'Experience', target: [-3.9, 2.6, -1.6], offset: [6.2, 1.2, 2.2] },
	{ id: 'projects', label: 'Projects', target: [-1.0, 1.7, -3.4], offset: [1.8, 1.0, 5.2] },
	{ id: 'education', label: 'Education', target: [2.8, 1.5, -3.6], offset: [1.2, 1.2, 6.0] },
	{ id: 'skills', label: 'Skills', target: [-2.7, 2.8, -3.9], offset: [1.8, 0.6, 5.4] },
	{
		id: 'testimonials',
		label: 'Testimonials',
		target: [-3.9, 2.5, 2.2],
		offset: [6.2, 1.0, 1.4]
	},
	{ id: 'contact', label: 'Contact', target: [-3.5, 1.0, -0.5], offset: [5.4, 2.4, 3.4] }
];

/** Whole-room view. */
export const HOME = { target: [0, 1.5, 0] as Vec3, offset: [10.4, 7.6, 10.4] as Vec3 };

/** Sections that have something to show, in the same order as the home page. */
export function availableSections(profile: Profile): Section[] {
	return ALL.filter((section) => {
		if (section.id === 'projects') return Boolean(profile?.portfolio?.length);
		if (section.id === 'testimonials') return Boolean(profile?.testimonials?.length);
		return true;
	});
}

export const techList = (tech = '') =>
	tech
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

export const initials = (name = '') =>
	name
		.split(' ')
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();

/** First four-digit year in a free-text date such as "Jan 2019 - Present". */
export const yearOf = (date = '') => date.match(/\d{4}/)?.[0] ?? '';
