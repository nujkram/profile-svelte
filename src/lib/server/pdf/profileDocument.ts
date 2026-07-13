import PDFDocument from 'pdfkit';

export type ProfileDocumentType = 'resume' | 'cv';

// Formal palette — deep blue accent matches the site's primary-700, neutral grays for text.
const INK = '#1f2937';
const BODY = '#374151';
const MUTED = '#6b7280';
const ACCENT = '#1d4ed8';
const RULE = '#e5e7eb';

const MARGIN = 48;
const PAGE_WIDTH = 595.28; // A4 portrait, points
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type Doc = InstanceType<typeof PDFDocument>;

const ensureSpace = (doc: Doc, needed: number) => {
	if (doc.y + needed > doc.page.height - doc.page.margins.bottom) doc.addPage();
};

const sectionTitle = (doc: Doc, label: string) => {
	ensureSpace(doc, 70);
	doc.moveDown(1.2);
	doc
		.font('Helvetica-Bold')
		.fontSize(10.5)
		.fillColor(ACCENT)
		.text(label.toUpperCase(), MARGIN, doc.y, { characterSpacing: 1.5 });
	const y = doc.y + 3;
	doc
		.moveTo(MARGIN, y)
		.lineTo(MARGIN + CONTENT_WIDTH, y)
		.lineWidth(0.5)
		.stroke(RULE);
	doc.y = y + 10;
};

/** Draw a heading with a right-aligned date on the same line, handling wrapping. */
const headingWithDate = (doc: Doc, heading: string, date: string) => {
	const dateWidth = 110;
	const y = doc.y;
	doc
		.font('Helvetica-Bold')
		.fontSize(11)
		.fillColor(INK)
		.text(heading, MARGIN, y, { width: CONTENT_WIDTH - dateWidth - 8 });
	const yAfterHeading = doc.y;
	if (date) {
		doc
			.font('Helvetica')
			.fontSize(9.5)
			.fillColor(MUTED)
			.text(date, MARGIN + CONTENT_WIDTH - dateWidth, y + 1.5, {
				width: dateWidth,
				align: 'right'
			});
	}
	doc.y = Math.max(yAfterHeading, doc.y);
	doc.x = MARGIN;
};

const paragraph = (doc: Doc, text: string, options: { size?: number; color?: string } = {}) => {
	doc
		.font('Helvetica')
		.fontSize(options.size ?? 10)
		.fillColor(options.color ?? BODY)
		.text(text, MARGIN, doc.y, { width: CONTENT_WIDTH, align: 'justify', lineGap: 2 });
};

const drawPhoto = (doc: Doc, image: string | undefined, x: number, y: number, diameter: number) => {
	const match = /^data:image\/(?:png|jpe?g);base64,(.+)$/.exec(image ?? '');
	if (!match) return false;
	try {
		const buffer = Buffer.from(match[1], 'base64');
		doc.save();
		doc.circle(x + diameter / 2, y + diameter / 2, diameter / 2).clip();
		doc.image(buffer, x, y, { cover: [diameter, diameter], align: 'center', valign: 'center' });
		doc.restore();
		doc
			.circle(x + diameter / 2, y + diameter / 2, diameter / 2)
			.lineWidth(1)
			.stroke(ACCENT);
		return true;
	} catch {
		return false;
	}
};

const header = (doc: Doc, profile: any, type: ProfileDocumentType) => {
	const photoDiameter = 68;
	const hasPhoto = drawPhoto(
		doc,
		profile?.image,
		MARGIN + CONTENT_WIDTH - photoDiameter,
		MARGIN,
		photoDiameter
	);
	const textWidth = hasPhoto ? CONTENT_WIDTH - photoDiameter - 16 : CONTENT_WIDTH;

	const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Unnamed';
	doc.font('Helvetica-Bold').fontSize(24).fillColor(INK);
	if (profile?.credentials) {
		doc.text(fullName, MARGIN, MARGIN, { width: textWidth, continued: true });
		doc.font('Helvetica').fontSize(13).fillColor(MUTED).text(`, ${profile.credentials}`);
	} else {
		doc.text(fullName, MARGIN, MARGIN, { width: textWidth });
	}

	if (profile?.workTitle) {
		doc.moveDown(0.2);
		doc
			.font('Helvetica-Oblique')
			.fontSize(12)
			.fillColor(ACCENT)
			.text(profile.workTitle, MARGIN, doc.y, { width: textWidth });
	}

	const contact = [profile?.email, profile?.website, profile?.city, profile?.nationality]
		.filter(Boolean)
		.join('   •   ');
	if (contact) {
		doc.moveDown(0.4);
		doc
			.font('Helvetica')
			.fontSize(9.5)
			.fillColor(MUTED)
			.text(contact, MARGIN, doc.y, { width: textWidth });
	}

	const y = Math.max(doc.y + 14, hasPhoto ? MARGIN + photoDiameter + 12 : 0);
	doc
		.moveTo(MARGIN, y)
		.lineTo(MARGIN + 64, y)
		.lineWidth(2.5)
		.stroke(ACCENT);
	doc
		.moveTo(MARGIN + 64, y)
		.lineTo(MARGIN + CONTENT_WIDTH, y)
		.lineWidth(0.75)
		.stroke(RULE);
	doc.y = y + 4;

	// Document label, right-aligned under the rule
	doc
		.font('Helvetica')
		.fontSize(8)
		.fillColor(MUTED)
		.text(type === 'cv' ? 'CURRICULUM VITAE' : 'RÉSUMÉ', MARGIN, doc.y, {
			width: CONTENT_WIDTH,
			align: 'right',
			characterSpacing: 1.5
		});
};

const summarySection = (doc: Doc, profile: any, type: ProfileDocumentType) => {
	const yearStarted = Number(profile?.yearStarted);
	const years = yearStarted ? new Date().getFullYear() - yearStarted : 0;
	const opener = years
		? `Innovative, task-driven professional with ${years} years of experience in the IT industry and development across diverse industries. `
		: '';
	const summary = [opener + (profile?.about || ''), profile?.experience]
		.filter(Boolean)
		.join(' ')
		.trim();
	if (!summary && !profile?.workBackground && !profile?.expertise) return;

	sectionTitle(doc, 'Professional Summary');
	if (summary) paragraph(doc, summary);
	if (type === 'cv' && profile?.workBackground) {
		doc.moveDown(0.5);
		paragraph(doc, profile.workBackground);
	}
	if (type === 'cv' && profile?.expertise) {
		doc.moveDown(0.5);
		paragraph(doc, profile.expertise);
	}
};

const personalDetailsSection = (doc: Doc, profile: any) => {
	const details: Array<[string, string]> = (
		[
			['Email', profile?.email],
			['Website', profile?.website],
			['Degree', profile?.degree],
			['Nationality', profile?.nationality],
			['City', profile?.city],
			['Civil Status', profile?.civilStatus]
		] as Array<[string, string]>
	).filter(([, value]) => Boolean(value));
	if (!details.length) return;

	sectionTitle(doc, 'Personal Details');
	const columnWidth = CONTENT_WIDTH / 2;
	const rows = Math.ceil(details.length / 2);
	const startY = doc.y;
	details.forEach(([label, value], i) => {
		const column = Math.floor(i / rows);
		const row = i % rows;
		const x = MARGIN + column * columnWidth;
		const y = startY + row * 16;
		doc
			.font('Helvetica-Bold')
			.fontSize(9.5)
			.fillColor(INK)
			.text(`${label}:  `, x, y, { continued: true });
		doc
			.font('Helvetica')
			.fillColor(BODY)
			.text(String(value), { width: columnWidth - 12 });
	});
	doc.y = startY + rows * 16;
	doc.x = MARGIN;
};

const factsSection = (doc: Doc, profile: any) => {
	const facts = Object.entries(profile?.facts ?? {}).filter(([, value]) => value);
	if (!facts.length) return;

	sectionTitle(doc, 'Career Highlights');
	const columnWidth = CONTENT_WIDTH / facts.length;
	const y = doc.y;
	facts.forEach(([key, value], i) => {
		const x = MARGIN + i * columnWidth;
		doc.font('Helvetica-Bold').fontSize(16).fillColor(ACCENT).text(String(value), x, y, {
			width: columnWidth,
			align: 'center'
		});
		doc
			.font('Helvetica')
			.fontSize(8.5)
			.fillColor(MUTED)
			.text(key.toUpperCase(), x, doc.y + 1, {
				width: columnWidth,
				align: 'center',
				characterSpacing: 1
			});
		doc.y = y;
	});
	doc.y = y + 40;
	doc.x = MARGIN;
};

const experienceSection = (doc: Doc, profile: any) => {
	const experiences = [...(profile?.experiences ?? [])].reverse(); // stored oldest-first; show most recent first
	if (!experiences.length) return;

	sectionTitle(doc, 'Work Experience');
	experiences.forEach((exp: any, i: number) => {
		ensureSpace(doc, 80);
		if (i > 0) doc.moveDown(0.9);
		headingWithDate(doc, exp?.title || 'Untitled role', exp?.date || '');
		const company = [exp?.company, exp?.location && `(${exp.location})`].filter(Boolean).join(' ');
		if (company) {
			doc
				.font('Helvetica-Oblique')
				.fontSize(10)
				.fillColor(MUTED)
				.text(company, MARGIN, doc.y + 1);
		}
		if (exp?.delegation) {
			doc.moveDown(0.25);
			paragraph(doc, exp.delegation, { size: 9.5 });
		}
	});
};

const projectsSection = (doc: Doc, profile: any) => {
	const projects = profile?.portfolio ?? [];
	if (!projects.length) return;

	sectionTitle(doc, 'Projects');
	projects.forEach((project: any, i: number) => {
		ensureSpace(doc, 60);
		if (i > 0) doc.moveDown(0.8);
		doc
			.font('Helvetica-Bold')
			.fontSize(10.5)
			.fillColor(INK)
			.text(project?.title || 'Untitled project', MARGIN, doc.y);
		if (project?.tech) {
			doc
				.font('Helvetica-Oblique')
				.fontSize(9)
				.fillColor(ACCENT)
				.text(project.tech, MARGIN, doc.y + 1);
		}
		if (project?.description) {
			doc.moveDown(0.2);
			paragraph(doc, project.description, { size: 9.5 });
		}
		const links = [project?.link, project?.repo].filter(Boolean).join('   •   ');
		if (links) {
			doc
				.font('Helvetica')
				.fontSize(8.5)
				.fillColor(MUTED)
				.text(links, MARGIN, doc.y + 1);
		}
	});
};

const educationSection = (doc: Doc, profile: any, type: ProfileDocumentType) => {
	const entries = [
		{
			level: 'Masters',
			degree: profile?.mastersDegree,
			school: profile?.mastersSchool,
			year: profile?.mastersYear,
			description: profile?.mastersDescription
		},
		{
			level: 'College',
			degree: profile?.collegeDegree,
			school: profile?.collegeSchool,
			year: profile?.collegeYear,
			description: profile?.collegeDescription
		}
	].filter((entry) => entry.degree || entry.school);
	if (!entries.length) return;

	sectionTitle(doc, 'Education');
	entries.forEach((entry, i) => {
		ensureSpace(doc, 60);
		if (i > 0) doc.moveDown(0.8);
		headingWithDate(doc, entry.degree || entry.level, entry.year ? String(entry.year) : '');
		if (entry.school) {
			doc
				.font('Helvetica-Oblique')
				.fontSize(10)
				.fillColor(MUTED)
				.text(entry.school, MARGIN, doc.y + 1);
		}
		if (type === 'cv' && entry.description) {
			doc.moveDown(0.2);
			paragraph(doc, entry.description, { size: 9.5 });
		}
	});
};

const skillsSection = (doc: Doc, profile: any) => {
	const skills = (profile?.skills ?? []).map((skill: any) => skill?.name).filter(Boolean);
	if (!skills.length) return;

	sectionTitle(doc, 'Skills');
	paragraph(doc, skills.join('   •   '), { size: 10 });
};

const referencesSection = (doc: Doc, profile: any) => {
	const testimonials = profile?.testimonials ?? [];
	if (!testimonials.length) return;

	sectionTitle(doc, 'References & Testimonials');
	testimonials.forEach((testimonial: any, i: number) => {
		ensureSpace(doc, 70);
		if (i > 0) doc.moveDown(0.9);
		if (testimonial?.message) {
			doc
				.font('Helvetica-Oblique')
				.fontSize(9.5)
				.fillColor(BODY)
				.text(`“${testimonial.message}”`, MARGIN, doc.y, {
					width: CONTENT_WIDTH,
					align: 'justify',
					lineGap: 2
				});
			doc.moveDown(0.25);
		}
		doc
			.font('Helvetica-Bold')
			.fontSize(9.5)
			.fillColor(INK)
			.text(`— ${testimonial?.name || 'Anonymous'}`, MARGIN, doc.y, { continued: true });
		const role = [testimonial?.position, testimonial?.company].filter(Boolean).join(', ');
		if (role) doc.font('Helvetica').fillColor(MUTED).text(`  (${role})`);
		else doc.text('');
	});
};

const footer = (doc: Doc, profile: any, type: ProfileDocumentType) => {
	const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
	const label = type === 'cv' ? 'Curriculum Vitae' : 'Résumé';
	const range = doc.bufferedPageRange();
	for (let i = range.start; i < range.start + range.count; i++) {
		doc.switchToPage(i);
		// Writing inside the bottom margin would trigger an automatic page break,
		// so lift the margin while drawing the footer.
		const bottomMargin = doc.page.margins.bottom;
		doc.page.margins.bottom = 0;
		doc
			.font('Helvetica')
			.fontSize(8)
			.fillColor(MUTED)
			.text(
				`${fullName} — ${label}   ·   Page ${i + 1} of ${range.count}`,
				MARGIN,
				doc.page.height - bottomMargin + 12,
				{ width: CONTENT_WIDTH, align: 'center', lineBreak: false }
			);
		doc.page.margins.bottom = bottomMargin;
	}
};

/**
 * Render the profile as a formal PDF document.
 * - `resume`: concise — summary, skills, experience, education.
 * - `cv`: comprehensive — adds personal details, expertise, career highlights,
 *   projects, education descriptions, and testimonials as references.
 */
export const generateProfileDocument = (profile: any, type: ProfileDocumentType): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const doc = new PDFDocument({
			size: 'A4',
			margins: { top: MARGIN, bottom: MARGIN + 16, left: MARGIN, right: MARGIN },
			bufferPages: true,
			info: {
				Title: `${[profile?.firstName, profile?.lastName].filter(Boolean).join(' ')} — ${
					type === 'cv' ? 'Curriculum Vitae' : 'Résumé'
				}`,
				Author: [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
			}
		});

		const chunks: Uint8Array[] = [];
		doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);

		header(doc, profile, type);
		summarySection(doc, profile, type);

		if (type === 'cv') {
			personalDetailsSection(doc, profile);
			factsSection(doc, profile);
		}

		skillsSection(doc, profile);
		experienceSection(doc, profile);

		if (type === 'cv') projectsSection(doc, profile);

		educationSection(doc, profile, type);

		if (type === 'cv') referencesSection(doc, profile);

		footer(doc, profile, type);
		doc.end();
	});
