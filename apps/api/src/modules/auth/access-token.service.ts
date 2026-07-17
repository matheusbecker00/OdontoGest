import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import type { AppEnvironment } from '../../config/environment';

const accessTokenPayloadSchema = z.object({
  sub: z.uuid(),
  sid: z.uuid(),
  sv: z.number().int().positive(),
  clinicId: z.uuid().nullable(),
  type: z.literal('access'),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

@Injectable()
export class AccessTokenService {
  private readonly ttlSeconds: number;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService<AppEnvironment, true>,
  ) {
    this.ttlSeconds = config.get('ACCESS_TOKEN_TTL_SECONDS', { infer: true });
  }

  async sign(
    input: Omit<AccessTokenPayload, 'sub' | 'type'> & { userId: string },
  ): Promise<string> {
    return this.jwt.signAsync(
      {
        sid: input.sid,
        sv: input.sv,
        clinicId: input.clinicId,
        type: 'access',
      },
      { subject: input.userId, expiresIn: this.ttlSeconds },
    );
  }

  async verify(token: string): Promise<AccessTokenPayload> {
    try {
      return accessTokenPayloadSchema.parse(
        await this.jwt.verifyAsync<Record<string, unknown>>(token, {
          algorithms: ['HS256'],
        }),
      );
    } catch {
      throw new UnauthorizedException({
        error: 'INVALID_ACCESS_TOKEN',
        message: 'Sessão inválida ou expirada.',
      });
    }
  }
}
