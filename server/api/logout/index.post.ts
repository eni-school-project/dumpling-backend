import { createError, defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler((event) => {
	if (event.context.user == null) {
		throw createError({
			statusCode: 401,
			statusMessage: "Client Error",
			message: 'Unauthorized'
		});
	}

	deleteCookie(event, 'auth_token', { path: '/' });
	return { success: true };
});