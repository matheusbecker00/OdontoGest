import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'odontogest:permissions';
export const RequirePermissions = (
  ...permissions: string[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
