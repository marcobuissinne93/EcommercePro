import nodemailer from 'nodemailer';
import type { OrderItem } from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST) {
      throw new Error("Missing SMTP configuration in .env");
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'false', // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private generatePaymentLink(deviceName: string, insuranceType: string, monthlyAmount: number): string {
    const encodedDeviceName = encodeURIComponent(deviceName);
    const encodedInsuranceType = encodeURIComponent(insuranceType);

    return `https://payments.techstore.co.za/debit-order?device=${encodedDeviceName}&insurance=${encodedInsuranceType}&amount=${monthlyAmount}&reference=${Date.now()}`;
  }

  private createEmailContent(customerName: string, orderItems: OrderItem[]) {
    const insuranceItems = orderItems.filter(item => item.insurance);

    if (insuranceItems.length === 0) {
      return { subject: '', html: '', text: '' };
    }

    const subject = `Guardrisk Tech - Complete Your Device Insurance Setup`;

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>/*...styles unchanged...*/</style></head><body><div class="container"><div class="header"><h1>🛡️ Device Insurance Setup</h1><p>Guardrisk Tech</p></div><div class="content"><h2>Hi ${customerName}! 👋</h2><p>Thank you for your purchase! To complete your device insurance setup, please click the payment links below to authorize your monthly debit orders.</p>`;
    
    let hasSelectedWarranty: boolean = false;

    insuranceItems.forEach(item => {
      hasSelectedWarranty = (item.warranty?.type === '10-year' || item.warranty?.type === '5-year');
      console.log(JSON.stringify(item.warranty));

      const paymentLink = this.generatePaymentLink(item.name, item.insurance!.type, item.insurance!.price);
      html += `<div class="device-item"><h3>📱 ${item.name}</h3><p><strong>Coverage:</strong> ${item.insurance!.type}</p><p class="price">R${(item.insurance!.price / 100).toFixed(2)}/month</p><a href="${paymentLink}" class="payment-button">Setup Payment Authorization</a></div>`;
    });

    html += `<div class="important"><h3>📋 Important Information:</h3><ul><li>Your device warranty is already active</li><li>Insurance becomes active once debit order is authorized</li><li>You can cancel anytime by contacting our support team</li><li>Keep this email for your records</li></ul></div><p>Need assistance? Contact us at <a href="mailto:support@grtech.co.za">support@grtech.co.za</a></p></div><div class="footer"><p><strong>Guardrisk Tech</strong><br>Powered by Root Insurance 🌱<br>This is an automated message - please do not reply to this email</p></div></div></body></html>`;

    let text = `Guardrisk Tech - Device Insurance Setup\n\nHi ${customerName}!\n\nThank you for your purchase! To complete your device insurance setup, use the payment links below:\n\n`;

    insuranceItems.forEach(item => {
      const paymentLink = this.generatePaymentLink(item.name, item.insurance!.type, item.insurance!.price);
      text += `Device: ${item.name}\nCoverage: ${item.insurance!.type}\nMonthly Cost: R${(item.insurance!.price / 100).toFixed(2)}\nSetup Payment: ${paymentLink}\n\n`;
    });

    text += `Important:\n• ${hasSelectedWarranty ? 'Your device warranty is already active' : ''}\n• Insurance becomes active once debit order is authorized\n• Cancel anytime by contacting support\n• Keep this email for your records\n\nNeed help? support@grtech.co.za\n`;

    return { subject, html, text };
  }

  async sendInsurancePaymentLinks(
    customerName: string,
    customerEmail: string,
    orderItems: OrderItem[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const emailContent = this.createEmailContent(customerName, orderItems);

      if (!emailContent.subject) {
        return { success: true, message: "No insurance items to process" };
      }

      const info = await this.transporter.sendMail({
        from: `"Guardrisk Tech" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`📧 Email sent to ${customerEmail}: ${info.messageId}`);
      return { success: true, message: info.messageId };
    } catch (error: any) {
      console.error("Email sending failed:", error);
      return { success: false, message: error.message || "Unknown error" };
    }
  }
}

export const emailService = new EmailService();


// import type { OrderItem } from "@shared/schema";
// import sgMail from '@sendgrid/mail';

// // Email service for sending insurance payment links
// export class EmailService {
//   constructor() {
//     if (process.env.SENDGRID_API_KEY) {
//       sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     }
//   }
//   private generatePaymentLink(deviceName: string, insuranceType: string, monthlyAmount: number): string {
//     // Generate a mock payment link (in production, this would integrate with a payment gateway)
//     const encodedDeviceName = encodeURIComponent(deviceName);
//     const encodedInsuranceType = encodeURIComponent(insuranceType);
    
//     return `https://payments.techstore.co.za/debit-order?device=${encodedDeviceName}&insurance=${encodedInsuranceType}&amount=${monthlyAmount}&reference=${Date.now()}`;
//   }

//   private createEmailContent(customerName: string, orderItems: OrderItem[]): { subject: string; html: string; text: string } {
//     const insuranceItems = orderItems.filter(item => item.insurance);
    
//     if (insuranceItems.length === 0) {
//       return { subject: '', html: '', text: '' };
//     }

//     const subject = `TechStore SA - Complete Your Device Insurance Setup`;

//     let html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <style>
//             body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//             .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//             .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
//             .content { background: #f8fafc; padding: 30px; }
//             .device-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0; }
//             .payment-button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
//             .footer { background: #64748b; color: white; padding: 20px; text-align: center; font-size: 14px; }
//             .price { font-size: 18px; font-weight: bold; color: #16a34a; }
//             .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="header">
//                 <h1>🛡️ Device Insurance Setup</h1>
//                 <p>TechStore SA - Powered by Root Insurance</p>
//             </div>
            
//             <div class="content">
//                 <h2>Hi ${customerName}! 👋</h2>
//                 <p>Thank you for your purchase! To complete your device insurance setup, please click the payment links below to authorize your monthly debit orders.</p>
                
//     `;

//     insuranceItems.forEach((item) => {
//       const { insurance } = item;
//       if (insurance) {
//         const paymentLink = this.generatePaymentLink(item.name, insurance.type, insurance.price);
//         html += `
//                 <div class="device-item">
//                     <h3>📱 ${item.name}</h3>
//                     <p><strong>Coverage:</strong> ${insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)} Insurance</p>
//                     <p class="price">R${(insurance.price / 100).toFixed(2)}/month</p>
//                     <a href="${paymentLink}" class="payment-button">Setup Payment Authorization</a>
//                 </div>
//         `;
//       }
//     });

//     html += `
//                 <div class="important">
//                     <h3>📋 Important Information:</h3>
//                     <ul>
//                         <li>Your device warranty is already active</li>
//                         <li>Insurance becomes active once debit order is authorized</li>
//                         <li>You can cancel anytime by contacting our support team</li>
//                         <li>Keep this email for your records</li>
//                     </ul>
//                 </div>
                
//                 <p>Need assistance? Contact us at <a href="mailto:support@techstore.co.za">support@techstore.co.za</a></p>
//             </div>
            
//             <div class="footer">
//                 <p><strong>TechStore SA</strong><br>
//                 Powered by Root Insurance 🌱<br>
//                 This is an automated message - please do not reply to this email</p>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;

//     // Plain text version
//     let text = `TechStore SA - Device Insurance Setup\n\n`;
//     text += `Hi ${customerName}!\n\n`;
//     text += `Thank you for your purchase! To complete your device insurance setup, please use the payment links below to authorize your monthly debit orders:\n\n`;

//     insuranceItems.forEach((item) => {
//       const { insurance } = item;
//       if (insurance) {
//         const paymentLink = this.generatePaymentLink(item.name, insurance.type, insurance.price);
//         text += `Device: ${item.name}\n`;
//         text += `Coverage: ${insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)} Insurance\n`;
//         text += `Monthly Cost: R${(insurance.price / 100).toFixed(2)}\n`;
//         text += `Setup Payment: ${paymentLink}\n\n`;
//       }
//     });

//     text += `Important Information:\n`;
//     text += `• Your device warranty is already active\n`;
//     text += `• Insurance becomes active once debit order is authorized\n`;
//     text += `• You can cancel anytime by contacting support\n`;
//     text += `• Keep this email for your records\n\n`;
//     text += `Need help? Contact us at support@techstore.co.za\n\n`;
//     text += `TechStore SA - Powered by Root Insurance`;

//     return { subject, html, text };
//   }

//   async sendInsurancePaymentLinks(
//     customerName: string,
//     customerEmail: string,
//     orderItems: OrderItem[]
//   ): Promise<{ success: boolean; message: string }> {
//     try {
//       const emailContent = this.createEmailContent(customerName, orderItems);

//       if (!emailContent.subject) {
//         return { success: true, message: "No insurance items to process" };
//       }

//       if (process.env.SENDGRID_API_KEY) {
//         // Send real email via SendGrid
//         const msg = {
//           to: customerEmail,
//           from: 'noreply@techstore.co.za', // Use your verified sender
//           subject: emailContent.subject,
//           text: emailContent.text,
//           html: emailContent.html,
//         };

//         try {
//           await sgMail.send(msg);
//           console.log(`📧 Insurance email sent successfully to ${customerEmail}`);
//         } catch (error) {
//           console.error('SendGrid email sending failed:', error);
//           throw new Error('Failed to send email via SendGrid');
//         }
//       } else {
//         // Demo mode - log email content to console
//         console.log(`\n📧 ===== INSURANCE PAYMENT EMAIL (DEMO MODE) =====`);
//         console.log(`📮 To: ${customerEmail}`);
//         console.log(`👤 Customer: ${customerName}`);
//         console.log(`📱 Insurance Items: ${orderItems.filter(item => item.insurance).length}`);
//         console.log(`📝 Subject: ${emailContent.subject}`);
//         console.log(`\n✉️ Email Content (HTML):`);
//         console.log(emailContent.html);
//         console.log(`\n📄 Email Content (Text):`);
//         console.log(emailContent.text);
//         console.log(`\n⚠️ No SENDGRID_API_KEY found - running in demo mode`);
//         console.log(`================================================\n`);
//       }

//       const mode = process.env.SENDGRID_API_KEY ? "sent" : "logged (demo mode)";
//       return {
//         success: true,
//         message: `Insurance payment links ${mode} to ${customerEmail} via email`
//       };
//     } catch (error) {
//       console.error("Email sending failed:", error);
//       return {
//         success: false,
//         message: "Failed to send email"
//       };
//     }
//   }
// }

// export const emailService = new EmailService();