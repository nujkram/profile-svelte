import clientPromise from '$lib/server/mongo';
import { dev } from '$app/environment';

const withSecurityHeaders = (response: Response) => {
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	return response;
};

// Admin API routes require a logged-in user; everything else resolves normally.
const guardAdminRoutes = (event: any) => {
	if (event.url.pathname.startsWith('/api/admin') && !event.locals.user) {
		return new Response(JSON.stringify({ status: 'Error', message: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return null;
};

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	const session = event.cookies.get('meteor_login_token');

	if (!session) {
		event.locals.user = null;
		return withSecurityHeaders(guardAdminRoutes(event) ?? (await resolve(event)));
	}

	const db = await clientPromise();
	const Users = db.collection('users');
	const user = await Users.findOne({ 'services.resume.loginTokens.hashedToken': session });

	if (user) {
		event.locals.user = {
			_id: user._id,
			name: user?.fullName || user?.emails?.[0]?.address,
			email: user?.emails?.[0]?.address,
			firstName: user?.firstName,
			lastName: user?.lastName,
			role: user?.role,
			username: user?.username
		};
	} else {
		event.locals.user = null;
	}

	return withSecurityHeaders(guardAdminRoutes(event) ?? (await resolve(event)));
};

/** @type {import('@sveltejs/kit').HandleServerError} */
export const handleError = ({ error }: { error: any }) => {
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event });
	console.error('⚡️ Dev. Unhandled Error', error);
	console.error('#############################################');
	// console.error({ event });

	if (dev) {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	} else {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	}
};
