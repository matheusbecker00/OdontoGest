import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsCpf } from '../../../common/validation/cpf.validator';

export enum PatientRegistrationStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

const PHONE_PATTERN = /^\+?[0-9 ()-]{10,20}$/;

export class CreatePatientDto {
  @ApiProperty({ example: 'Ana Paula Martins', maxLength: 180 })
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  fullName!: string;

  @ApiProperty({ example: '529.982.247-25' })
  @IsCpf()
  cpf!: string;

  @ApiPropertyOptional({ example: '1990-05-20' })
  @IsOptional()
  @IsDateString({ strict: true })
  birthDate?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @Matches(PHONE_PATTERN)
  phone?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @Matches(PHONE_PATTERN)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'ana@example.test' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  addressLine?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  administrativeNotes?: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

export class ListPatientsQueryDto {
  @ApiPropertyOptional({ type: Number, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ type: Number, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: PatientRegistrationStatusDto })
  @IsOptional()
  @IsEnum(PatientRegistrationStatusDto)
  status?: PatientRegistrationStatusDto;
}
