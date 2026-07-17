import type { RequestMetadata } from '../../common/http/request-metadata';
import type {
  CreatePatientDto,
  ListPatientsQueryDto,
  UpdatePatientDto,
} from './dto/patient.dto';

export interface PatientRecord {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: Date | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  addressLine: string | null;
  administrativeNotes: string | null;
  registrationStatus: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientMutationContext {
  userId: string;
  clinicId: string;
  request: RequestMetadata;
}

export interface PatientsRepository {
  list(
    context: Pick<PatientMutationContext, 'userId' | 'clinicId'>,
    query: ListPatientsQueryDto,
  ): Promise<{ items: PatientRecord[]; total: number }>;
  findById(
    context: Pick<PatientMutationContext, 'userId' | 'clinicId'>,
    id: string,
  ): Promise<PatientRecord | null>;
  create(
    context: PatientMutationContext,
    input: CreatePatientDto,
  ): Promise<PatientRecord>;
  update(
    context: PatientMutationContext,
    id: string,
    input: UpdatePatientDto,
  ): Promise<PatientRecord | null>;
  inactivate(
    context: PatientMutationContext,
    id: string,
  ): Promise<PatientRecord | null>;
}

export const PATIENTS_REPOSITORY = Symbol('PATIENTS_REPOSITORY');
