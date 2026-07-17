import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import { TenancyService } from './tenancy.service';
import { TenantContextResponseDto } from './dto/tenancy-response.dto';

@ApiTags('Tenancy')
@ApiBearerAuth()
@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancy: TenancyService) {}

  @Get('clinics')
  async clinics(@CurrentPrincipal() principal: AuthenticatedPrincipal) {
    return { items: await this.tenancy.listClinics(principal.userId) };
  }

  @Get('context')
  @ApiOkResponse({ type: TenantContextResponseDto })
  context(@CurrentPrincipal() principal: AuthenticatedPrincipal) {
    return this.tenancy.context(principal);
  }
}
