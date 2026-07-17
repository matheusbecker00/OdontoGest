import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'Marina Souza' })
  @IsString()
  @Length(2, 160)
  name!: string;

  @ApiProperty({ example: 'marina@exemplo.com.br' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ minLength: 12, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'marina@exemplo.com.br' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ writeOnly: true })
  @IsString()
  @MaxLength(128)
  password!: string;
}

export class FirebaseSessionDto {
  @ApiProperty({ minLength: 100, maxLength: 4096, writeOnly: true })
  @IsString()
  @Length(100, 4096)
  idToken!: string;
}

export class FirebaseOnboardingDto extends FirebaseSessionDto {
  @ApiProperty({ example: 'Marina Souza' })
  @IsString()
  @Length(2, 160)
  responsibleName!: string;

  @ApiProperty({ example: 'Clínica Sorriso' })
  @IsString()
  @Length(2, 180)
  clinicName!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Equals(true)
  acceptTerms!: boolean;
}

export class FirebaseOnboardingResponseDto {
  @ApiProperty({ format: 'uuid' })
  clinicId!: string;

  @ApiProperty()
  created!: boolean;

  @ApiProperty({ enum: [true] })
  verificationRequired!: true;
}

export class TokenDto {
  @ApiProperty({ minLength: 40, maxLength: 128, writeOnly: true })
  @IsString()
  @Length(40, 128)
  token!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'marina@exemplo.com.br' })
  @IsEmail()
  @MaxLength(320)
  email!: string;
}

export class ResetPasswordDto extends TokenDto {
  @ApiProperty({ minLength: 12, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

export class SelectActiveClinicDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  clinicId!: string;
}

export class AuthenticatedUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ format: 'email' })
  email!: string;
}

export class ClinicSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: ['OWNER', 'ADMIN', 'DENTIST', 'RECEPTIONIST', 'FINANCE'],
  })
  role!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthenticatedUserResponseDto })
  user!: AuthenticatedUserResponseDto;

  @ApiProperty({ type: [ClinicSummaryResponseDto] })
  clinics!: ClinicSummaryResponseDto[];

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  activeClinicId!: string | null;
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  activeClinicId!: string | null;
}

export class MessageResponseDto {
  @ApiProperty()
  message!: string;
}

export class ActiveClinicResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ format: 'uuid' })
  activeClinicId!: string;
}

export class SessionResponseDto {
  @ApiProperty({ format: 'uuid' })
  familyId!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  activeClinicId!: string | null;

  @ApiProperty({ format: 'date-time' })
  issuedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastUsedAt!: Date | null;

  @ApiProperty({ format: 'date-time' })
  idleExpiresAt!: Date;

  @ApiProperty({ format: 'date-time' })
  absoluteExpiresAt!: Date;

  @ApiProperty({ type: String, nullable: true })
  ipPrefix!: string | null;

  @ApiProperty({ type: String, nullable: true })
  userAgentSummary!: string | null;

  @ApiProperty()
  current!: boolean;
}

export class SessionsResponseDto {
  @ApiProperty({ type: [SessionResponseDto] })
  items!: SessionResponseDto[];
}
