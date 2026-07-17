import { Injectable } from '@nestjs/common';
import { normalizeCpf } from '../../common/validation/cpf.validator';
import { PatientRegistrationStatus } from '../../generated/prisma/enums';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../platform/database/prisma.service';
import type {
  PatientMutationContext,
  PatientRecord,
  PatientsRepository,
} from './patient.models';
import type {
  CreatePatientDto,
  ListPatientsQueryDto,
  UpdatePatientDto,
} from './dto/patient.dto';

const patientSelect = {
  id: true,
  fullName: true,
  cpf: true,
  birthDate: true,
  phone: true,
  whatsapp: true,
  email: true,
  addressLine: true,
  administrativeNotes: true,
  registrationStatus: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PatientSelect;

@Injectable()
export class PrismaPatientsRepository implements PatientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(
    context: Pick<PatientMutationContext, 'userId' | 'clinicId'>,
    query: ListPatientsQueryDto,
  ): Promise<{ items: PatientRecord[]; total: number }> {
    return this.prisma.withSecurityContext(context, async (transaction) => {
      const search = query.search?.trim();
      const where: Prisma.PatientWhereInput = {
        clinicId: context.clinicId,
        deletedAt: null,
        registrationStatus: query.status,
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };
      const [items, total] = await Promise.all([
        transaction.patient.findMany({
          where,
          orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          select: patientSelect,
        }),
        transaction.patient.count({ where }),
      ]);
      return { items, total };
    });
  }

  findById(
    context: Pick<PatientMutationContext, 'userId' | 'clinicId'>,
    id: string,
  ): Promise<PatientRecord | null> {
    return this.prisma.withSecurityContext(context, (transaction) =>
      transaction.patient.findFirst({
        where: { id, clinicId: context.clinicId, deletedAt: null },
        select: patientSelect,
      }),
    );
  }

  create(
    context: PatientMutationContext,
    input: CreatePatientDto,
  ): Promise<PatientRecord> {
    return this.prisma.withSecurityContext(context, async (transaction) => {
      const patient = await transaction.patient.create({
        data: {
          clinicId: context.clinicId,
          fullName: input.fullName.trim(),
          cpf: normalizeCpf(input.cpf),
          birthDate: input.birthDate
            ? new Date(`${input.birthDate}T00:00:00Z`)
            : null,
          phone: input.phone?.trim(),
          whatsapp: input.whatsapp?.trim(),
          email: input.email?.trim().toLowerCase(),
          addressLine: input.addressLine?.trim(),
          administrativeNotes: input.administrativeNotes?.trim(),
          createdBy: context.userId,
          updatedBy: context.userId,
        },
        select: patientSelect,
      });
      await this.audit(transaction, context, 'PATIENT_CREATED', patient.id, {
        registrationStatus: patient.registrationStatus,
      });
      return patient;
    });
  }

  update(
    context: PatientMutationContext,
    id: string,
    input: UpdatePatientDto,
  ): Promise<PatientRecord | null> {
    return this.prisma.withSecurityContext(context, async (transaction) => {
      const existing = await transaction.patient.findFirst({
        where: { id, clinicId: context.clinicId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) return null;

      const patient = await transaction.patient.update({
        where: { id },
        data: {
          ...(input.fullName !== undefined
            ? { fullName: input.fullName.trim() }
            : {}),
          ...(input.cpf !== undefined ? { cpf: normalizeCpf(input.cpf) } : {}),
          ...(input.birthDate !== undefined
            ? { birthDate: new Date(`${input.birthDate}T00:00:00Z`) }
            : {}),
          ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
          ...(input.whatsapp !== undefined
            ? { whatsapp: input.whatsapp.trim() }
            : {}),
          ...(input.email !== undefined
            ? { email: input.email.trim().toLowerCase() }
            : {}),
          ...(input.addressLine !== undefined
            ? { addressLine: input.addressLine.trim() }
            : {}),
          ...(input.administrativeNotes !== undefined
            ? { administrativeNotes: input.administrativeNotes.trim() }
            : {}),
          updatedBy: context.userId,
        },
        select: patientSelect,
      });
      await this.audit(transaction, context, 'PATIENT_UPDATED', patient.id, {
        changedFieldCount: Object.keys(input).length,
      });
      return patient;
    });
  }

  inactivate(
    context: PatientMutationContext,
    id: string,
  ): Promise<PatientRecord | null> {
    return this.prisma.withSecurityContext(context, async (transaction) => {
      const existing = await transaction.patient.findFirst({
        where: { id, clinicId: context.clinicId, deletedAt: null },
        select: patientSelect,
      });
      if (
        !existing ||
        existing.registrationStatus === PatientRegistrationStatus.INACTIVE
      ) {
        return existing;
      }
      const patient = await transaction.patient.update({
        where: { id },
        data: {
          registrationStatus: PatientRegistrationStatus.INACTIVE,
          updatedBy: context.userId,
        },
        select: patientSelect,
      });
      await this.audit(
        transaction,
        context,
        'PATIENT_INACTIVATED',
        patient.id,
        {
          registrationStatus: PatientRegistrationStatus.INACTIVE,
        },
      );
      return patient;
    });
  }

  private async audit(
    transaction: Prisma.TransactionClient,
    context: PatientMutationContext,
    action: string,
    entityId: string,
    metadata: Prisma.InputJsonValue,
  ): Promise<void> {
    await transaction.auditLog.create({
      data: {
        clinicId: context.clinicId,
        actorUserId: context.userId,
        action,
        entityType: 'Patient',
        entityId,
        outcome: 'SUCCESS',
        requestId: context.request.requestId,
        ipPrefix: context.request.ipPrefix,
        userAgentSummary: context.request.userAgentSummary,
        metadataRedacted: metadata,
      },
    });
  }
}
