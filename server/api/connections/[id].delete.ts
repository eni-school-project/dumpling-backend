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

    return await ConnectionModel.destroy({
      where: { connection_id: connection_id }
    });
  }

  else throw createError({
    statusCode: 400,
    statusMessage: 'Client error',
    message: 'Invalid connection ID',
  });
});