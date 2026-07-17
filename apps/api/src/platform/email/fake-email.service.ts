import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnvironment } from '../../config/environment';
import { EmailService, type FakeEmailMessage } from './email.service';

@Injectable()
export class FakeEmailService extends EmailService {
  private readonly messages: FakeEmailMessage[] = [];
  private readonly webOrigin: string;

  constructor(config: ConfigService<AppEnvironment, true>) {
    super();
    this.webOrigin = config.get('APP_ORIGINS', { infer: true })[0];
  }

  sendEmailVerification(email: string, token: string): Promise<void> {
    this.messages.push({
      type: 'EMAIL_VERIFICATION',
      recipient: email,
      link: `${this.webOrigin}/verificar-email?token=${encodeURIComponent(token)}`,
      createdAt: new Date(),
    });
    return Promise.resolve();
  }

  sendPasswordReset(email: string, token: string): Promise<void> {
    this.messages.push({
      type: 'PASSWORD_RESET',
      recipient: email,
      link: `${this.webOrigin}/redefinir-senha?token=${encodeURIComponent(token)}`,
      createdAt: new Date(),
    });
    return Promise.resolve();
  }

  getMessagesForTesting(): readonly FakeEmailMessage[] {
    return this.messages;
  }

  clearForTesting(): void {
    this.messages.length = 0;
  }
}
