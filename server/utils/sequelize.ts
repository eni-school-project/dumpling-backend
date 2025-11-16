import { ConnectionError, Sequelize } from 'sequelize';
// import { ConnectionCredentials } from './types';

export async function useSequelize(credentials: ConnectionCredentials): Promise<Sequelize | null> {
  const sequelize = new Sequelize(
    {
      dialect: credentials.connectionType,
      host: credentials.host,
      port: credentials.port ?? undefined,
      username: credentials.user,
      password: credentials.password,
      database: credentials.database ?? undefined,
      pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000,
      },
      logging: false,
    }
  )

  try {
    await sequelize.authenticate();
  } catch (error) {
    if (error instanceof ConnectionError) {
      console.log(error);
    }
    return;
  }

  return sequelize;
}
