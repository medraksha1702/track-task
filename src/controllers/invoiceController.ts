import { Request, Response, NextFunction } from 'express';
import * as invoiceService from '../services/invoiceService';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../validations/invoice';
import { generateInvoicePDF } from '../services/pdfService';
import { sendInvoiceEmail } from '../services/emailService';
import { Invoice, Customer } from '../models';

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
  req: Request<{ id: string }, {}, { paymentStatus: 'paid' | 'unpaid' | 'partial'; paidAmount?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, {
      paymentStatus: req.body.paymentStatus,
      paidAmount: req.body.paidAmount,
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

export const downloadInvoicePDF = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pdfBuffer = await generateInvoicePDF(req.params.id);
    
    const invoice = await Invoice.findByPk(req.params.id);
    const filename = `Invoice-${invoice?.invoiceNumber || req.params.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const emailInvoice = async (
  req: Request<{ id: string }, {}, { email?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: Customer, as: 'customer' }],
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' },
      });
      return;
    }

    const customer = (invoice as any).customer;
    const recipientEmail = req.body.email || customer.email;

    if (!recipientEmail) {
      res.status(400).json({
        success: false,
        error: { message: 'No email address provided' },
      });
      return;
    }

    await sendInvoiceEmail(
      req.params.id,
      recipientEmail,
      customer.name,
      invoice.invoiceNumber
    );

    res.status(200).json({
      success: true,
      message: `Invoice sent successfully to ${recipientEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

