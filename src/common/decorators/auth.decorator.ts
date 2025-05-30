import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '../enums/role.enum';
import { Role } from './role.decorator';

export const Auth = (...roles: UserRole[]) => {
    return applyDecorators(
        UseGuards(AuthGuard, RoleGuard),
        Role(...roles),
        ApiBearerAuth()
    );
}