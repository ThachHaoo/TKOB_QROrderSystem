import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Order ID to create payment for',
    example: 'e8f9a0b1-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Return URL after payment completion',
    example: 'https://app.restaurant.com/order/success',
  })
  @IsUrl()
  returnUrl: string;

  @ApiProperty({
    description: 'Cancel URL if payment is cancelled',
    example: 'https://app.restaurant.com/order/cancel',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  cancelUrl?: string;
}
