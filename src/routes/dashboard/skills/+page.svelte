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
	let cart = profile?.skills || [];
	let _id = profile?._id;
	let name: string = '';
	let names: string[] = [];
	let cartData: string[] = [];
	let nameOptions: any;

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Icon'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(cartData, ['name', 'icon'])
	};

	const updateTable = (cartData: any) => {
		if (!cartData.length) {
			table.body = [];
			table.meta = [];
			table.foot = [];
			cartData = [];
			return;
		}
		table.body = tableMapperValues(cartData, ['name', 'icon']);
		table.meta = tableMapperValues(cartData, ['name', 'icon']);
		table.foot = ['Total', `<code class="code">${cartData.length}</code>`];
	};

	// Extract mapping names to a separate function
	const mapCart = (inputs: any, formData: any, name: string) => {
		return Array.from(inputs)
			.map((input: any) => {
				formData.append(input.name, input.value);
				return input.name === name ? input.value : null;
			})
			.filter((value: any) => value !== null);
	};

	// autocomplete name selection event handler function to update name value on selection
	const onItemSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		const selectedItem: any[] = [event.detail.value, event.detail.meta];
		names = [...names, selectedItem[0]];
		let dict: any = {};
		let value = {
			name: selectedItem[0],
		};
		dict = value;
		cart.push(dict);

		// update cart table
		let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputName = createInputElement('text', 'names', selectedItem[0], newId, 'Skill name');
		const inputIcon = createInputElement('text', 'icons', '', newId, 'SVG icon');

		cartData[newId] = {
			name: inputName.outerHTML,
			icon: inputIcon.outerHTML
		};

		name = '';
		updateTable(cartData);
	};

	const onItemAdd = () => {
		let name = names[names.length - 1];
		let icon = names[names.length - 1];
		let dict: any = {};
		let value = {
			name,
			icon
		};
		dict = value;
		cart.push(dict);

		// update cart table
		let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputName = createInputElement('text', 'names', name, newId, 'Skill name');
		const inputIcon = createInputElement('text', 'icons', icon, newId, 'SVG icon');

		cartData[newId] = {
			name: inputName.outerHTML,
			icon: inputIcon.outerHTML
		};

		name = '';
		updateTable(cartData);
	};

	// item input chip event handler
	const onRemoveitem = (e: { detail: { chipIndex: number } }) => {
		cartData.splice(e.detail.chipIndex, 1);
		cart.splice(e.detail.chipIndex, 1);
		updateTable(cartData);
	};

	if (profile.skills) {
		const uniqueItems = new Set(profile.skills.map((item: any) => item.name));

		if (uniqueItems.size > 0) {
			nameOptions = [...uniqueItems].map((item: any) => {
				return {
					label: item,
					value: item,
					keywords: item
				};
			});
		}
	}

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

	const loadSkills = async () => {
		await cart.forEach((item: any) => {
			// update cart table
			let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
			let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

			const inputName = createInputElement('text', 'names', item.name, newId, 'Skill name');
			const inputIcon = createInputElement('text', 'icons', item.icon, newId, 'SVG icon');

			cartData[newId] = {
				name: inputName.outerHTML,
				icon: inputIcon.outerHTML
			};

			names = [...names, item.name];
			updateTable(cartData);
		});
	};

	onMount(async () => {
		await loadSkills();
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

			// Get the names
			const icons = mapCart(inputs, formData, 'icons');
			// Map icons to cart items
			cart = cart.map((item, index) => {
				const icon = icons[index];
				item.icon = icon;
				return item;
			});

			let response = await fetch('/api/admin/skills/update', {
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
	<div class="grid md:grid-cols-3 grid-cols-1">
		<div class="col-span-1 p-6 flex flex-col gap-4">
			<h2 class="h4">Update Skills</h2>
			<div class="mt-3">
				<span>Name</span>
				<InputChip
					bind:input={name}
					bind:value={names}
					name="names"
					allowUpperCase={true}
					allowDuplicates={false}
					on:remove={onRemoveitem}
					on:add={onItemAdd}
				/>
				<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
					<Autocomplete bind:input={name} options={nameOptions} on:selection={onItemSelection} />
				</div>
			</div>
		</div>
		<div class="col-span-2 p-6 flex flex-col gap-4">
			<h2 class="h4">Skills</h2>
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
