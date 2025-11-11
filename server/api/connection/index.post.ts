import { createError, defineEventHandler } from "h3";
import { Client } from 'pg';
import mysql from 'mysql2/promise';
import { ConnectionCredentials, User } from "~/utils/types";

const TEST_SQL_REQUEST = 'SELECT 1+1 AS result';

async function checkMysql(body: ConnectionCredentials) {
	const connection = await mysql.createConnection({
		host: body.host,
		port: body.port ?? undefined,
		user: body.user,
		password: body.password,
		database: body.database ?? undefined
	});

	const [response] = await connection.query({ sql: TEST_SQL_REQUEST, rowsAsArray: true });

	if (response[0][0] == 2) {
		return connection;
	}
	else {
		await connection.end();
		return;
	}
}

async function checkPostgres(body: ConnectionCredentials) {
	const connection = new Client({
		host: body.host,
		port: body.port ?? undefined,
		user: body.user,
		password: body.password,
		database: body.database ?? undefined
	});

	await connection.connect();

	const { rows } = await connection.query({ text: TEST_SQL_REQUEST, rowMode: 'array' });

	if (rows[0][0] == 2) {
		return connection;
	}
	else {
		await connection.end();
		return;
	}
}

export default defineEventHandler(async (event) => {
	const body: ConnectionCredentials = await readBody(event);

	if (!body.connectionType || !body.host || !body.user || !body.password) {
		return { success: false, message: 'Missing critical informations' };
	}

	let connection: mysql.Connection | Client | null;

	try {
		if (body.connectionType == ConnectionType.mysql) {
			connection = await checkMysql(body);
		}
		else if (body.connectionType == ConnectionType.postgres) {
			connection = await checkPostgres(body);
		}
		else {
			throw createError({
				statusCode: 500,
				message: 'Unsupported connection type'
			});
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
			maxAge: 60 * 60
		});

		const storage = useStorage('data');
		await storage.setItem('current_connection', body);

		return { success: true, token };

	} catch (error) {
		if (connection) await connection.end();

		throw createError({
			statusCode: 500,
			message: 'Couldn\'t connect to database'
		});
	} finally {
		if (connection) await connection.end();
	}
});