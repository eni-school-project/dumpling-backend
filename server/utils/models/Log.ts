import { DataTypes, Model, Sequelize } from 'sequelize';

export class LogModel extends Model {
  declare log_id: number;
  declare status: string;
  declare message: string;
  declare start_date: Date;
  declare end_date: Date;
  declare error?: string;
}

export function initLogModel(sequelize: Sequelize) {
  LogModel.init(
    {
      log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM('INFO', 'WARNING', 'ERROR', 'FATAL'),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING(25500),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      error: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'log',
      timestamps: true,
      createdAt: 'start_date',
      updatedAt: false,
    }
  );
}