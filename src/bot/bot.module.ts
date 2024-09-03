import { Module } from '@nestjs/common';
import { TelegramService } from './bot.service';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [UserModule],
  providers: [TelegramService],
})
export class TelegramModule {}
