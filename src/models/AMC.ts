import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AMCAttributes {
  id: string;
  customerId: string;
  machineId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  contractValue: number;
  status: 'active' | 'expired' | 'renewed' | 'cancelled';
  renewalDate: Date | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AMCCreationAttributes extends Optional<AMCAttributes, 'id' | 'status' | 'renewalDate' | 'notes' | 'createdAt' | 'updatedAt'> {}

class AMC extends Model<AMCAttributes, AMCCreationAttributes> implements AMCAttributes {
  public id!: string;
  public customerId!: string;
  public machineId!: string;
  public contractNumber!: string;
  public startDate!: Date;
  public endDate!: Date;
  public contractValue!: number;
  public status!: 'active' | 'expired' | 'renewed' | 'cancelled';
  public renewalDate!: Date | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: any) {
    AMC.init(
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
          allowNull: false,
          field: 'machine_id',
        },
        contractNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          field: 'contract_number',
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'start_date',
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'end_date',
        },
        contractValue: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'contract_value',
        },
        status: {
          type: DataTypes.ENUM('active', 'expired', 'renewed', 'cancelled'),
          allowNull: false,
          defaultValue: 'active',
        },
        renewalDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'renewal_date',
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'amcs',
        timestamps: true,
      }
    );
  }
}

export default AMC;

