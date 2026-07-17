import { ApiProperty } from '@nestjs/swagger';

export class TenantContextResponseDto {
  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  activeClinicId!: string | null;

  @ApiProperty({
    type: String,
    enum: ['OWNER', 'ADMIN', 'DENTIST', 'RECEPTIONIST', 'FINANCE'],
    nullable: true,
  })
  roleCode!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  authorizationVersion!: number | null;

  @ApiProperty({ type: [String] })
  permissions!: string[];
}
