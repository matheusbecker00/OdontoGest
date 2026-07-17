import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { FakeEmailService } from './fake-email.service';

@Global()
@Module({
  providers: [
    FakeEmailService,
    { provide: EmailService, useExisting: FakeEmailService },
  ],
  exports: [EmailService, FakeEmailService],
})
export class EmailModule {}
