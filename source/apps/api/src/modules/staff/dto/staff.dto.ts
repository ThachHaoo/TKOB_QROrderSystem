import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

// ==================== INVITE ====================

export class InviteStaffDto {
  @ApiProperty({ description: 'Email of the staff member to invite' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: ['STAFF', 'KITCHEN'], description: 'Role to assign' })
  @IsEnum(['STAFF', 'KITCHEN'])
  role: 'STAFF' | 'KITCHEN';
}

export class InviteStaffResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  message: string;
}

// ==================== ACCEPT INVITE ====================

export class AcceptInviteDto {
  @ApiProperty({ description: 'Invitation token from email link' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Full name of the staff member' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Password for the new account' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class AcceptInviteResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  tenantId: string;
}

// ==================== LIST STAFF ====================

export class StaffMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;
}

export class ListStaffResponseDto {
  @ApiProperty({ type: [StaffMemberDto] })
  staff: StaffMemberDto[];

  @ApiProperty()
  total: number;
}

// ==================== PENDING INVITATIONS ====================

export class PendingInvitationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['STAFF', 'KITCHEN'] })
  role: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;
}

export class ListInvitationsResponseDto {
  @ApiProperty({ type: [PendingInvitationDto] })
  invitations: PendingInvitationDto[];

  @ApiProperty()
  total: number;
}

// ==================== UPDATE ROLE ====================

export class UpdateStaffRoleDto {
  @ApiProperty({ enum: ['STAFF', 'KITCHEN'], description: 'New role to assign' })
  @IsEnum(['STAFF', 'KITCHEN'])
  role: 'STAFF' | 'KITCHEN';
}

// ==================== REMOVE STAFF ====================

export class RemoveStaffResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  removedUserId: string;
}

// ==================== RESEND INVITE ====================

export class ResendInviteResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  expiresAt: Date;
}

// ==================== VERIFY TOKEN ====================

export class VerifyInviteTokenDto {
  @ApiProperty({ description: 'Invitation token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class VerifyInviteTokenResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  role?: string;

  @ApiPropertyOptional()
  tenantName?: string;

  @ApiPropertyOptional()
  expiresAt?: Date;
}
