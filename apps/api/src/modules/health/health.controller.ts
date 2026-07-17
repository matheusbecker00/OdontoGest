import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../platform/database/prisma.service';
import { RateLimitService } from '../../platform/rate-limit/rate-limit.service';

@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimits: RateLimitService,
  ) {}

  @Public()
  @Get('live')
  @HttpCode(HttpStatus.OK)
  live() {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  async ready() {
    const [database, redis] = await Promise.all([
      this.prisma.healthCheck().then(
        () => true,
        () => false,
      ),
      this.rateLimits.isReady(),
    ]);
    if (!database || !redis) {
      throw new ServiceUnavailableException({
        error: 'NOT_READY',
        message: 'Dependências críticas indisponíveis.',
      });
    }
    return { status: 'ready', dependencies: { database: 'up', redis: 'up' } };
  }
}
