import { User } from '../domain/model/User';
import { ApiHelper, ApiResponse } from '../../../core/network/ApiHelper';
import { API_PATHS } from '../../../core/network/ApiConstants';

export class AuthRemoteDataSource {


  async login(username: string, password: string): Promise<User> {


    console.log('Logging in with URL:', API_PATHS.LOGIN);

    const response: ApiResponse<User> = await ApiHelper.post<User>(
      API_PATHS.LOGIN,
      { usr: username, pwd: password },
      {},
      User.fromJson // mapper to convert JSON to User
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }

    return response.data;
  }
}
