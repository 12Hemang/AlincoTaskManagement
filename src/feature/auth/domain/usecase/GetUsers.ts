import {User} from '../model/User';
import {AuthRemoteDataSource} from '../../data/AuthRemoteDataSource';


export class LoginUser {
  private authDataSource: AuthRemoteDataSource;

  constructor(authDataSource: AuthRemoteDataSource) {
    this.authDataSource = authDataSource;
  }

  async execute(username: string, password: string): Promise<User> {
    return this.authDataSource.login(username, password);
  }
}
