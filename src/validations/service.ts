import { z } from 'zod';

export const createServiceSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    machineId: z.string().uuid('Invalid machine ID').optional().or(z.literal('')),
    serviceType: z.enum(['repair', 'maintenance', 'installation']),
    description: z.string().optional().or(z.literal('')),
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
    serviceDate: z.string().datetime('Invalid date format'),
    cost: z.number().positive('Cost must be positive').optional(),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID').optional(),
    machineId: z.string().uuid('Invalid machine ID').optional().or(z.literal('')),
    serviceType: z.enum(['repair', 'maintenance', 'installation']).optional(),
    description: z.string().optional().or(z.literal('')),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    serviceDate: z.string().datetime('Invalid date format').optional(),
    cost: z.number().positive('Cost must be positive').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid service ID'),
  }),
});

export const getServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid service ID'),
  }),
});

export const searchServicesSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    customerId: z.string().uuid('Invalid customer ID').optional(),
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>['body'];


