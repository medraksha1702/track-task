import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';
import { CreateCustomerInput, UpdateCustomerInput } from '../validations/customer';

export const createCustomer = async (
  req: Request<{}, {}, CreateCustomerInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (
  req: Request<{}, {}, {}, { search?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const result = await customerService.getAllCustomers(page, limit, req.query.search);
    res.status(200).json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req: Request<{ id: string }, {}, UpdateCustomerInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

