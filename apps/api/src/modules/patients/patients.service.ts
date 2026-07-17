import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import type { RequestMetadata } from '../../common/http/request-metadata';
import type {
  CreatePatientDto,
  ListPatientsQueryDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import {
  PATIENTS_REPOSITORY,
  type PatientRecord,
  type PatientsRepository,
} from './patient.models';

function hasDatabaseCode(error: unknown, expected: string, depth = 0): boolean {
  if (typeof error !== 'object' || error === null || depth > 4) return false;
  const record = error as Record<string, unknown>;
  return (
    record['code'] === expected ||
    hasDatabaseCode(record['meta'], expected, depth + 1) ||
    hasDatabaseCode(record['cause'], expected, depth + 1)
  );
}

function maskCpf(cpf: string): string {
  return `***.***.***-${cpf.slice(-2)}`;
}

function present(patient: PatientRecord) {
  return {
    ...patient,
    cpf: undefined,
    cpfMasked: maskCpf(patient.cpf),
    birthDate: patient.birthDate?.toISOString().slice(0, 10) ?? null,
    financialStatus: 'UP_TO_DATE' as const,
  };
}

@Injectable()
export class PatientsService {
  constructor(
    @Inject(PATIENTS_REPOSITORY)
    private readonly patients: PatientsRepository,
  ) {}

  async list(principal: AuthenticatedPrincipal, query: ListPatientsQueryDto) {
    const result = await this.patients.list(this.context(principal), query);
    return {
      items: result.items.map(present),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      },
    };
  }

  async findById(principal: AuthenticatedPrincipal, id: string) {
    const patient = await this.patients.findById(this.context(principal), id);
    if (!patient) throw this.notFound();
    return present(patient);
  }

  async create(
    principal: AuthenticatedPrincipal,
    request: RequestMetadata,
    input: CreatePatientDto,
  ) {
    try {
      return present(
        await this.patients.create(
          { ...this.context(principal), request },
          input,
        ),
      );
    } catch (error) {
      if (
        !hasDatabaseCode(error, 'P2002') &&
        !hasDatabaseCode(error, '23505')
      ) {
        throw error;
      }
      throw new ConflictException({
        error: 'PATIENT_CPF_ALREADY_EXISTS',
        message: 'Já existe um paciente com este CPF nesta clínica.',
      });
    }
  }

  async update(
    principal: AuthenticatedPrincipal,
    request: RequestMetadata,
    id: string,
    input: UpdatePatientDto,
  ) {
    try {
      const patient = await this.patients.update(
        { ...this.context(principal), request },
        id,
        input,
      );
      if (!patient) throw this.notFound();
      return present(patient);
    } catch (error) {
      if (
        !hasDatabaseCode(error, 'P2002') &&
        !hasDatabaseCode(error, '23505')
      ) {
        throw error;
      }
      throw new ConflictException({
        error: 'PATIENT_CPF_ALREADY_EXISTS',
        message: 'Já existe um paciente com este CPF nesta clínica.',
      });
    }
  }

  async inactivate(
    principal: AuthenticatedPrincipal,
    request: RequestMetadata,
    id: string,
  ) {
    const patient = await this.patients.inactivate(
      { ...this.context(principal), request },
      id,
    );
    if (!patient) throw this.notFound();
    return present(patient);
  }

  private context(principal: AuthenticatedPrincipal) {
    return { userId: principal.userId, clinicId: principal.activeClinicId! };
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      error: 'PATIENT_NOT_FOUND',
      message: 'Paciente não encontrado.',
    });
  }
}
