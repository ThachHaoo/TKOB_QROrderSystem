import { ApiProperty } from '@nestjs/swagger';

export class TenantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  onboardingStep: number;

  @ApiProperty({ required: false })
  settings?: any;

  @ApiProperty({ required: false })
  openingHours?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
