import { SetMetadata } from '@nestjs/common';
import { GlobalRole, KebunRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (GlobalRole | KebunRole | string)[]) =>
  SetMetadata(ROLES_KEY, roles);
