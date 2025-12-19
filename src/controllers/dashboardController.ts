import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const revenue = await dashboardService.getRevenueData();
    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    next(error);
  }
};

