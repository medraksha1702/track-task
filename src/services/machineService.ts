import { Op } from 'sequelize';
import { Machine, Service } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { CreateMachineInput, UpdateMachineInput } from '../validations/machine';

export const createMachine = async (input: CreateMachineInput) => {
  const machine = await Machine.create({
    name: input.name,
    model: input.model || null,
    serialNumber: input.serialNumber || null,
    purchasePrice: input.purchasePrice,
    sellingPrice: input.sellingPrice,
    stockQuantity: input.stockQuantity || 0,
    status: input.status || 'available',
  });

  return machine;
};

export const getMachineById = async (id: string) => {
  const machine = await Machine.findByPk(id, {
    include: [
      {
        model: Service,
        as: 'services',
        limit: 10,
        order: [['createdAt', 'DESC']],
      },
    ],
  });

  if (!machine) {
    throw new NotFoundError('Machine not found');
  }

  return machine;
};

export const getAllMachines = async (
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  const offset = (page - 1) * limit;

  const where = status ? { status } : {};

  const { count, rows: machines } = await Machine.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    machines,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const updateMachine = async (id: string, input: UpdateMachineInput) => {
  const machine = await Machine.findByPk(id);

  if (!machine) {
    throw new NotFoundError('Machine not found');
  }

  // Prevent direct status change to 'sold' - must be done through invoice creation
  if (input.status === 'sold' && machine.status !== 'sold') {
    throw new BadRequestError('Cannot mark machine as sold directly. Please create an invoice to sell this machine.');
  }

  const updateData: any = {};
  if (input.name) updateData.name = input.name;
  if (input.model !== undefined) updateData.model = input.model || null;
  if (input.serialNumber !== undefined) updateData.serialNumber = input.serialNumber || null;
  if (input.purchasePrice !== undefined) updateData.purchasePrice = input.purchasePrice;
  if (input.sellingPrice !== undefined) updateData.sellingPrice = input.sellingPrice;
  if (input.stockQuantity !== undefined) updateData.stockQuantity = input.stockQuantity;
  if (input.status && input.status !== 'sold') updateData.status = input.status;

  await machine.update(updateData);

  return machine;
};

export const updateStock = async (id: string, quantity: number) => {
  const machine = await Machine.findByPk(id);

  if (!machine) {
    throw new NotFoundError('Machine not found');
  }

  const newQuantity = Number(machine.stockQuantity) + quantity;

  if (newQuantity < 0) {
    throw new BadRequestError('Insufficient stock');
  }

  await machine.update({
    stockQuantity: newQuantity,
    ...(newQuantity === 0 && { status: 'sold' }),
  });

  return machine;
};

export const deleteMachine = async (id: string) => {
  const machine = await Machine.findByPk(id);

  if (!machine) {
    throw new NotFoundError('Machine not found');
  }

  await machine.destroy();

  return { message: 'Machine deleted successfully' };
};

