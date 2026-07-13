<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from '$lib/components/ui';
	import { SHA256 } from 'crypto-js';

	let { data }: { data: any } = $props();

	let username = $state('');
	let password = $state('');
	let loggingIn = $state(false);

	$effect(() => {
		if (data.user) goto('/dashboard');
	});

	const handleLogin = async () => {
		loggingIn = true;
		try {
			const securePassword = SHA256(password).toString();
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, password: securePassword })
			});
			const result = await response.json();

			if (result.error) {
				toast.error('Invalid username or password');
			} else {
				toast.success(`Welcome back ${result.user.firstName}!`);
				await invalidateAll();
				goto('/dashboard');
			}
		} catch (error: any) {
			toast.error(error.message || 'An error occurred');
			console.error(error);
		} finally {
			loggingIn = false;
		}
	};
</script>

<div class="flex min-h-[80dvh] flex-col items-center justify-center px-4">
	<form
		class="card w-full max-w-sm space-y-4 p-8 shadow-xl"
		method="POST"
		autocomplete="off"
		onsubmit={(event) => {
			event.preventDefault();
			if (!loggingIn) handleLogin();
		}}
	>
		<div class="text-center">
			<h1 class="h3 gradient-heading">Welcome back!</h1>
			<p class="text-sm opacity-60">Sign in to manage your profile</p>
		</div>

		<label class="label">
			<span>Username</span>
			<input type="text" placeholder="username" bind:value={username} class="input" required />
		</label>

		<label class="label">
			<span>Password</span>
			<input
				type="password"
				placeholder="Your password"
				bind:value={password}
				class="input"
				required
			/>
		</label>

		<button type="submit" class="btn btn-primary w-full" disabled={loggingIn}>
			{loggingIn ? 'Signing in…' : 'Login'}
		</button>
	</form>
</div>
