import { ConnectionCredentials } from "~/utils/types";

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as ConnectionCredentials;

  if (!body || !body.connectionName || !body.connectionType || !body.host || !body.user || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Client error',
      message: 'Missing connection information',
      fatal: true,
    });
  }
  const database = await useDatabase();

  const { ConnectionModel } = database.models;

  const connection = await ConnectionModel.create({
    ...body,
    connection_type: body.connectionType,
    connection_name: body.connectionName,
    username: body.user,
  });

  return connection.save();
});