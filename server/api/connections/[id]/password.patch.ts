import { ConnectionCredentials, ConnectionType } from "~/utils/types";

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

    const body = await readBody(event);

    if (!body || !body.oldPassword || !body.newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client error',
        message: 'Missing passwords',
        fatal: true,
      });
    }

    const connection = await ConnectionModel.findByPk(connection_id) as ConnectionModel;

    if (!connection) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Client error',
        message: 'Connection not found'
      });
    }

    const credentials: ConnectionCredentials = {
      ...connection.toJSON(),
      connectionType: connection.connection_type as ConnectionType,
      user: connection.username,
      password: body.oldPassword,
    }

    const sequelize = await useSequelize(credentials);

    if (!!sequelize) {
      return await ConnectionModel.update({
        password: body.newPassword,
      }, { where: { connection_id: connection_id } });
    }
  }

  else throw createError({
    statusCode: 400,
    statusMessage: 'Client error',
    message: 'Invalid connection ID',
  });
});