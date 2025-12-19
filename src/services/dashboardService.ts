import { Op } from 'sequelize';
import { Customer, Service, Invoice } from '../models';

export const getDashboardStats = async () => {
  const [
    totalCustomers,
    activeServices,
    totalRevenueResult,
    monthlyRevenue,
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

    // Total revenue (sum of paid invoices)
    Invoice.sum('totalAmount', {
      where: {
        paymentStatus: 'paid',
      },
    }),

    // Monthly revenue for last 12 months
    getMonthlyRevenue(),
  ]);

  return {
    totalCustomers,
    activeServices,
    totalRevenue: totalRevenueResult || 0,
    monthlyRevenue,
  };
};

const getMonthlyRevenue = async () => {
  const now = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const invoices = await Invoice.findAll({
    where: {
      paymentStatus: 'paid',
      invoiceDate: {
        [Op.gte]: twelveMonthsAgo,
      },
    },
    attributes: ['totalAmount', 'invoiceDate'],
  });

  // Group by month
  const monthlyData: { [key: string]: number } = {};

  invoices.forEach((invoice) => {
    const month = invoice.invoiceDate.toISOString().substring(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + Number(invoice.totalAmount);
  });

  // Convert to array format
  const monthlyRevenue = Object.entries(monthlyData)
    .map(([month, revenue]) => ({
      month,
      revenue: Number(revenue),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyRevenue;
};

export const getRevenueData = async () => {
  return getMonthlyRevenue();
};

