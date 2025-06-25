import type { OrderItem } from "@shared/schema";

// WhatsApp message service for sending insurance payment links
export class WhatsAppService {
  private formatPhoneNumber(phone: string): string {
    // Remove + and any non-digit characters, but expect +27 format
    let cleanPhone = phone.replace(/^\+/, '').replace(/\D/g, '');
    
    // Ensure it starts with 27 (South African code)
    if (!cleanPhone.startsWith('27')) {
      throw new Error('Phone number must start with +27 for South African numbers');
    }
    
    return cleanPhone;
  }

  private generatePaymentLink(deviceName: string, insuranceType: string, monthlyAmount: number): string {
    // Generate a mock payment link (in production, this would integrate with a payment gateway)
    const encodedDeviceName = encodeURIComponent(deviceName);
    const encodedInsuranceType = encodeURIComponent(insuranceType);
    
    return `https://payments.techstore.co.za/debit-order?device=${encodedDeviceName}&insurance=${encodedInsuranceType}&amount=${monthlyAmount}&reference=${Date.now()}`;
  }

  private createWhatsAppMessage(customerName: string, orderItems: OrderItem[]): string {
    const insuranceItems = orderItems.filter(item => item.insurance);
    
    if (insuranceItems.length === 0) {
      return '';
    }

    let message = `🛡️ *TechStore SA - Device Insurance Setup*\n\n`;
    message += `Hi ${customerName}! 👋\n\n`;
    message += `Thank you for your purchase! To complete your device insurance setup, please click the payment links below to authorize your monthly debit orders:\n\n`;

    insuranceItems.forEach((item, index) => {
      const { insurance } = item;
      if (insurance) {
        const paymentLink = this.generatePaymentLink(item.name, insurance.type, insurance.price);
        message += `📱 *${item.name}*\n`;
        message += `🔒 ${insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1)} Coverage\n`;
        message += `💰 R${(insurance.price / 100).toFixed(2)}/month\n`;
        message += `🔗 Setup Payment: ${paymentLink}\n\n`;
      }
    });

    message += `ℹ️ *Important Notes:*\n`;
    message += `• Your device warranty is already active\n`;
    message += `• Insurance becomes active once debit order is authorized\n`;
    message += `• You can cancel anytime by contacting support\n`;
    message += `• Keep this message for your records\n\n`;
    message += `Need help? Contact us at support@techstore.co.za\n\n`;
    message += `*TechStore SA* - Powered by Root Insurance 🌱`;

    return message;
  }

  async sendInsurancePaymentLinks(
    customerName: string,
    phoneNumber: string,
    orderItems: OrderItem[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const whatsappMessage = this.createWhatsAppMessage(customerName, orderItems);

      if (!whatsappMessage) {
        return { success: true, message: "No insurance items to process" };
      }

      // In production, this would integrate with WhatsApp Business API
      // For demo purposes, we'll simulate the message sending
      console.log(`📱 WhatsApp Message to +${formattedPhone}:`);
      console.log(whatsappMessage);
      console.log(`🔗 WhatsApp Web URL: https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: `Insurance payment links sent to +${formattedPhone} via WhatsApp`,
        whatsappUrl: whatsappWebUrl
      };
    } catch (error) {
      console.error("WhatsApp message sending failed:", error);
      return {
        success: false,
        message: "Failed to send WhatsApp message"
      };
    }
  }

  // Generate WhatsApp Web URL for testing
  getWhatsAppWebUrl(phoneNumber: string, orderItems: OrderItem[], customerName: string): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const message = this.createWhatsAppMessage(customerName, orderItems);
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }
}

export const whatsappService = new WhatsAppService();