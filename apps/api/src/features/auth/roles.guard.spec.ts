import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

function createContext(role?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
    getHandler: () => 'handler',
    getClass: () => 'class',
  };
}

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new RolesGuard(reflector as any);

  beforeEach(() => jest.clearAllMocks());

  it('allows request when route has no role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext() as any)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, ['handler', 'class']);
  });

  it('allows request when user role is permitted', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createContext(UserRole.ADMIN) as any)).toBe(true);
  });

  it('throws when user role is not permitted', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => guard.canActivate(createContext(UserRole.CASHIER) as any)).toThrow(ForbiddenException);
  });

  it('throws when user payload is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => guard.canActivate(createContext() as any)).toThrow(ForbiddenException);
  });
});
