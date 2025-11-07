import { defineEventHandler, readBody, setCookie } from "h3";
import { useSignToken } from "../../utils/jwt";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	if (!body || !body.connectionType) {
		return { success: false, message: 'Missing information' }
	}

	const user: User = {
		connectionType: body.connectionType,
		loginDate: new Date().toISOString()
	};

	const token: string = await useSignToken(user);

	setCookie(event, 'auth_token', token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24
	});

	return { success: true, token };
});