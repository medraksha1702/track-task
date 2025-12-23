import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InvoiceAttributes {
  id: string;
  customerId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  invoiceDate: Date;
  dueDate: Date | null;
  createdAt?: Date;
}

interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'id' | 'paymentStatus' | 'dueDate' | 'createdAt' | 'paidAmount'> {}

class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  public id!: string;
  public customerId!: string;
  public invoiceNumber!: string;
  public totalAmount!: number;
  public paidAmount!: number;
  public paymentStatus!: string;
  public invoiceDate!: Date;
  public dueDate!: Date | null;
  public readonly createdAt!: Date;

  static initModel(sequelize: any) {
    Invoice.init(
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
        invoiceNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          field: 'invoice_number',
        },
        totalAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'total_amount',
        },
        paidAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          field: 'paid_amount',
        },
        paymentStatus: {
          type: DataTypes.STRING,
          defaultValue: 'unpaid',
          field: 'payment_status',
        },
        invoiceDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'invoice_date',
        },
        dueDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'due_date',
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'invoices',
        timestamps: false,
      }
    );
  }
}

export default Invoice;

