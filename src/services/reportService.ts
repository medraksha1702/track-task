import { Op, QueryTypes } from 'sequelize';
import { Customer, Service, Invoice, Machine, AMC } from '../models';
import sequelize from '../config/database';

export interface ReportSummary {
  period: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  invoicesCount: number;
  servicesCount: number;
  machinesSold: number;
  topCustomers: Array<{
    customerName: string;
    totalSpent: number;
    invoicesCount: number;
  }>;
  revenueByCategory: {
    machines: number;
    services: number;
  };
  amcStats: {
    totalContracts: number;
    activeContracts: number;
    expiredContracts: number;
    totalAMCValue: number;
    expiring30Days: number;
    servicesUnderAMC: number;
  };
}

export const generateReport = async (startDate: string, endDate: string): Promise<ReportSummary> => {
  const dateFilter = {
    [Op.between]: [new Date(startDate), new Date(endDate)],
  };

  // Get revenue and costs
  const [totalPaidAmount, serviceCosts, invoicesCount, servicesCount] = await Promise.all([
    Invoice.sum('paidAmount', {
      where: {
        paymentStatus: {
          [Op.in]: ['paid', 'partial'],
        },
        invoiceDate: dateFilter,
      },
    }),
    Service.sum('cost', {
      where: {
        serviceDate: dateFilter,
      },
    }),
    Invoice.count({
      where: {
        invoiceDate: dateFilter,
      },
    }),
    Service.count({
      where: {
        serviceDate: dateFilter,
      },
    }),
  ]);

  // Get machine costs
  let machineCosts = 0;
  let machinesSold = 0;
  let machineRevenue = 0;
  
  try {
    const machineStats: any[] = await sequelize.query(
      `
      SELECT 
        COUNT(*) as machines_sold,
        COALESCE(SUM(ii.quantity * m.purchase_price), 0) as total_machine_cost,
        COALESCE(SUM(ii.quantity * ii.price), 0) as machine_revenue
      FROM invoice_items ii
      INNER JOIN invoices i ON ii.invoice_id = i.id
      INNER JOIN machines m ON ii.reference_id = m.id
      WHERE ii.item_type = 'machine'
        AND i.payment_status IN ('paid', 'partial')
        AND i.invoice_date BETWEEN '${startDate}' AND '${endDate}'
      `,
      { type: QueryTypes.SELECT }
    );
    
    if (machineStats[0]) {
      machinesSold = parseInt(machineStats[0].machines_sold) || 0;
      machineCosts = Number(machineStats[0].total_machine_cost) || 0;
      machineRevenue = Number(machineStats[0].machine_revenue) || 0;
    }
  } catch (error) {
    console.error('Error calculating machine stats:', error);
  }

  // Get service revenue
  const serviceRevenue: any[] = await sequelize.query(
    `
    SELECT COALESCE(SUM(ii.quantity * ii.price), 0) as service_revenue
    FROM invoice_items ii
    INNER JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.item_type = 'service'
      AND i.payment_status IN ('paid', 'partial')
      AND i.invoice_date BETWEEN '${startDate}' AND '${endDate}'
    `,
    { type: QueryTypes.SELECT }
  );

  const serviceRev = Number(serviceRevenue[0]?.service_revenue || 0);

  // Get top customers
  const topCustomers: any[] = await sequelize.query(
    `
    SELECT 
      c.name as customer_name,
      COUNT(i.id) as invoices_count,
      COALESCE(SUM(i.paid_amount), 0) as total_spent
    FROM customers c
    INNER JOIN invoices i ON c.id = i.customer_id
    WHERE i.payment_status IN ('paid', 'partial')
      AND i.invoice_date BETWEEN '${startDate}' AND '${endDate}'
    GROUP BY c.id, c.name
    ORDER BY total_spent DESC
    LIMIT 5
    `,
    { type: QueryTypes.SELECT }
  );

  // Get AMC statistics
  const [totalAMCs, activeAMCs, expiredAMCs, totalAMCValue, expiringAMCs] = await Promise.all([
    AMC.count({
      where: {
        startDate: {
          [Op.lte]: new Date(endDate),
        },
        endDate: {
          [Op.gte]: new Date(startDate),
        },
      },
    }),
    AMC.count({
      where: {
        status: 'active',
        startDate: {
          [Op.lte]: new Date(endDate),
        },
        endDate: {
          [Op.gte]: new Date(startDate),
        },
      },
    }),
    AMC.count({
      where: {
        status: 'expired',
        endDate: dateFilter,
      },
    }),
    AMC.sum('contractValue', {
      where: {
        status: 'active',
        startDate: {
          [Op.lte]: new Date(endDate),
        },
        endDate: {
          [Op.gte]: new Date(startDate),
        },
      },
    }),
    AMC.count({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)],
        },
      },
    }),
  ]);

  // Get services under AMC
  const servicesUnderAMC = await Service.count({
    where: {
      amcId: {
        [Op.not]: null,
      },
      serviceDate: dateFilter,
    },
  });

  const totalRevenue = totalPaidAmount || 0;
  const totalServiceCosts = serviceCosts || 0;
  const totalCosts = totalServiceCosts + machineCosts;
  const profit = totalRevenue - totalCosts;

  return {
    period: `${new Date(startDate).toLocaleDateString('en-IN')} - ${new Date(endDate).toLocaleDateString('en-IN')}`,
    totalRevenue,
    totalCosts,
    profit,
    invoicesCount: invoicesCount || 0,
    servicesCount: servicesCount || 0,
    machinesSold,
    topCustomers: topCustomers.map((c: any) => ({
      customerName: c.customer_name,
      totalSpent: Number(c.total_spent),
      invoicesCount: parseInt(c.invoices_count),
    })),
    revenueByCategory: {
      machines: machineRevenue,
      services: serviceRev,
    },
    amcStats: {
      totalContracts: totalAMCs || 0,
      activeContracts: activeAMCs || 0,
      expiredContracts: expiredAMCs || 0,
      totalAMCValue: totalAMCValue || 0,
      expiring30Days: expiringAMCs || 0,
      servicesUnderAMC: servicesUnderAMC || 0,
    },
  };
};

export const getUpcomingServices = async (): Promise<any[]> => {
  const services = await Service.findAll({
    where: {
      status: {
        [Op.in]: ['pending', 'in_progress'],
      },
      serviceDate: {
        [Op.gte]: new Date(),
      },
    },
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
    order: [['serviceDate', 'ASC']],
    limit: 10,
  });

  return services;
};

export const getOverdueInvoices = async (): Promise<any[]> => {
  const invoices = await Invoice.findAll({
    where: {
      paymentStatus: {
        [Op.in]: ['unpaid', 'partial'],
      },
      dueDate: {
        [Op.lt]: new Date(),
        [Op.not]: null,
      },
    },
    include: [{ model: Customer, as: 'customer' }],
    order: [['dueDate', 'ASC']],
  });

  return invoices;
};

