import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    invoiceDate: z.string().datetime('Invalid invoice date'),
    dueDate: z.string().datetime('Invalid due date').optional(),
    items: z.array(
      z.object({
        itemType: z.enum(['service', 'machine']),
        referenceId: z.string().uuid('Invalid reference ID'),
        quantity: z.number().int().positive('Quantity must be positive').default(1),
        price: z.number().positive('Price must be positive'),
      })
    ).min(1, 'Invoice must have at least one item'),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(['paid', 'unpaid', 'partial']).optional(),
    dueDate: z.string().datetime('Invalid due date').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
});

export const getInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
});

export const searchInvoicesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
  body: z.object({
    paymentStatus: z.enum(['paid', 'unpaid', 'partial']),
  }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>['body'];


