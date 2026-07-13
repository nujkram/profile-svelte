<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast, Toggle } from '$lib/components/ui';

	let { data }: { data: any } = $props();
	// svelte-ignore state_referenced_locally -- intentional initial copy; load() reruns remount this page
	const { profile } = data;

	let _id = profile?._id;
	let lastName: string = $state(profile?.lastName);
	let firstName: string = $state(profile?.firstName);
	let middleName: string = $state(profile?.middleName);
	let workTitle: string = $state(profile?.workTitle);
	let email: string = $state(profile?.email);
	let about: string = $state(profile?.about);
	let workBackground: string = $state(profile?.workBackground);
	let expertise: string = $state(profile?.expertise);
	let degree: string = $state(profile?.degree);
	let city: string = $state(profile?.city);
	let nationality: string = $state(profile?.nationality);
	let civilStatus: string = $state(profile?.civilStatus);
	let website: string = $state(profile?.website);
	let experience: string = $state(profile?.experience);
	let collegeDegree: string = $state(profile?.collegeDegree);
	let collegeYear: string = $state(profile?.collegeYear);
	let collegeSchool: string = $state(profile?.collegeSchool);
	let collegeDescription: string = $state(profile?.collegeDescription);
	let mastersDegree: string = $state(profile?.mastersDegree);
	let mastersYear: string = $state(profile?.mastersYear);
	let mastersSchool: string = $state(profile?.mastersSchool);
	let mastersDescription: string = $state(profile?.mastersDescription);
	let projects: number = $state(profile?.facts?.projects);
	let clients: number = $state(profile?.facts?.clients);
	let companies: number = $state(profile?.facts?.companies);
	// Private notes — reminders of what each count represents. Dashboard only, never public.
	let projectsNote: string = $state(profile?.factsNotes?.projects ?? '');
	let clientsNote: string = $state(profile?.factsNotes?.clients ?? '');
	let companiesNote: string = $state(profile?.factsNotes?.companies ?? '');
	let yearStarted: number = $state(profile?.yearStarted);
	let isAvailable: boolean = $state(profile?.isAvailable ?? false);
	let selectedFile: File | undefined = $state();
	let imageBase64: any = $state(profile?.image);
	let skills = profile?.skills;
	let portfolio = profile?.portfolio;
	let services = profile?.services;

	let isSaving = $state(false);

	const handleFileUpload = (event: any) => {
		selectedFile = event.target.files[0];
		if (!selectedFile) return;
		const fileReader = new FileReader();
		fileReader.onload = () => {
			imageBase64 = fileReader.result;
		};
		fileReader.readAsDataURL(selectedFile);
	};

	const handleSave = async () => {
		isSaving = true;
		try {
			const response = await fetch('/api/admin/profile/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					_id,
					lastName,
					firstName,
					middleName,
					workTitle,
					email,
					about,
					workBackground,
					expertise,
					degree,
					city,
					nationality,
					civilStatus,
					website,
					isAvailable,
					experience,
					collegeDegree,
					collegeYear,
					collegeSchool,
					collegeDescription,
					mastersDegree,
					mastersYear,
					mastersSchool,
					mastersDescription,
					facts: { projects, clients, companies },
					factsNotes: {
						projects: projectsNote,
						clients: clientsNote,
						companies: companiesNote
					},
					yearStarted,
					skills,
					portfolio,
					services,
					imageName: selectedFile ? selectedFile.name : profile?.imageName || '',
					image: imageBase64
				})
			});
			const result = await response.json();
			toast.success(result.message);
			goto('/dashboard/');
		} catch (error: any) {
			toast.error(error.message);
			console.error(error);
		} finally {
			isSaving = false;
		}
	};
</script>

<form
	method="POST"
	autocomplete="off"
	class="max-w-5xl mx-auto space-y-6"
	onsubmit={(event) => {
		event.preventDefault();
		handleSave();
	}}
>
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="h3">Edit Profile</h1>
			<p class="opacity-60 text-sm">This information powers your public profile page.</p>
		</div>
	</header>

	<!-- Photo & availability -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Photo & Availability</h2>
		<div class="flex flex-col sm:flex-row items-center gap-6">
			<img
				src={imageBase64}
				alt="profile"
				class="w-28 h-28 rounded-full object-cover ring-2 ring-primary-500/50"
			/>
			<div class="flex-1 w-full space-y-4">
				<label class="label">
					<span>Profile Image</span>
					<input class="input" name="image" type="file" accept="image/*" onchange={handleFileUpload} />
				</label>
				<div class="flex items-center gap-4">
					<Toggle name="isAvailable" bind:checked={isAvailable} label="Freelance availability" />
					<span>
						{#if isAvailable}
							Shown as <span class="badge badge-soft-success">Available for Freelance</span>
						{:else}
							Shown as <span class="badge badge-soft-error">Currently Unavailable</span>
						{/if}
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Basic information -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Basic Information</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<label class="label">
				<span>First Name</span>
				<input class="input" type="text" placeholder="Mark Jun" name="firstName" bind:value={firstName} required />
			</label>
			<label class="label">
				<span>Middle Name</span>
				<input class="input" type="text" placeholder="Altamia" name="middleName" bind:value={middleName} />
			</label>
			<label class="label">
				<span>Last Name</span>
				<input class="input" type="text" placeholder="Gersaniva" name="lastName" bind:value={lastName} required />
			</label>
			<label class="label">
				<span>Work Title</span>
				<input class="input" type="text" placeholder="Software Engineer" name="workTitle" bind:value={workTitle} required />
			</label>
			<label class="label">
				<span>Email</span>
				<input class="input" type="email" placeholder="you@example.com" name="email" bind:value={email} required />
			</label>
			<label class="label">
				<span>Website</span>
				<input class="input" type="text" placeholder="markgersaniva.dev" name="website" bind:value={website} />
			</label>
			<label class="label">
				<span>City</span>
				<input class="input" type="text" placeholder="Roxas City" name="city" bind:value={city} />
			</label>
			<label class="label">
				<span>Nationality</span>
				<input class="input" type="text" placeholder="Filipino" name="nationality" bind:value={nationality} />
			</label>
			<label class="label">
				<span>Civil Status</span>
				<input class="input" type="text" placeholder="Married" name="civilStatus" bind:value={civilStatus} />
			</label>
			<label class="label">
				<span>Degree</span>
				<input class="input" type="text" placeholder="Bachelor of Science in Computer Science" name="degree" bind:value={degree} />
			</label>
		</div>
	</section>

	<!-- Story -->
	<section class="card p-6">
		<h2 class="h4 mb-1">Your Story</h2>
		<p class="text-sm opacity-60 mb-4">
			These paragraphs make up the About and Facts sections of your public page.
		</p>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="label">
				<span>About</span>
				<textarea
					class="textarea"
					rows="4"
					bind:value={about}
					name="about"
					placeholder="Who you are and what you do — the opening paragraph of your profile."></textarea>
			</label>
			<label class="label">
				<span>Work Background</span>
				<textarea
					class="textarea"
					rows="4"
					bind:value={workBackground}
					name="workBackground"
					placeholder="Your current role and day-to-day focus."></textarea>
			</label>
			<label class="label">
				<span>Experience</span>
				<textarea
					class="textarea"
					rows="4"
					bind:value={experience}
					name="experience"
					placeholder="Your track record — shown after the years-of-experience line."></textarea>
			</label>
			<label class="label">
				<span>Expertise</span>
				<textarea
					class="textarea"
					rows="4"
					bind:value={expertise}
					placeholder="Frameworks, languages, and tools you specialize in — shown in the Facts section."></textarea>
			</label>
		</div>
	</section>

	<!-- Facts & numbers -->
	<section class="card p-6">
		<h2 class="h4 mb-1">Facts & Numbers</h2>
		<p class="text-sm opacity-60 mb-4">Shown as animated counters on your public page.</p>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<label class="label">
				<span>Projects</span>
				<input class="input" type="number" placeholder="16" name="projects" bind:value={projects} required />
			</label>
			<label class="label">
				<span>Clients</span>
				<input class="input" type="number" placeholder="741" name="clients" bind:value={clients} required />
			</label>
			<label class="label">
				<span>Companies</span>
				<input class="input" type="number" placeholder="7" name="companies" bind:value={companies} required />
			</label>
			<label class="label">
				<span>Year Started Coding</span>
				<input class="input" type="number" placeholder="2018" name="yearStarted" bind:value={yearStarted} required />
			</label>
		</div>

		<div class="mt-6 rounded-lg border border-surface-500/20 bg-surface-500/5 p-4">
			<div class="flex items-center gap-2 mb-1">
				<h3 class="font-semibold opacity-80">Private notes</h3>
				<span class="badge badge-soft-surface">Dashboard only</span>
			</div>
			<p class="text-sm opacity-60 mb-4">
				Jot down what each number stands for — which projects, clients, and companies. These notes
				are just for you and never appear on your public profile.
			</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<label class="label">
					<span>Projects note</span>
					<textarea
						class="textarea"
						rows="4"
						bind:value={projectsNote}
						placeholder="e.g. HWAY Korea, Automated Test Scoring, Laboratory System…"></textarea>
				</label>
				<label class="label">
					<span>Clients note</span>
					<textarea
						class="textarea"
						rows="4"
						bind:value={clientsNote}
						placeholder="Who the clients were / how you counted them"></textarea>
				</label>
				<label class="label">
					<span>Companies note</span>
					<textarea
						class="textarea"
						rows="4"
						bind:value={companiesNote}
						placeholder="e.g. Blue Spark, XtendOps…"></textarea>
				</label>
			</div>
		</div>
	</section>

	<!-- Education -->
	<section class="card p-6">
		<h2 class="h4 mb-4">Education</h2>

		<h3 class="font-semibold opacity-70 mb-2">Bachelor's</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<label class="label">
				<span>Degree</span>
				<input class="input" type="text" placeholder="Bachelor of Science in Computer Science" name="collegeDegree" bind:value={collegeDegree} />
			</label>
			<label class="label">
				<span>Year Graduated</span>
				<input class="input" type="text" placeholder="2012" name="collegeYear" bind:value={collegeYear} />
			</label>
			<label class="label">
				<span>School</span>
				<input class="input" type="text" placeholder="Filamer Christian University" name="collegeSchool" bind:value={collegeSchool} />
			</label>
			<label class="label">
				<span>Description</span>
				<input class="input" type="text" placeholder="Short description of the program" name="collegeDescription" bind:value={collegeDescription} />
			</label>
		</div>

		<h3 class="font-semibold opacity-70 mb-2">Master's</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="label">
				<span>Degree</span>
				<input class="input" type="text" placeholder="Master of Science in Computer Science" name="mastersDegree" bind:value={mastersDegree} />
			</label>
			<label class="label">
				<span>Year Graduated</span>
				<input class="input" type="text" placeholder="2016" name="mastersYear" bind:value={mastersYear} />
			</label>
			<label class="label">
				<span>School</span>
				<input class="input" type="text" placeholder="Filamer Christian University" name="mastersSchool" bind:value={mastersSchool} />
			</label>
			<label class="label">
				<span>Description</span>
				<input class="input" type="text" placeholder="Short description of the program" name="mastersDescription" bind:value={mastersDescription} />
			</label>
		</div>
	</section>

	<div class="flex gap-4 justify-end sticky bottom-4">
		<button type="button" class="btn btn-ghost" onclick={() => goto('/dashboard/')}>Cancel</button>
		<button type="submit" class="btn btn-success" disabled={isSaving}
			>{isSaving ? 'Saving…' : 'Save Profile'}</button
		>
	</div>
</form>
