import nodemailer from 'nodemailer';
import { generateInvoicePDF } from './pdfService';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email configuration from environment variables
const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };
};

export const sendInvoiceEmail = async (
  invoiceId: string,
  customerEmail: string,
  customerName: string,
  invoiceNumber: string
): Promise<void> => {
  try {
    const config = getEmailConfig();

    // Check if email is configured
    if (!config.auth.user || !config.auth.pass) {
      throw new Error('Email configuration is missing. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    // Create transporter
    const transporter = nodemailer.createTransport(config);

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceId);

    // Send email
    const info = await transporter.sendMail({
      from: `"K² Enterprise" <${config.auth.user}>`,
      to: customerEmail,
      subject: `Invoice ${invoiceNumber} - K² Enterprise`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Invoice from K² Enterprise</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your business. Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>
          <strong>K² Enterprise</strong><br>
          Biomedical Equipment Services</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendPaymentReminderEmail = async (
  customerEmail: string,
  customerName: string,
  invoiceNumber: string,
  dueDate: Date,
  amountDue: number
): Promise<void> => {
  try {
    const config = getEmailConfig();

    if (!config.auth.user || !config.auth.pass) {
      throw new Error('Email configuration is missing.');
    }

    const transporter = nodemailer.createTransport(config);

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amountDue);

    const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await transporter.sendMail({
      from: `"K² Enterprise" <${config.auth.user}>`,
      to: customerEmail,
      subject: `Payment Reminder - Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Payment Reminder</h2>
          <p>Dear ${customerName},</p>
          <p>This is a friendly reminder that payment for invoice <strong>${invoiceNumber}</strong> is due.</p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${formattedAmount}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formattedDate}</p>
          </div>
          <p>Please arrange payment at your earliest convenience. If you have already made this payment, please disregard this reminder.</p>
          <br>
          <p>Best regards,<br>
          <strong>K² Enterprise</strong><br>
          Biomedical Equipment Services</p>
        </div>
      `,
    });

    console.log('Payment reminder sent successfully');
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    throw error;
  }
};

export const sendServiceReminderEmail = async (
  customerEmail: string,
  customerName: string,
  machineName: string,
  serviceDate: Date
): Promise<void> => {
  try {
    const config = getEmailConfig();

    if (!config.auth.user || !config.auth.pass) {
      throw new Error('Email configuration is missing.');
    }

    const transporter = nodemailer.createTransport(config);

    const formattedDate = new Date(serviceDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await transporter.sendMail({
      from: `"K² Enterprise" <${config.auth.user}>`,
      to: customerEmail,
      subject: `Service Reminder - ${machineName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Service Reminder</h2>
          <p>Dear ${customerName},</p>
          <p>This is a reminder that your equipment <strong>${machineName}</strong> is scheduled for service.</p>
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Equipment:</strong> ${machineName}</p>
            <p style="margin: 5px 0;"><strong>Service Date:</strong> ${formattedDate}</p>
          </div>
          <p>Please ensure the equipment is accessible on the scheduled date. If you need to reschedule, please contact us as soon as possible.</p>
          <br>
          <p>Best regards,<br>
          <strong>K² Enterprise</strong><br>
          Biomedical Equipment Services</p>
        </div>
      `,
    });

    console.log('Service reminder sent successfully');
  } catch (error) {
    console.error('Error sending service reminder:', error);
    throw error;
  }
};

export const sendAMCRenewalReminderEmail = async (
  customerEmail: string,
  customerName: string,
  contractNumber: string,
  endDate: Date,
  contractValue: number,
  machineName: string
): Promise<void> => {
  try {
    const config = getEmailConfig();

    if (!config.auth.user || !config.auth.pass) {
      throw new Error('Email configuration is missing.');
    }

    const transporter = nodemailer.createTransport(config);

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(contractValue);

    const formattedDate = new Date(endDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const daysUntilExpiry = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    await transporter.sendMail({
      from: `"K² Enterprise" <${config.auth.user}>`,
      to: customerEmail,
      subject: `AMC Renewal Reminder - Contract ${contractNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">AMC Renewal Reminder</h2>
          <p>Dear ${customerName},</p>
          <p>This is a reminder that your Annual Maintenance Contract (AMC) is expiring soon.</p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Contract Number:</strong> ${contractNumber}</p>
            <p style="margin: 5px 0;"><strong>Equipment:</strong> ${machineName}</p>
            <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Days Remaining:</strong> ${daysUntilExpiry} days</p>
            <p style="margin: 5px 0;"><strong>Contract Value:</strong> ${formattedAmount}</p>
          </div>
          <p>To ensure uninterrupted service coverage, please contact us to renew your AMC contract before the expiry date.</p>
          <p>We look forward to continuing our partnership with you.</p>
          <br>
          <p>Best regards,<br>
          <strong>K² Enterprise</strong><br>
          Biomedical Equipment Services</p>
        </div>
      `,
    });

    console.log('AMC renewal reminder sent successfully');
  } catch (error) {
    console.error('Error sending AMC renewal reminder:', error);
    throw error;
  }
};

