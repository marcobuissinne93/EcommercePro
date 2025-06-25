import type { OrderItem } from "@shared/schema";

// Email service for sending insurance payment links
export class EmailService {
  private generatePaymentLink(deviceName: string, insuranceType: string, monthlyAmount: number): string {
    // Generate a mock payment link (in production, this would integrate with a payment gateway)
    const encodedDeviceName = encodeURIComponent(deviceName);
    const encodedInsuranceType = encodeURIComponent(insuranceType);
    
    return `https://payments.techstore.co.za/debit-order?device=${encodedDeviceName}&insurance=${encodedInsuranceType}&amount=${monthlyAmount}&reference=${Date.now()}`;
  }

  private createEmailContent(customerName: string, orderItems: OrderItem[]): { subject: string; html: string; text: string } {
    const insuranceItems = orderItems.filter(item => item.insurance);
    
    if (insuranceItems.length === 0) {
      return { subject: '', html: '', text: '' };
    }

    const subject = `TechStore SA - Complete Your Device Insurance Setup`;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; }
            .device-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .payment-button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { background: #64748b; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .price { font-size: 18px; font-weight: bold; color: #16a34a; }
            .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ Device Insurance Setup</h1>
                <p>TechStore SA - Powered by Root Insurance</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName}! 👋</h2>
                <p>Thank you for your purchase! To complete your device insurance setup, please click the payment links below to authorize your monthly debit orders.</p>
                
    `;

    insuranceItems.forEach((item) => {
      const { insurance } = item;
      if (insurance) {
        const paymentLink = this.generatePaymentLink(item.name, insurance.type, insurance.price);
        html += `
                <div class="device-item">
                    <h3>📱 ${item.name}</h3>
                    <p><strong>Coverage:</strong> ${insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)} Insurance</p>
                    <p class="price">R${(insurance.price / 100).toFixed(2)}/month</p>
                    <a href="${paymentLink}" class="payment-button">Setup Payment Authorization</a>
                </div>
        `;
      }
    });

    html += `
                <div class="important">
                    <h3>📋 Important Information:</h3>
                    <ul>
                        <li>Your device warranty is already active</li>
                        <li>Insurance becomes active once debit order is authorized</li>
                        <li>You can cancel anytime by contacting our support team</li>
                        <li>Keep this email for your records</li>
                    </ul>
                </div>
                
                <p>Need assistance? Contact us at <a href="mailto:support@techstore.co.za">support@techstore.co.za</a></p>
            </div>
            
            <div class="footer">
                <p><strong>TechStore SA</strong><br>
                Powered by Root Insurance 🌱<br>
                This is an automated message - please do not reply to this email</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Plain text version
    let text = `TechStore SA - Device Insurance Setup\n\n`;
    text += `Hi ${customerName}!\n\n`;
    text += `Thank you for your purchase! To complete your device insurance setup, please use the payment links below to authorize your monthly debit orders:\n\n`;

    insuranceItems.forEach((item) => {
      const { insurance } = item;
      if (insurance) {
        const paymentLink = this.generatePaymentLink(item.name, insurance.type, insurance.price);
        text += `Device: ${item.name}\n`;
        text += `Coverage: ${insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)} Insurance\n`;
        text += `Monthly Cost: R${(insurance.price / 100).toFixed(2)}\n`;
        text += `Setup Payment: ${paymentLink}\n\n`;
      }
    });

    text += `Important Information:\n`;
    text += `• Your device warranty is already active\n`;
    text += `• Insurance becomes active once debit order is authorized\n`;
    text += `• You can cancel anytime by contacting support\n`;
    text += `• Keep this email for your records\n\n`;
    text += `Need help? Contact us at support@techstore.co.za\n\n`;
    text += `TechStore SA - Powered by Root Insurance`;

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

      // In production, this would integrate with SendGrid or similar email service
      // For demo purposes, we'll simulate the email sending
      console.log(`\n📧 ===== INSURANCE PAYMENT EMAIL SENT =====`);
      console.log(`📮 To: ${customerEmail}`);
      console.log(`👤 Customer: ${customerName}`);
      console.log(`📱 Insurance Items: ${orderItems.filter(item => item.insurance).length}`);
      console.log(`📝 Subject: ${emailContent.subject}`);
      console.log(`\n✉️ Email Content (HTML):`);
      console.log(emailContent.html);
      console.log(`\n📄 Email Content (Text):`);
      console.log(emailContent.text);
      console.log(`\n✅ Demo: In production, this would be sent via SendGrid API`);
      console.log(`==============================================\n`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        message: `Insurance payment links sent to ${customerEmail} via email`
      };
    } catch (error) {
      console.error("Email sending failed:", error);
      return {
        success: false,
        message: "Failed to send email"
      };
    }
  }
}

export const emailService = new EmailService();