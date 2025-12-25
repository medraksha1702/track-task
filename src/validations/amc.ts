import { z } from 'zod';

export const createAMCSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    machineId: z.string().uuid('Invalid machine ID'),
    contractNumber: z.string().min(1, 'Contract number is required'),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
    contractValue: z.number().positive('Contract value must be positive'),
    renewalDate: z.string().datetime('Invalid renewal date').optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateAMCSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID').optional(),
    machineId: z.string().uuid('Invalid machine ID').optional(),
    contractNumber: z.string().min(1, 'Contract number is required').optional(),
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    contractValue: z.number().positive('Contract value must be positive').optional(),
    status: z.enum(['active', 'expired', 'renewed', 'cancelled']).optional(),
    renewalDate: z.string().datetime('Invalid renewal date').optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid AMC ID'),
  }),
});

export const getAMCSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid AMC ID'),
  }),
});

export const searchAMCSchema = z.object({
  query: z.object({
    status: z.enum(['active', 'expired', 'renewed', 'cancelled']).optional(),
    customerId: z.string().uuid().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export type CreateAMCInput = z.infer<typeof createAMCSchema>['body'];
export type UpdateAMCInput = z.infer<typeof updateAMCSchema>['body'];

