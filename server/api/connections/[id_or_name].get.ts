export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'id_or_name');

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

    const connection = await ConnectionModel.findByPk(connection_id);

    if (!connection) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Client error',
        message: 'Connection not found'
      });
    }

    return connection;
  }

  const connection = await ConnectionModel.findOne({
    where: { connection_name: param }
  });

  if (!connection) throw createError({
    statusCode: 404,
    statusMessage: 'Client error',
    message: 'Connection not found'
  });

  return connection;
});