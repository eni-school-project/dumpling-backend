import { createError, defineEventHandler } from "h3";

export default defineEventHandler((event) => {
	if (event.context.user == null) {
		throw createError({
			statusCode: 401,
			statusMessage: "Client Error",
			message: 'Unauthorized'
		});
	}
	return 'yoo';
});