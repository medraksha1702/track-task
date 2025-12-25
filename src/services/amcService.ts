import { Op } from 'sequelize';
import { AMC, Customer, Machine } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { CreateAMCInput, UpdateAMCInput } from '../validations/amc';

const generateContractNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await AMC.count({
    where: {
      contractNumber: {
        [Op.like]: `AMC-${year}-%`,
      },
    },
  });
  const contractNumber = `AMC-${year}-${String(count + 1).padStart(4, '0')}`;
  return contractNumber;
};

export const createAMC = async (input: CreateAMCInput) => {
  // Verify customer exists
  const customer = await Customer.findByPk(input.customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Verify machine exists
  const machine = await Machine.findByPk(input.machineId);
  if (!machine) {
    throw new NotFoundError('Machine not found');
  }

  // Validate dates
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate <= startDate) {
    throw new BadRequestError('End date must be after start date');
  }

  // Use provided contract number or generate one
  const contractNumber = input.contractNumber || await generateContractNumber();

  // Check if contract number already exists
  const existingContract = await AMC.findOne({ where: { contractNumber } });
  if (existingContract) {
    throw new BadRequestError('Contract number already exists');
  }

  // Auto-set status based on dates
  let status: 'active' | 'expired' | 'renewed' | 'cancelled' = 'active';
  const now = new Date();
  if (endDate < now) {
    status = 'expired';
  }

  const amc = await AMC.create({
    customerId: input.customerId,
    machineId: input.machineId,
    contractNumber,
    startDate,
    endDate,
    contractValue: input.contractValue,
    status,
    renewalDate: input.renewalDate ? new Date(input.renewalDate) : null,
    notes: input.notes || null,
  });

  return await AMC.findByPk(amc.id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });
};

export const getAllAMCs = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  customerId?: string
) => {
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (customerId) {
    where.customerId = customerId;
  }

  const { count, rows: amcs } = await AMC.findAndCountAll({
    where,
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    amcs,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getAMCById = async (id: string) => {
  const amc = await AMC.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });

  if (!amc) {
    throw new NotFoundError('AMC not found');
  }

  return amc;
};

export const updateAMC = async (id: string, input: UpdateAMCInput) => {
  const amc = await AMC.findByPk(id);
  if (!amc) {
    throw new NotFoundError('AMC not found');
  }

  // Verify customer exists if updating
  if (input.customerId) {
    const customer = await Customer.findByPk(input.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
  }

  // Verify machine exists if updating
  if (input.machineId) {
    const machine = await Machine.findByPk(input.machineId);
    if (!machine) {
      throw new NotFoundError('Machine not found');
    }
  }

  // Validate dates if updating
  if (input.startDate || input.endDate) {
    const startDate = input.startDate ? new Date(input.startDate) : amc.startDate;
    const endDate = input.endDate ? new Date(input.endDate) : amc.endDate;
    if (endDate <= startDate) {
      throw new BadRequestError('End date must be after start date');
    }
  }

  // Check contract number uniqueness if updating
  if (input.contractNumber && input.contractNumber !== amc.contractNumber) {
    const existingContract = await AMC.findOne({ where: { contractNumber: input.contractNumber } });
    if (existingContract) {
      throw new BadRequestError('Contract number already exists');
    }
  }

  // Auto-update status based on dates
  let status = input.status || amc.status;
  if (!input.status) {
    const endDate = input.endDate ? new Date(input.endDate) : amc.endDate;
    const now = new Date();
    if (endDate < now && amc.status === 'active') {
      status = 'expired';
    }
  }

  const updateData: any = {};
  if (input.customerId) updateData.customerId = input.customerId;
  if (input.machineId) updateData.machineId = input.machineId;
  if (input.contractNumber) updateData.contractNumber = input.contractNumber;
  if (input.startDate) updateData.startDate = new Date(input.startDate);
  if (input.endDate) updateData.endDate = new Date(input.endDate);
  if (input.contractValue !== undefined) updateData.contractValue = input.contractValue;
  if (input.status) updateData.status = input.status;
  if (input.renewalDate !== undefined) updateData.renewalDate = input.renewalDate ? new Date(input.renewalDate) : null;
  if (input.notes !== undefined) updateData.notes = input.notes;
  updateData.status = status;

  await amc.update(updateData);

  return await AMC.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });
};

export const deleteAMC = async (id: string) => {
  const amc = await AMC.findByPk(id);
  if (!amc) {
    throw new NotFoundError('AMC not found');
  }

  await amc.destroy();
  return { message: 'AMC deleted successfully' };
};

export const getExpiringAMCs = async (days: number = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const now = new Date();

  const amcs = await AMC.findAll({
    where: {
      status: 'active',
      endDate: {
        [Op.between]: [now, futureDate],
      },
    },
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
    order: [['endDate', 'ASC']],
  });

  return amcs;
};

export const getAMCStats = async () => {
  const [total, active, expired, expiring30, expiring60, expiring90, totalValue] = await Promise.all([
    AMC.count(),
    AMC.count({ where: { status: 'active' } }),
    AMC.count({ where: { status: 'expired' } }),
    AMC.count({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)],
        },
      },
    }),
    AMC.count({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)],
        },
      },
    }),
    AMC.count({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)],
        },
      },
    }),
    AMC.sum('contractValue', { where: { status: 'active' } }),
  ]);

  return {
    total,
    active,
    expired,
    expiring30,
    expiring60,
    expiring90,
    totalValue: totalValue || 0,
  };
};

