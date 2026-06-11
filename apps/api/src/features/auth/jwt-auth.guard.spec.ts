import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

function createContext(authorization?: string) {
  const request = { headers: { authorization } };

  return {
    request,
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    },
  };
}

describe('JwtAuthGuard', () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  };
  const guard = new JwtAuthGuard(jwtService as any);

  beforeEach(() => jest.clearAllMocks());

  it('throws when bearer token is missing', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context as any)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws when token type is not bearer', async () => {
    const { context } = createContext('Basic token');

    await expect(guard.canActivate(context as any)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws when token is invalid', async () => {
    const { context } = createContext('Bearer invalid');
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

    await expect(guard.canActivate(context as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches user payload when token is valid', async () => {
    const { context, request } = createContext('Bearer valid');
    jwtService.verifyAsync.mockResolvedValue({ sub: 1, role: 'ADMIN' });

    await expect(guard.canActivate(context as any)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid');
    expect(request).toEqual({
      headers: { authorization: 'Bearer valid' },
      user: { sub: 1, role: 'ADMIN' },
    });
  });
});
