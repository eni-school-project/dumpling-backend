import { defineEventHandler, getCookie, getHeader } from "h3";
import type { JWTPayload } from "jose";

export default defineEventHandler(async (event) => {
	const tokenFromCookie = getCookie(event, 'auth_token');

	if (!tokenFromCookie) event.context.user = null;

	const authHeader = getHeader(event, 'Authorization') ?? getHeader(event, 'authorization');

	if (!authHeader) event.context.user = null;

	else {
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

		if (!token) event.context.user = null;

		else {
			const payload: JWTPayload | null = await useVerifyToken(token);
			event.context.user = payload;
		}
	}
});