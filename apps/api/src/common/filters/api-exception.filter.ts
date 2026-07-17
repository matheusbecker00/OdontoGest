import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: readonly string[];
    requestId: string;
  };
}

function normalizeHttpError(
  exception: HttpException,
): Omit<ErrorBody['error'], 'requestId'> {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return { code: `HTTP_${exception.getStatus()}`, message: response };
  }

  const responseObject = response as Record<string, unknown>;
  const message = responseObject['message'];
  if (Array.isArray(message)) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Verifique os campos informados.',
      details: message.filter(
        (item): item is string => typeof item === 'string',
      ),
    };
  }

  return {
    code:
      typeof responseObject['error'] === 'string'
        ? responseObject['error']
        : `HTTP_${exception.getStatus()}`,
    message:
      typeof message === 'string'
        ? message
        : 'Não foi possível concluir a solicitação.',
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response<ErrorBody>>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      const errorCode =
        typeof exception === 'object' &&
        exception !== null &&
        'code' in exception &&
        typeof exception.code === 'string'
          ? exception.code
          : undefined;
      const cause =
        typeof exception === 'object' &&
        exception !== null &&
        'cause' in exception &&
        typeof exception.cause === 'object' &&
        exception.cause !== null
          ? (exception.cause as Record<string, unknown>)
          : undefined;
      this.logger.error({
        event: 'unhandled_exception',
        requestId: request.id,
        method: request.method,
        exceptionType:
          exception instanceof Error ? exception.constructor.name : 'Unknown',
        errorCode,
        errorKind:
          typeof cause?.['kind'] === 'string' ? cause['kind'] : undefined,
        driverCode:
          typeof cause?.['code'] === 'string' ? cause['code'] : undefined,
      });
    }

    const error =
      exception instanceof HttpException
        ? normalizeHttpError(exception)
        : {
            code: 'INTERNAL_ERROR',
            message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
          };

    response.status(status).json({
      error: {
        ...error,
        requestId:
          typeof request.id === 'string'
            ? request.id
            : typeof request.id === 'number'
              ? request.id.toString()
              : 'unknown',
      },
    });
  }
}
