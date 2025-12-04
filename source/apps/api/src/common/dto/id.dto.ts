import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * UUID Parameter DTO
 */
export class UuidParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id: string;
}
