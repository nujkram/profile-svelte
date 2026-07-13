export type ToastKind = 'info' | 'success' | 'error';

export type ToastItem = {
	id: number;
	message: string;
	kind: ToastKind;
};

let nextId = 0;

class ToastState {
	items = $state<ToastItem[]>([]);

	show(message: string, kind: ToastKind = 'info', timeout = 5000) {
		const id = ++nextId;
		this.items.push({ id, message, kind });
		if (timeout > 0) {
			setTimeout(() => this.dismiss(id), timeout);
		}
		return id;
	}

	success(message: string, timeout?: number) {
		return this.show(message, 'success', timeout);
	}

	error(message: string, timeout?: number) {
		return this.show(message, 'error', timeout);
	}

	dismiss(id: number) {
		const index = this.items.findIndex((item) => item.id === id);
		if (index !== -1) this.items.splice(index, 1);
	}
}

/** App-wide toast store, backed by Svelte 5 runes. Render `<Toaster />` once in the layout. */
export const toast = new ToastState();
