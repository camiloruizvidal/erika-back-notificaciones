import { Module } from '@nestjs/common';
import { MailerSendEmailProvider } from './mailersend-email-provider.service';
import { EMAIL_PROVIDER_TOKEN } from './email-provider.interface';

@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER_TOKEN,
      useClass: MailerSendEmailProvider,
    },
    MailerSendEmailProvider,
  ],
  exports: [EMAIL_PROVIDER_TOKEN],
})
export class EmailModule {}

