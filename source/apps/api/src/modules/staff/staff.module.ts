import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { PrismaService } from '../../database/prisma.service';
import { EmailModule } from '../email/email.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [EmailModule, SubscriptionModule],
  controllers: [StaffController],
  providers: [StaffService, PrismaService],
  exports: [StaffService],
})
export class StaffModule {}
