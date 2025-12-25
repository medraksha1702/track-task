import { Request, Response, NextFunction } from 'express';
import * as amcService from '../services/amcService';
import { sendAMCRenewalReminderEmail } from '../services/emailService';
import { CreateAMCInput, UpdateAMCInput } from '../validations/amc';

export const createAMC = async (
  req: Request<{}, {}, CreateAMCInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const amc = await amcService.createAMC(req.body);
    res.status(201).json({
      success: true,
      data: amc,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAMCs = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string; status?: string; customerId?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const result = await amcService.getAllAMCs(page, limit, req.query.status, req.query.customerId);
    res.status(200).json({
      success: true,
      data: {
        amcs: result.amcs,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAMC = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const amc = await amcService.getAMCById(req.params.id);
    res.status(200).json({
      success: true,
      data: amc,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAMC = async (
  req: Request<{ id: string }, {}, UpdateAMCInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const amc = await amcService.updateAMC(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: amc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAMC = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await amcService.deleteAMC(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiringAMCs = async (
  req: Request<{}, {}, {}, { days?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const amcs = await amcService.getExpiringAMCs(days);
    res.status(200).json({
      success: true,
      data: amcs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAMCStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await amcService.getAMCStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const sendRenewalReminder = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const amc = await amcService.getAMCById(req.params.id);
    const customer = (amc as any).customer;
    const machine = (amc as any).machine;

    if (!customer?.email) {
      res.status(400).json({
        success: false,
        error: { message: 'Customer email not found' },
      });
      return;
    }

    await sendAMCRenewalReminderEmail(
      customer.email,
      customer.name,
      amc.contractNumber,
      amc.endDate,
      Number(amc.contractValue),
      machine?.name || 'Equipment'
    );

    res.status(200).json({
      success: true,
      message: `Renewal reminder sent successfully to ${customer.email}`,
    });
  } catch (error) {
    next(error);
  }
};

