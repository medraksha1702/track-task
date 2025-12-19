import { Op } from 'sequelize';
import { Customer, Service, Invoice } from '../models';
import { NotFoundError } from '../utils/errors';
import { CreateCustomerInput, UpdateCustomerInput } from '../validations/customer';

export const createCustomer = async (input: CreateCustomerInput) => {
  const customer = await Customer.create({
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    address: input.address || null,
    hospitalOrLabName: input.hospitalOrLabName || null,
  });

  return customer;
};

export const getCustomerById = async (id: string) => {
  const customer = await Customer.findByPk(id, {
    include: [
      {
        model: Service,
        as: 'services',
        limit: 10,
        order: [['createdAt', 'DESC']],
      },
      {
        model: Invoice,
        as: 'invoices',
        limit: 10,
        order: [['createdAt', 'DESC']],
      },
    ],
  });

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  return customer;
};

export const getAllCustomers = async (page: number = 1, limit: number = 10, search?: string) => {
  const offset = (page - 1) * limit;

  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  const { count, rows: customers } = await Customer.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    customers,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const updateCustomer = async (id: string, input: UpdateCustomerInput) => {
  const customer = await Customer.findByPk(id);

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  const updateData: any = {};
  if (input.name) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email || null;
  if (input.phone !== undefined) updateData.phone = input.phone || null;
  if (input.address !== undefined) updateData.address = input.address || null;
  if (input.hospitalOrLabName !== undefined) updateData.hospitalOrLabName = input.hospitalOrLabName || null;

  await customer.update(updateData);

  return customer;
};

export const deleteCustomer = async (id: string) => {
  const customer = await Customer.findByPk(id);

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  await customer.destroy();

  return { message: 'Customer deleted successfully' };
};

