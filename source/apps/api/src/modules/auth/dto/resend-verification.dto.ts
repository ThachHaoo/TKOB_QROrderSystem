import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to resend verification link',
  })
  @IsEmail()
  email: string;
}

export class ResendVerificationResponseDto {
  @ApiProperty({ example: 'Verification email sent successfully' })
  message: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;
}
