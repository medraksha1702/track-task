import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServiceAttributes {
  id: string;
  customerId: string;
  machineId: string | null;
  serviceType: string;
  description: string | null;
  status: string;
  serviceDate: Date;
  cost: number | null;
  createdAt?: Date;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'machineId' | 'description' | 'status' | 'cost' | 'createdAt'> {}

class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id!: string;
  public customerId!: string;
  public machineId!: string | null;
  public serviceType!: string;
  public description!: string | null;
  public status!: string;
  public serviceDate!: Date;
  public cost!: number | null;
  public readonly createdAt!: Date;

  static initModel(sequelize: any) {
    Service.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        customerId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'customer_id',
        },
        machineId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'machine_id',
        },
        serviceType: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'service_type',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: 'pending',
        },
        serviceDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'service_date',
        },
        cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'services',
        timestamps: false,
      }
    );
  }
}

export default Service;

