import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InvoiceItemAttributes {
  id: string;
  invoiceId: string;
  itemType: string;
  referenceId: string;
  quantity: number;
  price: number;
}

interface InvoiceItemCreationAttributes extends Optional<InvoiceItemAttributes, 'id' | 'quantity'> {}

class InvoiceItem extends Model<InvoiceItemAttributes, InvoiceItemCreationAttributes> implements InvoiceItemAttributes {
  public id!: string;
  public invoiceId!: string;
  public itemType!: string;
  public referenceId!: string;
  public quantity!: number;
  public price!: number;

  static initModel(sequelize: any) {
    InvoiceItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        invoiceId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'invoice_id',
        },
        itemType: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'item_type',
        },
        referenceId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'reference_id',
        },
        quantity: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'invoice_items',
        timestamps: false,
      }
    );
  }
}

export default InvoiceItem;

