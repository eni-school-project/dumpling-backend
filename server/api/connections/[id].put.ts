import { ConnectionCredentials } from "~/utils/types";

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'id');

  const database = await useDatabase();

  const { ConnectionModel } = database.models;

  if (param.match(/^\d+$/)) {
    const connection_id = parseInt(param);

    if (Number.isNaN(connection_id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client error',
        message: 'Invalid connection ID',
      });
    }

    const body = await readBody(event) as ConnectionCredentials;

    if (!body || !body.connectionName || !body.connectionType || !body.host || !body.user || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client error',
        message: 'Missing connection information',
        fatal: true,
      });
    }

    return await ConnectionModel.update({
      ...body,
      connection_type: body.connectionType,
      connection_name: body.connectionName,
      username: body.user,
    }, { where: { connection_id: connection_id } });
  }

  else throw createError({
    statusCode: 400,
    statusMessage: 'Client error',
    message: 'Invalid connection ID',
  });
});