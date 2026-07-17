import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../../generated/prisma/client';
import type { AppEnvironment } from '../../config/environment';

export interface SecurityContext {
  userId: string;
  clinicId?: string | null;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly testRuntimeRole: string | undefined;

  constructor(config: ConfigService<AppEnvironment, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000,
      max: 10,
    });
    super({ adapter });
    this.testRuntimeRole = config.get('TEST_DATABASE_RUNTIME_ROLE', {
      infer: true,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async healthCheck(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }

  async withSecurityContext<T>(
    context: SecurityContext,
    work: (transaction: Prisma.TransactionClient) => Promise<T>,
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): Promise<T> {
    return this.$transaction(async (transaction) => {
      if (this.testRuntimeRole) {
        await transaction.$executeRawUnsafe(
          `SET LOCAL ROLE "${this.testRuntimeRole}"`,
        );
      }
      await transaction.$executeRaw`
          SELECT set_config('app.current_user_id', ${context.userId}, true)
        `;
      await transaction.$executeRaw`
          SELECT set_config('app.current_clinic_id', ${context.clinicId ?? ''}, true)
        `;
      return work(transaction);
    }, options);
  }
}
