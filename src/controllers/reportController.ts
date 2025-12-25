import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/reportService';

export const getReport = async (
  req: Request<{}, {}, {}, { startDate: string; endDate: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: { message: 'startDate and endDate are required' },
      });
      return;
    }

    const report = await reportService.generateReport(startDate, endDate);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services = await reportService.getUpcomingServices();
    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoices = await reportService.getOverdueInvoices();
    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

