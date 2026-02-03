import { PhoneNumber } from '@/objectValues/Phone';

export class SMSService {
  public async send(to: PhoneNumber, message: string): Promise<void> {}
}
