import { type JWTPayload, SignJWT, jwtVerify } from "jose";

const secret: Uint8Array<ArrayBuffer> = new TextEncoder().encode(process.env.NITRO_JWT_SECRET);

async function useSignToken(payload: Record<string, any>): Promise<string> {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1d')
		.sign(secret);
}

async function useVerifyToken(token: string): Promise<JWTPayload | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload;
	}
	catch (error) {
		return null;
	}
}


export { useSignToken, useVerifyToken }