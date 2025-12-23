import { Op } from 'sequelize';
import { sequelize, Invoice, InvoiceItem, Customer, Service, Machine } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../validations/invoice';

const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year + 1}-01-01`);

  const count = await Invoice.count({
    where: {
      invoiceDate: {
        [Op.gte]: startOfYear,
        [Op.lt]: endOfYear,
      },
    },
  });

  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  return invoiceNumber;
};

export const createInvoice = async (input: CreateInvoiceInput) => {
  // Verify customer exists
  const customer = await Customer.findByPk(input.customerId);

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Validate items and calculate total
  let totalAmount = 0;

  for (const item of input.items) {
    if (item.itemType === 'service') {
      const service = await Service.findByPk(item.referenceId);

      if (!service) {
        throw new NotFoundError(`Service with ID ${item.referenceId} not found`);
      }
    } else if (item.itemType === 'machine') {
      const machine = await Machine.findByPk(item.referenceId);

      if (!machine) {
        throw new NotFoundError(`Machine with ID ${item.referenceId} not found`);
      }

      if (Number(machine.stockQuantity) < item.quantity) {
        throw new BadRequestError(`Insufficient stock for machine ${machine.name}`);
      }
    }

    totalAmount += item.price * item.quantity;
  }

  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice with items in a transaction
  const invoice = await sequelize.transaction(async (t) => {
    const newInvoice = await Invoice.create(
      {
        customerId: input.customerId,
        invoiceNumber,
        totalAmount,
        paidAmount: 0,
        invoiceDate: new Date(input.invoiceDate),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        paymentStatus: 'unpaid',
      },
      { transaction: t }
    );

    // Create invoice items
    await InvoiceItem.bulkCreate(
      input.items.map((item) => ({
        invoiceId: newInvoice.id,
        itemType: item.itemType,
        referenceId: item.referenceId,
        quantity: item.quantity,
        price: item.price,
      })),
      { transaction: t }
    );

    // Update machine stock if any machines were sold
    for (const item of input.items) {
      if (item.itemType === 'machine') {
        const machine = await Machine.findByPk(item.referenceId, { transaction: t });
        if (machine) {
          const newQuantity = Number(machine.stockQuantity) - item.quantity;
          await machine.update(
            {
              stockQuantity: newQuantity,
              ...(newQuantity === 0 && { status: 'sold' }),
            },
            { transaction: t }
          );
        }
      }
    }

    const invoiceWithRelations = await Invoice.findByPk(newInvoice.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' },
      ],
      transaction: t,
    });

    return invoiceWithRelations;
  });

  return invoice;
};

export const getInvoiceById = async (id: string) => {
  const invoice = await Invoice.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: InvoiceItem, as: 'items' },
    ],
  });

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Fetch related service/machine details for each item
  const items = (invoice as any).items as InvoiceItem[];
  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      let details = null;

      if (item.itemType === 'service') {
        details = await Service.findByPk(item.referenceId);
      } else if (item.itemType === 'machine') {
        details = await Machine.findByPk(item.referenceId);
      }

      return {
        ...item.toJSON(),
        details,
      };
    })
  );

  return {
    ...invoice.toJSON(),
    items: itemsWithDetails,
  };
};

export const getAllInvoices = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows: invoices } = await Invoice.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Customer, as: 'customer' },
      { model: InvoiceItem, as: 'items' },
    ],
  });

  return {
    invoices,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const updateInvoice = async (id: string, input: UpdateInvoiceInput) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  const updateData: any = {};
  if (input.paymentStatus) {
    const currentTotal = Number(invoice.totalAmount);
    const paidAmountInput = input.paidAmount ?? Number(invoice.paidAmount ?? 0);

    if (input.paymentStatus === 'paid') {
      updateData.paymentStatus = 'paid';
      updateData.paidAmount = currentTotal;
    } else if (input.paymentStatus === 'unpaid') {
      updateData.paymentStatus = 'unpaid';
      updateData.paidAmount = 0;
    } else if (input.paymentStatus === 'partial') {
      if (input.paidAmount === undefined) {
        throw new BadRequestError('paidAmount is required when setting status to partial');
      }
      if (input.paidAmount < 0) {
        throw new BadRequestError('paidAmount cannot be negative');
      }
      if (input.paidAmount >= currentTotal) {
        throw new BadRequestError('paidAmount must be less than totalAmount for partial status');
      }
      updateData.paymentStatus = 'partial';
      updateData.paidAmount = input.paidAmount;
    }
  }

  if (input.paidAmount !== undefined && !input.paymentStatus) {
    // Allow direct paidAmount updates by deriving status
    const newPaid = input.paidAmount;
    const currentTotal = Number(invoice.totalAmount);
    if (newPaid < 0) {
      throw new BadRequestError('paidAmount cannot be negative');
    }
    if (newPaid === 0) {
      updateData.paymentStatus = 'unpaid';
    } else if (newPaid >= currentTotal) {
      updateData.paymentStatus = 'paid';
      updateData.paidAmount = currentTotal;
    } else {
      updateData.paymentStatus = 'partial';
      updateData.paidAmount = newPaid;
    }
  }

  if (input.dueDate) updateData.dueDate = new Date(input.dueDate);

  await invoice.update(updateData);

  const updatedInvoice = await Invoice.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: InvoiceItem, as: 'items' },
    ],
  });

  return updatedInvoice;
};

export const deleteInvoice = async (id: string) => {
  const invoice = await Invoice.findByPk(id, {
    include: [{ model: InvoiceItem, as: 'items' }],
  });

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Restore machine stock if invoice is deleted
  const items = (invoice as any).items as InvoiceItem[];
  await sequelize.transaction(async (t) => {
    for (const item of items) {
      if (item.itemType === 'machine') {
        const machine = await Machine.findByPk(item.referenceId, { transaction: t });
        if (machine) {
          await machine.update(
            {
              stockQuantity: Number(machine.stockQuantity) + item.quantity,
              status: 'available',
            },
            { transaction: t }
          );
        }
      }
    }

    await invoice.destroy({ transaction: t });
  });

  return { message: 'Invoice deleted successfully' };
};

