/**
 * Optimistic-concurrency guard for dashboard saves. Forms post the
 * `updatedAt` they loaded with (`baseUpdatedAt`); if the stored document
 * has changed since, the save is stale and would silently clobber newer
 * data — the endpoint should 409 instead.
 */
export const isStaleWrite = (current: any, baseUpdatedAt: unknown): boolean => {
	if (!current?.updatedAt || !baseUpdatedAt) return false;
	return new Date(String(baseUpdatedAt)).getTime() !== new Date(current.updatedAt).getTime();
};

export const staleWriteResponse = () =>
	new Response(
		JSON.stringify({
			status: 'Error',
			message:
				'Your profile changed after this page was loaded. Refresh to get the latest version, then re-apply your edits.'
		}),
		{ status: 409, headers: { 'Content-Type': 'application/json' } }
	);
