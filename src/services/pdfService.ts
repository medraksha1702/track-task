import PDFDocument from 'pdfkit';
import { Invoice, Customer, InvoiceItem, Service, Machine } from '../models';

export const generateInvoicePDF = async (invoiceId: string): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch invoice with all related data
      const invoice = await Invoice.findByPk(invoiceId, {
        include: [
          { model: Customer, as: 'customer' },
          { 
            model: InvoiceItem, 
            as: 'items',
            separate: true,
          },
        ],
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const customer = (invoice as any).customer;
      const items = (invoice as any).items as InvoiceItem[];

      // Fetch item details (services/machines)
      const itemDetails = await Promise.all(
        items.map(async (item) => {
          if (item.itemType === 'service') {
            const service = await Service.findByPk(item.referenceId);
            return {
              ...item.toJSON(),
              name: service?.serviceType || 'Service',
              description: service?.description || '',
            };
          } else {
            const machine = await Machine.findByPk(item.referenceId);
            return {
              ...item.toJSON(),
              name: machine?.name || 'Machine',
              description: `${machine?.model || ''} - ${machine?.serialNumber || ''}`,
            };
          }
        })
      );

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with logo
      doc.fontSize(28).font('Helvetica-Bold').text('K² Enterprise', 50, 50);
      doc.fontSize(10).font('Helvetica').text('Biomedical Equipment Services', 50, 85);
      
      // Invoice title
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50);
      doc.fontSize(10).font('Helvetica').text(`#${invoice.invoiceNumber}`, 400, 75);

      // Line separator
      doc.moveTo(50, 110).lineTo(550, 110).stroke();

      // Customer details
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 130);
      doc.fontSize(10).font('Helvetica').text(customer.name, 50, 150);
      if (customer.email) doc.text(customer.email, 50, 165);
      if (customer.phone) doc.text(customer.phone, 50, 180);
      if (customer.address) doc.text(customer.address, 50, 195, { width: 250 });

      // Invoice details
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Date:', 350, 130);
      doc.font('Helvetica').text(new Date(invoice.invoiceDate).toLocaleDateString('en-IN'), 450, 130);
      
      if (invoice.dueDate) {
        doc.font('Helvetica-Bold').text('Due Date:', 350, 145);
        doc.font('Helvetica').text(new Date(invoice.dueDate).toLocaleDateString('en-IN'), 450, 145);
      }

      doc.font('Helvetica-Bold').text('Payment Status:', 350, 160);
      const statusColor = invoice.paymentStatus === 'paid' ? '#22c55e' : 
                          invoice.paymentStatus === 'partial' ? '#f97316' : '#ef4444';
      doc.fillColor(statusColor).font('Helvetica-Bold')
         .text(invoice.paymentStatus.toUpperCase(), 450, 160);
      doc.fillColor('#000000');

      // Items table
      const tableTop = 240;
      doc.fontSize(10).font('Helvetica-Bold');
      
      // Table headers
      doc.text('Item', 50, tableTop);
      doc.text('Description', 180, tableTop);
      doc.text('Qty', 380, tableTop);
      doc.text('Price', 430, tableTop);
      doc.text('Amount', 500, tableTop);

      // Table line
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table rows
      let yPosition = tableTop + 25;
      doc.font('Helvetica');

      itemDetails.forEach((item, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(item.name, 50, yPosition, { width: 120 });
        doc.text(item.description || '-', 180, yPosition, { width: 190 });
        doc.text(item.quantity.toString(), 380, yPosition);
        doc.text(formatCurrency(Number(item.price)), 430, yPosition);
        doc.text(formatCurrency(Number(item.price) * item.quantity), 500, yPosition);

        yPosition += 30;
      });

      // Totals section
      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 20;

      const totalsX = 400;
      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', totalsX, yPosition);
      doc.font('Helvetica').text(formatCurrency(Number(invoice.totalAmount)), 500, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold').text('Total:', totalsX, yPosition);
      doc.fontSize(14).text(formatCurrency(Number(invoice.totalAmount)), 500, yPosition);

      yPosition += 30;
      doc.fontSize(10).font('Helvetica-Bold').text('Paid Amount:', totalsX, yPosition);
      doc.fillColor('#22c55e').text(formatCurrency(Number(invoice.paidAmount)), 500, yPosition);

      yPosition += 20;
      doc.fillColor('#000000').font('Helvetica-Bold').text('Outstanding:', totalsX, yPosition);
      const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);
      doc.fillColor(outstanding > 0 ? '#ef4444' : '#22c55e')
         .text(formatCurrency(outstanding), 500, yPosition);

      // Footer
      doc.fillColor('#000000').fontSize(8).font('Helvetica')
         .text('Thank you for your business!', 50, 750, { align: 'center', width: 500 });
      doc.text('K² Enterprise - Biomedical Equipment Services', 50, 765, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

