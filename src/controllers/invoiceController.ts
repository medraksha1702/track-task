import { Request, Response, NextFunction } from 'express';
import * as invoiceService from '../services/invoiceService';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../validations/invoice';

export const createInvoice = async (
  req: Request<{}, {}, CreateInvoiceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const result = await invoiceService.getAllInvoices(page, limit);
    res.status(200).json({
      success: true,
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (
  req: Request<{ id: string }, {}, UpdateInvoiceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: Request<{ id: string }, {}, { paymentStatus: 'paid' | 'unpaid' | 'partial' }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, {
      paymentStatus: req.body.paymentStatus,
    });
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

