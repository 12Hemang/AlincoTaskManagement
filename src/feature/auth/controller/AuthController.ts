import { BaseController } from '../../../core/BaseController';
import { User } from '../../../feature/auth/domain/model/User';
import { AuthRemoteDataSource } from '../../../feature/auth/data/AuthRemoteDataSource';
import { LoginUser } from '../../../feature/auth/domain/usecase/GetUsers';
import { LocalStorage } from '../../../core/LocalStorge';

export enum AuthActions {
  LOGIN = 'LOGIN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  GUEST = 'GUEST',
}

export class AuthController extends BaseController<User, AuthActions> {
  private loginUseCase = new LoginUser(new AuthRemoteDataSource());

  private async performAction(action: AuthActions, fn: () => Promise<any>, payload?: any) {
    try {
      this.notify({ action, loading: true });

      const result = await fn();

      this.notify({ action, loading: false, data: result || payload });
      return result;
    } catch (e: any) {
      console.error(`[AuthController] Error in action ${action}:`, e.message);
      this.notify({ action, loading: false, error: e.message });
      throw e;
    }
  }

  async checkUser() {
    return await this.performAction(AuthActions.LOGIN, async () => {
      const savedUser = await LocalStorage.getUser();
      return savedUser || null;
    });
  }

  async login(username: string, password: string) {
    return await this.performAction(AuthActions.LOGIN, async () => {
      const user = await this.loginUseCase.execute(username, password);
      await LocalStorage.saveUser(user);
      return user;
    });
  }

  async forgotPassword(email: string) {
    return await this.performAction(AuthActions.FORGOT_PASSWORD, async () => {
      await new Promise((res) => setTimeout(res, 1000));
      return { email };
    });
  }

  async skipAsGuest() {
    return await this.performAction(AuthActions.GUEST, async () => {
      return new User('Guest', 'guest', '');
    });
  }

  async logout() {
    await LocalStorage.clearUser();
    this.notify({ action: AuthActions.LOGIN, loading: false, data: null });
  }
}
