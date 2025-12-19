import { Request, Response, NextFunction } from 'express';
import * as machineService from '../services/machineService';
import { CreateMachineInput, UpdateMachineInput } from '../validations/machine';

export const createMachine = async (
  req: Request<{}, {}, CreateMachineInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const machine = await machineService.createMachine(req.body);
    res.status(201).json({
      success: true,
      data: machine,
    });
  } catch (error) {
    next(error);
  }
};

export const getMachine = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const machine = await machineService.getMachineById(req.params.id);
    res.status(200).json({
      success: true,
      data: machine,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMachines = async (
  req: Request<{}, {}, {}, { status?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const result = await machineService.getAllMachines(page, limit, req.query.status);
    res.status(200).json({
      success: true,
      data: result.machines,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMachine = async (
  req: Request<{ id: string }, {}, UpdateMachineInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const machine = await machineService.updateMachine(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: machine,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (
  req: Request<{ id: string }, {}, { quantity: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const machine = await machineService.updateStock(req.params.id, req.body.quantity);
    res.status(200).json({
      success: true,
      data: machine,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMachine = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await machineService.deleteMachine(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

