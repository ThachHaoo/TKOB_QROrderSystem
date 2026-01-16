import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { PublicSubscriptionController } from './controllers/public-subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPaymentService } from './subscription-payment.service';
import { SubscriptionLimitsGuard } from './guards/subscription-limits.guard';
import { FeatureGuard } from './guards/feature.guard';
import { PaymentModule } from '../payment/payment.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    RedisModule,
  ],
  controllers: [SubscriptionController, PublicSubscriptionController],
  providers: [
    SubscriptionService, 
    SubscriptionPaymentService,
    SubscriptionLimitsGuard, 
    FeatureGuard,
  ],
  exports: [SubscriptionService, SubscriptionPaymentService, SubscriptionLimitsGuard, FeatureGuard],
})
export class SubscriptionModule {}
