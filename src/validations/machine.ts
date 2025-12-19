import { z } from 'zod';

export const createMachineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    model: z.string().optional().or(z.literal('')),
    serialNumber: z.string().optional().or(z.literal('')),
    purchasePrice: z.number().positive('Purchase price must be positive'),
    sellingPrice: z.number().positive('Selling price must be positive'),
    stockQuantity: z.number().int().min(0).default(0),
    status: z.enum(['available', 'sold', 'under_service']).default('available'),
  }),
});

export const updateMachineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    model: z.string().optional().or(z.literal('')),
    serialNumber: z.string().optional().or(z.literal('')),
    purchasePrice: z.number().positive('Purchase price must be positive').optional(),
    sellingPrice: z.number().positive('Selling price must be positive').optional(),
    stockQuantity: z.number().int().min(0).optional(),
    status: z.enum(['available', 'sold', 'under_service']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid machine ID'),
  }),
});

export const getMachineSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid machine ID'),
  }),
});

export const searchMachinesSchema = z.object({
  query: z.object({
    status: z.enum(['available', 'sold', 'under_service']).optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export const updateStockSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid machine ID'),
  }),
  body: z.object({
    quantity: z.number().int('Quantity must be an integer'),
  }),
});

export type CreateMachineInput = z.infer<typeof createMachineSchema>['body'];
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>['body'];


