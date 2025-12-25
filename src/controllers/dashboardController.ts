import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';

export const getDashboardStats = async (
  req: Request<{}, {}, {}, { startDate?: string; endDate?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await dashboardService.getDashboardStats(startDate, endDate);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueData = async (
  req: Request<{}, {}, {}, { startDate?: string; endDate?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const revenue = await dashboardService.getRevenueData(startDate, endDate);
    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    next(error);
  }
};

