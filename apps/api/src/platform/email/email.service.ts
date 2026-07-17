export interface FakeEmailMessage {
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  recipient: string;
  link: string;
  createdAt: Date;
}

export abstract class EmailService {
  abstract sendEmailVerification(email: string, token: string): Promise<void>;
  abstract sendPasswordReset(email: string, token: string): Promise<void>;
}
