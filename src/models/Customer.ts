import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CustomerAttributes {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  hospitalOrLabName: string | null;
  createdAt?: Date;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'email' | 'phone' | 'address' | 'hospitalOrLabName' | 'createdAt'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: string;
  public name!: string;
  public email!: string | null;
  public phone!: string | null;
  public address!: string | null;
  public hospitalOrLabName!: string | null;
  public readonly createdAt!: Date;

  static initModel(sequelize: any) {
    Customer.init(
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
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        hospitalOrLabName: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'hospital_or_lab_name',
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'customers',
        timestamps: false,
      }
    );
  }
}

export default Customer;

