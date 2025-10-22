// types.ts
export interface UserRole {
  name: string;
  role: string;
}

export interface UserProfile {
  name: string;
  full_name: string;
  email: string;
  first_name: string;
  username: string;
  user_image?: string;
  roles: UserRole[];
  last_login?: string;
  language?: string;
  desk_theme?: string;
  [key: string]: any; // for other optional fields
}
