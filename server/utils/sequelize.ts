import { ConnectionError, Sequelize } from 'sequelize';
import { ConnectionCredentials } from './types';

export async function useSequelize(credentials: ConnectionCredentials): Promise<Sequelize> {
  const sequelize = new Sequelize(
    {
      ...credentials,
      dialect: credentials.connectionType,
      port: credentials.port ?? undefined,
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
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
      message: 'Couldn\'t connect to database',
    });
  }

  return sequelize;
}
