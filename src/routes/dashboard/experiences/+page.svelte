<script lang="ts">
	import {
		Autocomplete,
		focusTrap,
		getToastStore,
		InputChip,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, TableSource, ToastSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: any;
	const { user, profile } = data;

	let isFocused: boolean = true;
	let cart = profile?.experiences || [];
	let _id = profile?._id;
	let title: string = '';
	let titles: string[] = [];
	let cartData: string[] = [];
	let titleOptions: any;

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Date', 'Company', 'Location', 'Delegation'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(cartData, ['title', 'date', 'company', 'location', 'delegation'])
	};

	const updateTable = (cartData: any) => {
		if (!cartData.length) {
			table.body = [];
			table.meta = [];
			table.foot = [];
			cartData = [];
			return;
		}
		table.body = tableMapperValues(cartData, [
			'title',
			'date',
			'company',
			'location',
			'delegation'
		]);
		table.meta = tableMapperValues(cartData, [
			'title',
			'date',
			'company',
			'location',
			'delegation'
		]);
		table.foot = ['Total', '', '', '', `<code class="code">${cartData.length}</code>`];
	};

	// Extract mapping titles to a separate function
	const mapCart = (inputs: any, formData: any, name: string) => {
		return Array.from(inputs)
			.map((input: any) => {
				formData.append(input.name, input.value);
				return input.name === name ? input.value : null;
			})
			.filter((value: any) => value !== null);
	};

	// autocomplete name selection event handler function to update name value on selection
	const onTitleSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		const selectedItem: any[] = [event.detail.value, event.detail.meta];
		titles = [...titles, selectedItem[0]];

		let dict: any = {};
		let value = {
			title: selectedItem[0]
		};
		dict = value;
		cart.push(dict);

		// update cart table
		let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputTitle = createInputElement('text', 'titles', selectedItem[0], newId, 'Title');
		const inputDate = createInputElement('text', 'dates', '', newId, 'MMM YYYY - MMM YYYY');
		const inputCompany = createInputElement('text', 'companies', '', newId, 'Company Name');
		const inputLocation = createInputElement('text', 'locations', '', newId, 'Location');
		const inputDelegation = createInputElement('text', 'delegations', '', newId, 'Delegations');

		cartData[newId] = {
			title: inputTitle.outerHTML,
			date: inputDate.outerHTML,
			company: inputCompany.outerHTML,
			location: inputLocation.outerHTML,
			delegation: inputDelegation.outerHTML
		};

		title = '';
		updateTable(cartData);
	};

	const createInputElement = (
		type: string,
		name: string,
		value: string,
		id: number,
		placeholder: string
	) => {
		const input = document.createElement('input');
		input.setAttribute('class', 'input');
		input.setAttribute('id', `${name}[${id}]`);
		input.setAttribute('type', type);
		input.setAttribute('name', name);
		input.setAttribute('placeholder', placeholder);
		input.setAttribute('value', value);
		return input;
	};

	const onItemAdd = () => {
		let title = titles[titles.length - 1];
		let dict: any = {};
		let value = {
			title
		};
		dict = value;
		cart.push(dict);

		// update cart table
		let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputTitle = createInputElement('text', 'titles', title, newId, 'Skill name');
		const inputDate = createInputElement('text', 'dates', '', newId, 'MMM YYYY - MMM YYYY');
		const inputCompany = createInputElement('text', 'companies', '', newId, 'Company Name');
		const inputLocation = createInputElement('text', 'locations', '', newId, 'Location');
		const inputDelegation = createInputElement('text', 'delegations', '', newId, 'Delegations');

		cartData[newId] = {
			title: inputTitle.outerHTML,
			date: inputDate.outerHTML,
			company: inputCompany.outerHTML,
			location: inputLocation.outerHTML,
			delegation: inputDelegation.outerHTML
		};

		title = '';
		updateTable(cartData);
	};

	// item input chip event handler
	const onRemoveitem = (e: { detail: { chipIndex: number } }) => {
		cartData.splice(e.detail.chipIndex, 1);
		cart.splice(e.detail.chipIndex, 1);
		updateTable(cartData);
	};

	if (profile.experiences) {
		const uniqueItems = new Set(profile.experiences.map((item: any) => item.title));

		if (uniqueItems.size > 0) {
			titleOptions = [...uniqueItems].map((item: any) => {
				return {
					label: item,
					value: item,
					keywords: item
				};
			});
		}
	}

	const loadExperiences = async () => {
		await cart.forEach((item: any) => {
			// update cart table
			let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
			let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

			const inputTitle = createInputElement('text', 'titles', item.title, newId, 'Skill name');
			const inputDate = createInputElement(
				'text',
				'dates',
				item.date,
				newId,
				'MMM YYYY - MMM YYYY'
			);
			const inputCompany = createInputElement(
				'text',
				'companies',
				item.company,
				newId,
				'Company Name'
			);
			const inputLocation = createInputElement(
				'text',
				'locations',
				item.location,
				newId,
				'Location'
			);
			const inputDelegation = createInputElement(
				'text',
				'delegations',
				item.delegation,
				newId,
				'Delegations'
			);

			cartData[newId] = {
				title: inputTitle.outerHTML,
				date: inputDate.outerHTML,
				company: inputCompany.outerHTML,
				location: inputLocation.outerHTML,
				delegation: inputDelegation.outerHTML
			};

			titles = [...titles, item.title];

			updateTable(cartData);
		});
	};

	onMount(async () => {
		await loadExperiences();
	});
</script>

<form
	id="expensesForm"
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			const form = document.getElementById('expensesForm');
			let formData = new FormData(form);
			const inputs = document.querySelectorAll('[name]');

			const dates = mapCart(inputs, formData, 'dates');
			const companies = mapCart(inputs, formData, 'companies');
			const locations = mapCart(inputs, formData, 'locations');
			const delegations = mapCart(inputs, formData, 'delegations');

			// Map dates to cart items
			cart = cart.map((item, index) => {
				const title = titles[index];
				const date = dates[index];
				const company = companies[index];
				const location = locations[index];
				const delegation = delegations[index];
				item.title = title;
				item.date = date;
				item.company = company;
				item.location = location;
				item.delegation = delegation;
				return item;
			});

			let response = await fetch('/api/admin/experiences/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id,
					cart
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
	<div class="grid md:grid-cols-4 grid-cols-1">
		<div class="col-span-1 p-6 flex flex-col gap-4">
			<h2 class="h4">Update Experiences</h2>
			<div class="mt-3">
				<span>Title</span>
				<InputChip
					bind:input={title}
					bind:value={titles}
					name="titles"
					allowUpperCase={true}
					allowDuplicates={false}
					on:remove={onRemoveitem}
					on:add={onItemAdd}
				/>
				<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
					<Autocomplete bind:input={title} options={titleOptions} on:selection={onTitleSelection} />
				</div>
			</div>
		</div>
		<div class="col-span-3 p-6 flex flex-col gap-4">
			<h2 class="h4">Experiences</h2>
			<Table class="mt-4" source={table} />
		</div>
	</div>
	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => goto(`/dashboard/`)}
			>Cancel</button
		>
	</div>
</form>
