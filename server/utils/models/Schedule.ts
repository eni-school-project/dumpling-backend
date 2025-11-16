import { DataTypes, Model, Sequelize } from 'sequelize';

export class ScheduleModel extends Model {
  declare schedule_id: number;
  declare frequency: string;
  declare backup_type: string;
  declare path: string;
  declare connection_id: number;
}

export function initScheduleModel(sequelize: Sequelize) {
  ScheduleModel.init(
    {
      schedule_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      frequency: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      backup_type: {
        type: DataTypes.ENUM('COMPLETE', 'DIFFERENTIAL', 'INCREMENTIAL'),
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          contains: '.data/dump/',
        },
      },
      connection_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'schedule',
      timestamps: false,
    }
  );
}