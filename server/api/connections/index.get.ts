export default defineEventHandler(async () => {
  const database = await useDatabase();

  const { ConnectionModel } = database.models;

  return await ConnectionModel.findAll();
});