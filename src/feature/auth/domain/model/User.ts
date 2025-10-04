// domain/models/User.ts
import { BaseModel } from '../../../../core/network/model/BaseModel';

export class User extends BaseModel<User> {
  constructor(
    public fullName: string,
    public userId: string,
    public sid: string
  ) {
    super();
  }

  static override fromJson(json: any): User {
    return new User(
      json.full_name ?? '',
      json.user_id ?? '',
      json.sid ?? ''
    );
  }

  override toJson(): any {
    return {
      full_name: this.fullName,
      user_id: this.userId,
      sid: this.sid,
    };
  }
}
