import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('delegates login to service', () => {
    const authService = { login: jest.fn().mockReturnValue({ user: { id: 1 } }) } as unknown as AuthService;
    const controller = new AuthController(authService);
    const dto = { email: 'admin@tudo.test', password: 'password' };

    expect(controller.login(dto)).toEqual({ user: { id: 1 } });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
