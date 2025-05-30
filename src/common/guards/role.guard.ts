import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { UserRole } from "../enums/role.enum";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private cls: ClsService, private reflector: Reflector) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const user = this.cls.get('user');
        if (!user) throw new UnauthorizedException('User not found');

        const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
        if (!roles) return true;

        const hasRole = roles.some(role => user.role === role);
        if (!hasRole) throw new ForbiddenException('You do not have permission this operation');

        return true
    }
}