<script lang="ts">
	import { Archive } from '$lib/components/icons';

	export let data: any;
	const { user, profile } = data;
	const date = new Date();

	const yearStarted = profile?.yearStarted;
	const years = date.getFullYear() - yearStarted;
	const experience = `Innovative, task-driven professional with ${years} years of experience in IT industry and development across diverse industries.`;
</script>

<div class="grid grid-cols-4 gap-4">
	<div class="card col-span-1">
		<div class="card-header">
			<img src={profile?.image} alt={profile?.firstName} class="rounded-full w-24 h-24 mx-auto" />
			<h3 class="h3 mt-4">{profile?.firstName} {profile?.lastName}</h3>
			<p class="italic text-lg">{profile?.workTitle || ''}</p>
		</div>
		<section class="p-4">
			{#if profile.social}
				<div class="flex gap-4 items-center justify-center">
					{#each profile.social as item}
						<a href={item.link} target="_blank" title={item.name} rel="noopener noreferrer">
							{@html item.icon}
						</a>
					{/each}
				</div>
			{/if}
			<hr class="my-4" />
			<h3 class="h3 gradient-heading">Education</h3>
			<h4 class="h4">Masters ({profile?.mastersYear || 'NA'})</h4>
			<div class="text-sm font-bold mt-2">{profile?.mastersDegree || 'NA'}</div>
			<p class="text-sm italic underline">{profile?.mastersSchool || 'NA'}</p>
			<p class="text-sm">{profile?.mastersDescription || 'NA'}</p>
			<h4 class="h4 mt-4">College ({profile?.collegeYear || 'NA'})</h4>
			<div class="text-sm font-bold mt-2">{profile?.collegeDegree || 'NA'}</div>
			<p class="text-sm italic underline">{profile?.collegeSchool || 'NA'}</p>
			<p class="text-sm">{profile?.collegeDescription || 'NA'}</p>
			<hr class="my-4" />
			<h3 class="h3 gradient-heading">Skills</h3>
				<p class="text-left">It takes talent to make money, but it takes brains to keep them.</p>
			<div class="grid grid-cols-3 gap-4 items-center">
				{#if profile.skills}
					{#each profile?.skills as skill}
						<div class="w-12 fill-white" title={skill.name}>{@html skill.icon}</div>
					{/each}
				{/if}
			</div>
		</section>
	</div>
	<div class="container col-span-3 flex flex-col gap-4">
		<div class="card">
			<header class="card-header">
				<h3 class="h3 gradient-heading">About</h3>
			</header>
			<section class="p-4">
				<p class="text-justify">{profile?.about || '--'}</p>
				<hr class="my-4" />
				<div class="grid grid-cols-2 gap-2">
					<div class="text-lg font-bold">
						Email: <span class="font-normal">{profile?.email || 'NA'}</span>
					</div>
					<div class="text-lg font-bold">
						Website: <span class="font-normal">{profile?.website || 'NA'}</span>
					</div>
					<div class="text-lg font-bold">
						Degree: <span class="font-normal">{profile?.degree || 'NA'}</span>
					</div>
					<div class="text-lg font-bold">
						Nationality: <span class="font-normal">{profile?.nationality || 'NA'}</span>
					</div>
					<div class="text-lg font-bold">
						City: <span class="font-normal">{profile?.city || 'NA'}</span>
					</div>
					<div class="text-lg font-bold">
						Civil Status: <span class="font-normal">{profile?.civilStatus || 'NA'}</span>
					</div>
				</div>
				<hr class="my-4" />
				<p class="text-justify">{experience} {profile?.experience || '--'}</p>
			</section>
		</div>
		<div class="card">
			<header class="card-header">
				<h3 class="h3 gradient-heading">Facts</h3>
				<p class="text-justify">{profile?.expertise || '--'}</p>
			</header>
			<section class="p-4">
				<div class="flex gap-12 justify-center">
					{#if profile.facts}
						{#each Object.entries(profile?.facts) as [key, value]}
							<div class="card variant-ghost w-42">
								<section class="p-4">
									<div class="flex gap-4 items-center">
										<div class="flex flex-grow">
											<Archive width={32} height={32} />
										</div>
										<div>
											<h3 class="h3 text-center text-primary-500">{value}</h3>
											<div class="font-bold">{key.toUpperCase()}</div>
										</div>
									</div>
								</section>
							</div>
						{/each}
					{/if}
				</div>
			</section>
		</div>
		<div class="card">
			<header class="card-header">
				<h3 class="h3 gradient-heading">Work Experience</h3>
			</header>
			<section class="p-4">
				{#each profile.experiences as experience}
					<div class="my-4">
						<h3 class="h3"><span class="text-primary-500">{experience?.title}</span> {experience?.date || 'NA'}</h3>
						<h4 class="h4">
							{experience?.company || 'NA'}
							<span class="text-sm italic underline font-normal"
								>({experience?.location || 'NA'})</span
							>
						</h4>
						<p>{experience?.delegation || 'NA'}</p>
					</div>
				{/each}
			</section>
		</div>
	</div>
</div>
