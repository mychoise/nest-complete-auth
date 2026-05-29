import { SetMetadata } from '@nestjs/common';
import { role } from '../interface/auth.interface';

export const Roles_Key = 'roles';

export const Roles = (...roles: role[]) => SetMetadata(Roles_Key, roles);
