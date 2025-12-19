import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/serviceService';
import { CreateServiceInput, UpdateServiceInput } from '../validations/service';

export const createService = async (
  req: Request<{}, {}, CreateServiceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = await serviceService.createService(req.body);
    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const getService = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (
  req: Request<
    {},
    {},
    {},
    {
      status?: string;
      customerId?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const result = await serviceService.getAllServices(page, limit, {
      status: req.query.status,
      customerId: req.query.customerId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });
    res.status(200).json({
      success: true,
      data: result.services,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (
  req: Request<{ id: string }, {}, UpdateServiceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = await serviceService.updateService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await serviceService.deleteService(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

