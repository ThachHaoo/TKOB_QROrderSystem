import { IsBoolean, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DaySchedule {
  @ApiProperty({ example: '08:00' })
  @IsString()
  open: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  close: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  closed: boolean;
}

export class UpdateOpeningHoursDto {
  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  monday: DaySchedule;

  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  tuesday: DaySchedule;

  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  wednesday: DaySchedule;

  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  thursday: DaySchedule;

  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  friday: DaySchedule;

  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  saturday: DaySchedule;

  @ApiProperty({ type: DaySchedule })
  @ValidateNested()
  @Type(() => DaySchedule)
  sunday: DaySchedule;
}
