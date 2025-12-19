import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MachineAttributes {
  id: string;
  name: string;
  model: string | null;
  serialNumber: string | null;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  status: string;
  createdAt?: Date;
}

interface MachineCreationAttributes extends Optional<MachineAttributes, 'id' | 'model' | 'serialNumber' | 'stockQuantity' | 'status' | 'createdAt'> {}

class Machine extends Model<MachineAttributes, MachineCreationAttributes> implements MachineAttributes {
  public id!: string;
  public name!: string;
  public model!: string | null;
  public serialNumber!: string | null;
  public purchasePrice!: number;
  public sellingPrice!: number;
  public stockQuantity!: number;
  public status!: string;
  public readonly createdAt!: Date;

  static initModel(sequelize: any) {
    Machine.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        serialNumber: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'serial_number',
        },
        purchasePrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'purchase_price',
        },
        sellingPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'selling_price',
        },
        stockQuantity: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'stock_quantity',
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: 'available',
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'machines',
        timestamps: false,
      }
    );
  }
}

export default Machine;

