import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'createdAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: string;
  public readonly createdAt!: Date;

  static initModel(sequelize: any) {
    User.init(
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
          allowNull: false,
          unique: true,
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'password_hash',
        },
        role: {
          type: DataTypes.STRING,
          defaultValue: 'admin',
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: false,
      }
    );
  }
}

export default User;

