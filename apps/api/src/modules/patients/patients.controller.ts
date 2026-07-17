import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import { requestMetadata } from '../../common/http/request-metadata';
import {
  CreatePatientDto,
  ListPatientsQueryDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import { PatientsService } from './patients.service';

@ApiTags('Pacientes')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  @RequirePermissions('patient.read')
  @ApiOperation({ operationId: 'patientsList' })
  list(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Query() query: ListPatientsQueryDto,
  ) {
    return this.patients.list(principal, query);
  }

  @Get(':id')
  @RequirePermissions('patient.read')
  @ApiOperation({ operationId: 'patientsFindById' })
  findById(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.patients.findById(principal, id);
  }

  @Post()
  @RequirePermissions('patient.create')
  @ApiOperation({ operationId: 'patientsCreate' })
  create(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Req() request: Request,
    @Body() input: CreatePatientDto,
  ) {
    return this.patients.create(principal, requestMetadata(request), input);
  }

  @Patch(':id')
  @RequirePermissions('patient.update')
  @ApiOperation({ operationId: 'patientsUpdate' })
  update(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() input: UpdatePatientDto,
  ) {
    return this.patients.update(principal, requestMetadata(request), id, input);
  }

  @Post(':id/inactivate')
  @RequirePermissions('patient.inactivate')
  @ApiOperation({ operationId: 'patientsInactivate' })
  inactivate(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.patients.inactivate(principal, requestMetadata(request), id);
  }
}
