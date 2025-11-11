import { createError, defineEventHandler } from "h3";
import mysql from 'mysql2/promise';
import { Client } from 'pg';

export default defineEventHandler(async (event) => {
	const body: ConnectionCredentials = await readBody(event);

	if (!body.connectionType || !body.host || !body.user || !body.password) {
		return { success: false, message: 'Missing critical informations' };
	}

	const TEST_SQL_REQUEST = 'SELECT 1+1 AS result';
	let connection: mysql.Connection | Client | null;

	if (body.connectionType == ConnectionType.mysql) {
		connection = await mysql.createConnection({
			host: body.host,
			port: body.port ?? undefined,
			user: body.user,
			password: body.password,
			database: body.database ?? undefined
		});

		const [response] = await connection.query({ sql: TEST_SQL_REQUEST, rowsAsArray: true });

		if (response[0][0] == 2) {
			await connection.end();
			return { success: true }
		}
		else {
			await connection.end();
			throw createError({
				statusCode: 500,
				message: 'Couldn\'t connect to database'
			});
		}
	}
	else if (body.connectionType === ConnectionType.postgres) {
		connection = new Client({
			host: body.host,
			port: body.port ?? undefined,
			user: body.user,
			password: body.password,
			database: body.database ?? undefined
		});

		await connection.connect();

		const { rows } = await connection.query({ text: TEST_SQL_REQUEST, rowMode: 'array' });

		if (rows[0][0] == 2) {
			await connection.end();
			return { success: true }
		}
		else {
			await connection.end();
			throw createError({
				statusCode: 500,
				message: 'Couldn\'t connect to database'
			});
		}
	}


	if (event.context.user == null) {
		throw createError({
			statusCode: 401,
			statusMessage: "Client Error",
			message: 'Unauthorized'
		});
	}
});