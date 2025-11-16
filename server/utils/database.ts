import { ConnectionError, Sequelize } from 'sequelize';

let sequelize: Sequelize | null = null;

export async function useDatabase(): Promise<Sequelize | null> {
  if (sequelize) return sequelize;
  
  const config = useRuntimeConfig();
  sequelize = new Sequelize(
    config.databaseCredentials || process.env.NITRO_DATABASE_CREDENTIALS,
    {
      pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000,
      },
      logging: false,
    }
  );

  initConnectionModel(sequelize);
  initLogModel(sequelize);
  initScheduleModel(sequelize);

  ScheduleModel.belongsTo(ConnectionModel, {
    foreignKey: 'connection_id',
  });

  try {
    await sequelize.sync();
    console.log('Connected to main database :)\n');
  } catch (error) {
    if (error instanceof ConnectionError) {
      console.log('Main database connection error >:(\n');
      console.log(error);
    }
    return null;
  }
  
  return sequelize;
}