import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @RequirePermissions('audit.read')
  async list(@CurrentPrincipal() principal: AuthenticatedPrincipal) {
    return {
      items: await this.audit.listTenantEvents(
        principal.userId,
        principal.activeClinicId!,
      ),
    };
  }
}
