import { UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const mockedCompare = compare as jest.Mock;

describe('AuthService', () => {
  const prisma: any = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const service = new AuthService(prisma, jwtService as any);
  const dto = { email: 'admin@tudo.test', password: 'password' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when user is not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockedCompare).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('throws when password is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: dto.email,
      role: 'ADMIN',
      passwordHash: 'hash',
    });
    mockedCompare.mockResolvedValue(false);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('returns safe user when credentials are valid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: dto.email,
      role: 'ADMIN',
      passwordHash: 'hash',
    });
    mockedCompare.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(service.login(dto)).resolves.toEqual({
      user: {
        id: 1,
        name: 'Admin',
        email: dto.email,
        role: 'ADMIN',
      },
      accessToken: 'signed-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: dto.email,
      role: 'ADMIN',
    });
  });
});
