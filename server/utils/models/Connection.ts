import { DataTypes, Model, Sequelize } from 'sequelize';

export class ConnectionModel extends Model {
  declare connection_id: number;
  declare connection_type: string;
  declare connection_name: string;
  declare host: string;
  declare port?: number;
  declare username: string;
  declare password: string;
  declare database?: string;
}

export function initConnectionModel(sequelize: Sequelize) {
  ConnectionModel.init(
    {
      connection_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      connection_type: {
        type: DataTypes.ENUM('mysql', 'postgres'),
        allowNull: false,
      },
      connection_name: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      host: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      port: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      database: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'connection',
      timestamps: false,
    }
  );
}