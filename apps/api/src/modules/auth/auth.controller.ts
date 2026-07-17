import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { AppEnvironment } from '../../config/environment';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import { requestMetadata } from '../../common/http/request-metadata';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  ActiveClinicResponseDto,
  LoginDto,
  LoginResponseDto,
  MessageResponseDto,
  RefreshResponseDto,
  ResetPasswordDto,
  SelectActiveClinicDto,
  SessionsResponseDto,
  SignUpDto,
  TokenDto,
} from './dto/auth.dto';
import { OriginGuard } from './origin.guard';

function readCookie(request: Request, name: string): string | null {
  const cookies = request.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[name];
  return typeof value === 'string' ? value : null;
}

@ApiTags('Autenticação')
@Controller('auth')
@UseGuards(OriginGuard)
export class AuthController {
  private readonly cookieName: string;
  private readonly cookieSecure: boolean;
  private readonly cookieMaxAgeMs: number;

  constructor(
    private readonly auth: AuthService,
    config: ConfigService<AppEnvironment, true>,
  ) {
    this.cookieName = config.get('COOKIE_NAME', { infer: true });
    this.cookieSecure = config.get('COOKIE_SECURE', { infer: true });
    this.cookieMaxAgeMs =
      config.get('REFRESH_TOKEN_IDLE_TTL_SECONDS', { infer: true }) * 1_000;
  }

  private setRefreshCookie(response: Response, token: string): void {
    response.cookie(this.cookieName, token, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: this.cookieMaxAgeMs,
      priority: 'high',
    });
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(this.cookieName, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicita a criação de uma conta de usuário' })
  @ApiResponse({
    status: 202,
    description: 'Solicitação recebida sem enumerar contas',
    type: MessageResponseDto,
  })
  async signUp(@Body() input: SignUpDto, @Req() request: Request) {
    await this.auth.signUp(input, requestMetadata(request));
    return {
      message: 'Se os dados forem válidos, enviaremos as próximas instruções.',
    };
  }

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(
    @Body() input: TokenDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.auth.verifyEmail(input.token, requestMetadata(request));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponseDto })
  async login(
    @Body() input: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken, ...result } = await this.auth.login(
      input,
      requestMetadata(request),
    );
    this.setRefreshCookie(response, refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ type: RefreshResponseDto })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken, ...result } = await this.auth.refresh(
      readCookie(request, this.cookieName),
      requestMetadata(request),
    );
    this.setRefreshCookie(response, refreshToken);
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    try {
      await this.auth.logout(
        readCookie(request, this.cookieName),
        requestMetadata(request),
      );
    } finally {
      this.clearRefreshCookie(response);
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async logoutAll(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.logoutAll(principal, requestMetadata(request));
    this.clearRefreshCookie(response);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ status: 202, type: MessageResponseDto })
  async forgotPassword(
    @Body() input: ForgotPasswordDto,
    @Req() request: Request,
  ) {
    await this.auth.forgotPassword(input, requestMetadata(request));
    return {
      message: 'Se a conta existir, enviaremos as próximas instruções.',
    };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Body() input: ResetPasswordDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.auth.resetPassword(input, requestMetadata(request));
  }

  @Post('active-clinic')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ActiveClinicResponseDto })
  async selectActiveClinic(
    @Body() input: SelectActiveClinicDto,
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Req() request: Request,
  ) {
    return this.auth.selectActiveClinic(
      principal,
      input.clinicId,
      requestMetadata(request),
    );
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOkResponse({ type: SessionsResponseDto })
  async sessions(@CurrentPrincipal() principal: AuthenticatedPrincipal) {
    return { items: await this.auth.listSessions(principal) };
  }
}
