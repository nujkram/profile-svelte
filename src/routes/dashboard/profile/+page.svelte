<script lang="ts">
	import { focusTrap, getToastStore, SlideToggle } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';

	export let data: any;
	const { user, profile } = data;
	let isFocused: boolean = true;
	let _id = profile?._id;
	let lastName: string = profile?.lastName;
	let firstName: string = profile?.firstName;
	let middleName: string = profile?.middleName;
	let workTitle: string = profile?.workTitle;
	let email: string = profile?.email;
	let about: string = profile?.about;
	let workBackground: string = profile?.workBackground;
	let expertise: string = profile?.expertise;
	let degree: string = profile?.degree;
	let city: string = profile?.city;
	let nationality: string = profile?.nationality;
	let civilStatus: string = profile?.civilStatus;
	let website: string = profile?.website;
	let experience: string = profile?.experience;
	let collegeDegree: string = profile?.collegeDegree;
	let collegeYear: string = profile?.collegeYear;
	let collegeSchool: string = profile?.collegeSchool;
	let collegeDescription: string = profile?.collegeDescription;
	let mastersDegree: string = profile?.mastersDegree;
	let mastersYear: string = profile?.mastersYear;
	let mastersSchool: string = profile?.mastersSchool;
	let mastersDescription: string = profile?.mastersDescription;
	let projects: number = profile?.facts?.projects;
	let students: number = profile?.facts?.students;
	let companies: number = profile?.facts?.companies;
	let yearStarted: number = profile?.yearStarted;
	let isAvailable: boolean = profile?.isAvailable;
	let selectedFile: File;
	let imageBase64: any = profile?.image;
	let skills = profile?.skills;
	let portfolio = profile?.portfolio;
	let services = profile?.services;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const handleFileUpload = (event) => {
		selectedFile = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = () => {
			const base64Image = fileReader.result;
			imageBase64 = base64Image;
		};
		fileReader.readAsDataURL(selectedFile);
		// You can perform additional tasks here, such as displaying a preview of the image
	};
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	enctype="multipart/form-data"
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/profile/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
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
					facts: {
						projects,
						students,
						companies
					},
					yearStarted,
					skills,
					portfolio,
					services,
					imageName: selectedFile.name,
					image: imageBase64
				})
			});
			let result = await response.json();
			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			goto(`/dashboard/`);
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}}
>
	<h2 class="h4">Basic Information</h2>
	<div class="flex items-center justify-center">
		<img
			src={imageBase64}
			alt="profile"
			class="w-32 h-32 rounded-full"
		/>
	</div>
	<div class="grid grid-cols-2 gap-4">
		<label class="label mt-4">
			<span>About</span>
			<textarea
				class="textarea"
				rows="4"
				bind:value={about}
				name="about"
				placeholder="My name is Mark, and I have 6 years of experience working in software industries.I worked with more than 16 projects for Private and Government companies."
			/>
		</label>

		<label class="label mt-4">
			<span>Work Background</span>
			<textarea
				class="textarea"
				rows="4"
				bind:value={workBackground}
				name="workBackground"
				placeholder="I work as a lead developer focusing on the server-side logic, definition, maintenance, deployment and ensuring high performance and responsiveness to requests from the front-end."
			/>
		</label>

		<label class="label mt-4">
			<span>Experience</span>
			<textarea
				class="textarea"
				rows="4"
				bind:value={experience}
				name="experience"
				placeholder="Equipped with a record of success in consistency identifying and providing the technological needs of my previous companies through ingenious innovation. Proficient in developing databases, creating user interfaces, writing and testing codes, troubleshooting simple and complex issues."
			/>
		</label>

		<label class="label mt-4">
			<span>Expertise</span>
			<textarea
				class="textarea"
				rows="4"
				bind:value={expertise}
				placeholder="Expertise on the following: Django, Laravel, CodeIgniter, Svelte frameworks. Python, PHP, MySQL, CSS, HTMLS, Javascript, Wordpress, Zoho Applications."
			/>
		</label>

		<label class="label mt-4">
			<span>Last Name</span>
			<input
				class="input"
				type="text"
				placeholder="Gersaniva"
				name="lastName"
				bind:value={lastName}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Work Title</span>
			<input
				class="input"
				type="text"
				placeholder="Software Engineer"
				name="workTitle"
				bind:value={workTitle}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>First Name</span>
			<input
				class="input"
				type="text"
				placeholder="Mark Jun"
				name="firstName"
				bind:value={firstName}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Email</span>
			<input
				class="input"
				type="email"
				placeholder="markjungersaniva@gmail.com"
				name="email"
				bind:value={email}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Middle Name</span>
			<input
				class="input"
				type="text"
				placeholder="Altamia"
				name="middleName"
				bind:value={middleName}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Degree</span>
			<input
				class="input"
				type="text"
				placeholder="Bachelor of Science in Computer Science"
				name="degree"
				bind:value={degree}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Civil Status</span>
			<input
				class="input"
				type="text"
				placeholder="Married"
				name="civilStatus"
				bind:value={civilStatus}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Website</span>
			<input
				class="input"
				type="text"
				placeholder="markgersaniva.dev"
				name="website"
				bind:value={website}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>City</span>
			<input
				class="input"
				type="text"
				placeholder="Roxas City"
				name="city"
				bind:value={city}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Nationality</span>
			<input
				class="input"
				type="text"
				placeholder="Filipino"
				name="nationality"
				bind:value={nationality}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Projects</span>
			<input
				class="input"
				type="number"
				placeholder="16"
				name="projects"
				bind:value={projects}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Students</span>
			<input
				class="input"
				type="number"
				placeholder="741"
				name="students"
				bind:value={students}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Companies</span>
			<input
				class="input"
				type="number"
				placeholder="7"
				name="companies"
				bind:value={companies}
				required
			/>
		</label>

		<label class="label mt-4">
			<span>Year Started Working as a Programmer</span>
			<input
				class="input"
				type="number"
				placeholder="2018"
				name="yearStarted"
				bind:value={yearStarted}
				required
			/>
		</label>

		<div class="flex flex-col mt-4 gap-2">
			<span>Freelance Availability</span>
			<SlideToggle name="slide" bind:checked={isAvailable} />
		</div>

		<label class="label mt-4">
			<span>Image</span>
			<input class="input" name="image" type="file" on:change={handleFileUpload} />
		</label>
	</div>
	<hr class="my-10" />
	<div>
		<h2 class="h4">Educational Background</h2>
		<div class="grid grid-cols-2 gap-4">
			<label class="label mt-4">
				<span>Bachelor's Degree</span>
				<input
					class="input"
					type="text"
					placeholder="Bachelor of Science in Computer Science"
					name="collegeDegree"
					bind:value={collegeDegree}
					required
				/>
			</label>
			<label class="label mt-4">
				<span>Year Graduated</span>
				<input
					class="input"
					type="text"
					placeholder="2012"
					name="collegeYear"
					bind:value={collegeYear}
					required
				/>
			</label>
			<label class="label mt-4">
				<span>School</span>
				<input
					class="input"
					type="text"
					placeholder="Filamer Christian University"
					name="collegeSchool"
					bind:value={collegeSchool}
					required
				/>
			</label>
			<label class="label mt-4">
				<span>Degree Description</span>
				<input
					class="input"
					type="text"
					placeholder="Bachelor of Science in Computer Science (BSCS) is a four-year program that includes the study of computing concepts and theories, algorithmic foundations, and new developments in computing."
					name="collegeDescription"
					bind:value={collegeDescription}
					required
				/>
			</label>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<label class="label mt-4">
				<span>Masters Degree</span>
				<input
					class="input"
					type="text"
					placeholder="Master of Science in Computer Science"
					name="mastersDegree"
					bind:value={mastersDegree}
					required
				/>
			</label>
			<label class="label mt-4">
				<span>Year Graduated</span>
				<input
					class="input"
					type="text"
					placeholder="2012"
					name="mastersYear"
					bind:value={mastersYear}
					required
				/>
			</label>
			<label class="label mt-4">
				<span>School</span>
				<input
					class="input"
					type="text"
					placeholder="Filamer Christian University"
					name="mastersSchool"
					bind:value={mastersSchool}
					required
				/>
			</label>
			<label class="label mt-4">
				<span>Degree Description</span>
				<input
					class="input"
					type="text"
					placeholder="The Master of Science in Computer Science (MSCS) program of the College of Computer Studies is a two-year post-graduate course designed to train students in undertaking high-level research in the advanced field of computing."
					name="mastersDescription"
					bind:value={mastersDescription}
					required
				/>
			</label>
		</div>
	</div>

	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Update</button>
	</div>
</form>
