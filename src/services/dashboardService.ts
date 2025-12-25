import { Op, QueryTypes } from 'sequelize';
import { Customer, Service, Invoice, Machine, InvoiceItem } from '../models';
import sequelize from '../config/database';

export const getDashboardStats = async (startDate?: string, endDate?: string) => {
  const dateFilter = startDate && endDate ? {
    invoiceDate: {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    },
  } : {};

  // Get machine costs from invoices (sold machines) using raw query
  let machineCosts = 0;
  try {
    const machineCostsQuery = await sequelize.query(
      `
      SELECT COALESCE(SUM(ii.quantity * m.purchase_price), 0) as total_machine_cost
      FROM invoice_items ii
      INNER JOIN invoices i ON ii.invoice_id = i.id
      INNER JOIN machines m ON ii.reference_id = m.id
      WHERE ii.item_type = 'machine'
        AND i.payment_status IN ('paid', 'partial')
        ${startDate && endDate ? `AND i.invoice_date BETWEEN '${startDate}' AND '${endDate}'` : ''}
      `,
      { type: QueryTypes.SELECT }
    );
    machineCosts = Number((machineCostsQuery[0] as any)?.['total_machine_cost'] || 0);
  } catch (error) {
    console.error('Error calculating machine costs:', error);
    machineCosts = 0;
  }

  // Get inventory breakdown
  const [availableMachines, soldMachines, totalInventoryValue] = await Promise.all([
    Machine.count({ where: { status: 'available' } }),
    Machine.count({ where: { status: 'sold' } }),
    Machine.sum('purchasePrice', { where: { status: 'available' } }),
  ]);

  const [
    totalCustomers,
    activeServices,
    totalRevenueResult,
    totalPaidAmount,
    serviceCosts,
    monthlyRevenue,
    totalMachines,
  ] = await Promise.all([
    // Total customers
    Customer.count(),

    // Active services (pending + in_progress)
    Service.count({
      where: {
        status: {
          [Op.in]: ['pending', 'in_progress'],
        },
      },
    }),

    // Total revenue (sum of paid + partial invoices total amount)
    Invoice.sum('totalAmount', {
      where: {
        paymentStatus: {
          [Op.in]: ['paid', 'partial'],
        },
        ...dateFilter,
      },
    }),

    // Total actually collected (sum of paidAmount)
    Invoice.sum('paidAmount', {
      where: {
        paymentStatus: {
          [Op.in]: ['paid', 'partial'],
        },
        ...dateFilter,
      },
    }),

    // Service costs only
    Service.sum('cost', {
      where: dateFilter.invoiceDate ? {
        serviceDate: dateFilter.invoiceDate,
      } : {},
    }),

    // Monthly revenue
    getMonthlyRevenue(startDate, endDate),

    // Total machines
    Machine.count(),
  ]);

  const revenue = totalPaidAmount || 0;
  const totalServiceCosts = serviceCosts || 0;
  const totalCosts = totalServiceCosts + machineCosts;
  const profit = revenue - totalCosts;

  return {
    totalCustomers,
    activeServices,
    totalMachines,
    totalRevenue: revenue,
    totalCosts,
    serviceCosts: totalServiceCosts,
    machineCosts,
    profit,
    monthlyRevenue,
    inventoryBreakdown: {
      available: availableMachines,
      sold: soldMachines,
      totalValue: totalInventoryValue || 0,
    },
  };
};

const getMonthlyRevenue = async (startDate?: string, endDate?: string) => {
  let dateCondition: any = {};
  
  if (startDate && endDate) {
    dateCondition = {
      invoiceDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };
  } else {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);
    dateCondition = {
      invoiceDate: {
        [Op.gte]: twelveMonthsAgo,
      },
    };
  }

  const invoices = await Invoice.findAll({
    where: {
      paymentStatus: {
        [Op.in]: ['paid', 'partial'],
      },
      ...dateCondition,
    },
    attributes: ['totalAmount', 'paidAmount', 'invoiceDate'],
  });

  const services = await Service.findAll({
    where: startDate && endDate ? {
      serviceDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    } : {
      serviceDate: dateCondition.invoiceDate,
    },
    attributes: ['cost', 'serviceDate'],
  });

  // Group by month
  const monthlyData: { [key: string]: { revenue: number; costs: number; profit: number } } = {};

  invoices.forEach((invoice) => {
    const month = invoice.invoiceDate.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, costs: 0, profit: 0 };
    }
    monthlyData[month].revenue += Number(invoice.paidAmount || 0);
  });

  services.forEach((service) => {
    const month = service.serviceDate.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, costs: 0, profit: 0 };
    }
    monthlyData[month].costs += Number(service.cost || 0);
  });

  // Get machine costs per month from invoice items using raw query
  try {
    let machineMonthlyQuery = `
      SELECT 
        TO_CHAR(i.invoice_date, 'YYYY-MM') as month,
        SUM(ii.quantity * m.purchase_price) as machine_cost
      FROM invoice_items ii
      INNER JOIN invoices i ON ii.invoice_id = i.id
      INNER JOIN machines m ON ii.reference_id = m.id
      WHERE ii.item_type = 'machine'
        AND i.payment_status IN ('paid', 'partial')
    `;

    if (startDate && endDate) {
      machineMonthlyQuery += ` AND i.invoice_date BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      machineMonthlyQuery += ` AND i.invoice_date >= '${twelveMonthsAgo.toISOString().split('T')[0]}'`;
    }

    machineMonthlyQuery += ' GROUP BY month';

    const machineMonthlyCosts = await sequelize.query(machineMonthlyQuery, {
      type: QueryTypes.SELECT
    }) as any[];

    machineMonthlyCosts.forEach((item) => {
      const month = item.month;
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, costs: 0, profit: 0 };
      }
      monthlyData[month].costs += Number(item.machine_cost || 0);
    });
  } catch (error) {
    console.error('Error calculating monthly machine costs:', error);
  }

  // Calculate profit
  Object.keys(monthlyData).forEach((month) => {
    monthlyData[month].profit = monthlyData[month].revenue - monthlyData[month].costs;
  });

  // Convert to array format
  const monthlyRevenue = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: Number(data.revenue),
      costs: Number(data.costs),
      profit: Number(data.profit),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyRevenue;
};

export const getRevenueData = async (startDate?: string, endDate?: string) => {
  return getMonthlyRevenue(startDate, endDate);
};
