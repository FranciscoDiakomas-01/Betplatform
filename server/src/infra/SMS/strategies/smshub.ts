import { PhoneNumber } from '@/objectValues/Phone';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { SMSService } from '../sms.service';

export class SmsHub extends SMSService {
  private readonly logger = new Logger(SmsHub.name);
  private readonly auth_id = process.env.SMS_ID ?? '';
  private readonly secret_key = process.env.SMS_KEY ?? '';
  private readonly from = process.env.SMS_FROM ?? '';
  private readonly server = process.env.SMS_URL_API ?? '';
  
  public async send(to: PhoneNumber, message: string): Promise<void> {
    const url = `${this.server}?to=${to.getValue()}&message=${encodeURIComponent(message)}&auth_id=${this.auth_id}&secret_key=${this.secret_key}&from=${this.from}`;
    try {
      const response = await axios.get(url);
      this.logger.log('SMS enviado com sucesso:', response.data);
    } catch (error: any) {
      this.logger.error(
        'Erro ao enviar SMS:',
        error.response?.data || error.message,
      );
    }
  }
}
