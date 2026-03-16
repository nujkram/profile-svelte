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
	id="skillsForm"
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			const form = document.getElementById('skillsForm');
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
			<h2 class="h4 flex gap-4">Update Skills
				
				<a href="https://fontawesome.com/icons" class="underline" target="_blank">
					<svg class="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M238.9 336C249.6 336 259.6 341.3 265.5 350.2L277.3 368L304 368C330.5 368 352 389.5 352 416L352 528C352 554.5 330.5 576 304 576L112 576C85.5 576 64 554.5 64 528L64 416C64 389.5 85.5 368 112 368L138.7 368L150.5 350.2C156.4 341.3 166.4 336 177.1 336L238.8 336zM517.5 324C523.1 319.1 531.4 318.7 537.4 323.1C543.4 327.5 545.7 335.5 542.7 342.4L504.3 432L560 432C566.7 432 572.6 436.1 575 442.4C577.4 448.7 575.6 455.7 570.6 460.1L442.6 572.1C437 577 428.7 577.4 422.7 573C416.7 568.6 414.4 560.6 417.4 553.7L455.9 464L400.1 464C393.4 464 387.5 459.9 385.1 453.6C382.7 447.3 384.5 440.3 389.5 435.9L517.5 323.9zM208 424C181.5 424 160 445.5 160 472C160 498.5 181.5 520 208 520C234.5 520 256 498.5 256 472C256 445.5 234.5 424 208 424zM547.8 64.4C554.3 63.3 560.9 64.8 566.3 68.8C572.4 73.3 576 80.5 576 88L576 240L575.7 244.9C572.4 269.1 545.2 288 512 288C476.7 288 448 266.5 448 240C448 213.5 476.7 192 512 192C517.5 192 522.9 192.6 528 193.6L528 144.3L416 177.9L416 288.1L415.7 293C412.4 317.2 385.2 336.1 352 336.1C316.7 336.1 288 314.6 288 288.1C288 261.6 316.7 240.1 352 240.1C357.5 240.1 362.9 240.7 368 241.7L368 136C368 125.4 375 116 385.1 113L545.1 65L547.8 64.4zM252.9 64C290 64 320 94 320 131.1L320 137.2C320 193.3 244.8 249.3 209.7 272.5C198.9 279.6 185.1 279.6 174.3 272.5C139.2 249.4 64 193.3 64 137.2L64 131.1C64 94 94 64 131.1 64C152.2 64 172 73.9 184.7 90.8L192 100.6L199.3 90.8C212 73.9 231.8 64 252.9 64z"/></svg>
				</a>
			</h2>
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
