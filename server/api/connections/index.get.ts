export default defineEventHandler(async (event) => {
  const database = await useDatabase();

  if (!database) throw createError({
    statusCode: 500,
    message: 'Couldn\'t connect to database'
  });

  const { ConnectionModel } = database.models;

  const connections = await ConnectionModel.findAll();

  return connections;
});