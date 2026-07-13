/**
 * One-off seed for the 10 existing testimonials (migrated from the previous
 * profile site). Images live in static/testimonials/ and are served at
 * /testimonials/*.jpg.
 *
 * Usage (from the project root, with DATABASE_URL in your environment or .env):
 *   node scripts/seed-testimonials.mjs --id=u5SvL75s6Cu393mZY   # target a profile by _id
 *   node scripts/seed-testimonials.mjs --username=nujkram        # target a profile by username
 *   node scripts/seed-testimonials.mjs nujkram                   # shorthand: username
 *
 * It only writes the `testimonials` field of your profile document; nothing
 * else is touched. Safe to re-run (it overwrites `testimonials`).
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const idArg = process.argv.find((arg) => arg.startsWith('--id='))?.slice('--id='.length);
const usernameArg =
	process.argv.find((arg) => arg.startsWith('--username='))?.slice('--username='.length) ||
	process.argv.find((arg, i) => i >= 2 && !arg.startsWith('--'));

// Match by _id when given (these are Meteor-style string ids), else by username.
const filter = idArg ? { _id: idArg } : { username: usernameArg || 'nujkram' };

const uri = process.env.DATABASE_URL;
if (!uri) {
	console.error('✗ DATABASE_URL is not set. Add it to your environment or .env file.');
	process.exit(1);
}

const dbName = uri.includes('Staging')
	? 'MyInfoStaging'
	: uri.includes('Test')
		? 'MyInfoStagingTest'
		: 'MyInfo';

const testimonials = [
	{
		message: `I knew Mark Jun was the perfect guy for the IT stuff. He is a true professional. I've worked with him on almost all our major projects in our civic organization and IT needs in our company. He is deeply multi-tasker, he make sure to finish his task on or before deadlines. Trusted and creative even on the new world of IT.`,
		image: `/testimonials/testimonials-1.jpg`,
		name: `Evy Grace Yap`,
		position: `Dealer Sales Coordinator`,
		company: `Petron Gasul LPG Industry`
	},
	{
		message: `I first got to know Mark in a professional basis (we worked together at Spring Valley). Mark is THE IT GUY with endless creativity - He is one of the most productive person I have ever met. Always curious. Always takes initiatives. In a personal manner, Mark is also enthusiastic and very caring which makes him someone you would be friends with for life.`,
		image: `/testimonials/testimonials-2.jpg`,
		name: `Rovi Anne Obamos`,
		position: `Administrative Assistant`,
		company: `Roxas Government`
	},
	{
		message: `Mark has proven time and again to be quick on his feet in adapting new technologies and implementing tried and tested solutions to a variety of end-user needs. He has a keen observational mind and can analyze requirements and synthesize the right approach to a myriad of projects.`,
		image: `/testimonials/testimonials-3.jpg`,
		name: `Jorge Cosgayon`,
		position: `Full Stack Developer/Solutions Architect`,
		company: ``
	},
	{
		message: `You're a coding Rocks star Mark! Keep it up!`,
		image: `/testimonials/testimonials-4.jpg`,
		name: `Jayson Repil`,
		position: `Quality Assurance`,
		company: `Roxas Government`
	},
	{
		message: `Mark Jun has been a qualified professor teaching different programming languages and other IT professional subjects in the University. With his acquired skills in the field of IT, he has grown professionally and is now a solid IT specialist. A passionate, self disciplined and open minded person, full of dreams to create a better future in the IT world.`,
		image: `/testimonials/testimonials-5.jpg`,
		name: `Jonah Gafate`,
		position: `Dean, College of Computer Studies`,
		company: `Filamer Christian University`
	},
	{
		message: `Mark was an excellent mentor, not only to me but also to all of my colleagues who were under his guiding hand during his time as our mentor. When it comes to the field of technology, particularly "programming", Mark's talent is unrivaled; But he is always willing to help and share his knowledge with others, and he is not selfish in this regard. I know this because I worked with him for a company once, and that's where I saw Mark's goodness in effect. I can say that Mark is a big part of my current success, and I owe him a huge respect and gratitude for that.`,
		image: `/testimonials/testimonials-6.jpg`,
		name: `Kim Ralf Mentino`,
		position: `Co-Founder`,
		company: `Coders-Tribe IT Solutions`
	},
	{
		message: `It has been a real pleasure working with Sir Mark. He has been very professional and very clear in all communications, which I appreciate.`,
		image: `/testimonials/testimonials-7.jpg`,
		name: `Neo Jay Andong`,
		position: `Software Engineer`,
		company: `Telcom Live Content Inc.`
	},
	{
		message: `Mark Jun was my college adviser and he is really good in programming, he can learn a programming language in no time. I could say that I'm one of his successor in IT industry. He's really a good friend of mine. mua mua tsup tsup!`,
		image: `/testimonials/testimonials-8.jpg`,
		name: `Martin Rupert Bulquerin`,
		position: `Front-end Web Developer`,
		company: `XtendOps Inc.`
	},
	{
		message: `Mark is one of my favorite, he is the team leader of our project and allocate appropriate tasks to his teammates. Mark is very excellent in all aspect of project development, he has a wide skill set and has a high level of professional knowledge of his job and the one I loved the most about Mark aside from his strong work ethic, he has a humurous character and soothing personality that creates a positive atmosphere.`,
		image: `/testimonials/testimonials-9.jpg`,
		name: `Joyce E. Digma`,
		position: `Project Manager`,
		company: `Telcom Live Content Inc.`
	},
	{
		message: `Mark as I know him works smart which is typical of a computer programmer. He finds solution to problems and works on it with passion.`,
		image: `/testimonials/testimonials-10.jpg`,
		name: `Rey Cordenillo`,
		position: `Manager`,
		company: `Capiz Electric Cooperative`
	}
];

const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });

try {
	await client.connect();
	const db = client.db(dbName);
	const profiles = db.collection('profile');

	// Confirm exactly one profile matches before writing anything.
	const target = await profiles.findOne(filter);
	if (!target) {
		console.error(
			`✗ No profile found matching ${JSON.stringify(filter)} in db "${dbName}".`
		);
		process.exit(1);
	}
	console.log(
		`→ Matched profile _id="${target._id}" (name: ${target.firstName ?? '?'} ${
			target.lastName ?? ''
		}, username: ${target.username ?? 'n/a'}) in db "${dbName}".`
	);

	const result = await profiles.updateOne(filter, {
		$set: { testimonials, updatedAt: new Date() }
	});

	console.log(
		`✓ Seeded ${testimonials.length} testimonials (matched ${result.matchedCount}, modified ${result.modifiedCount}).`
	);
} catch (error) {
	console.error('✗ Seed failed:', error);
	process.exit(1);
} finally {
	await client.close();
}
