import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/database/prisma.module';
import { PATIENTS_REPOSITORY } from './patient.models';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PrismaPatientsRepository } from './prisma-patients.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [
    PatientsService,
    PrismaPatientsRepository,
    {
      provide: PATIENTS_REPOSITORY,
      useExisting: PrismaPatientsRepository,
    },
  ],
})
export class PatientsModule {}
