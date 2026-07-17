import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { AppEnvironment } from '../../config/environment';
import { AccessTokenGuard } from './access-token.guard';
import { AccessTokenService } from './access-token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthorizationGuard } from './authorization.guard';
import { CryptoService } from './crypto.service';
import { FirebaseIdentityService } from './firebase-identity.service';
import { OriginGuard } from './origin.guard';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnvironment, true>) => ({
        secret: config.get('ACCESS_TOKEN_SECRET', { infer: true }),
        signOptions: { algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptoService,
    FirebaseIdentityService,
    OnboardingService,
    AccessTokenService,
    AccessTokenGuard,
    AuthorizationGuard,
    OriginGuard,
  ],
  exports: [
    AccessTokenGuard,
    AccessTokenService,
    AuthorizationGuard,
    CryptoService,
    FirebaseIdentityService,
  ],
})
export class AuthModule {}
