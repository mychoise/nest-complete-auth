export interface register {
  email: string;
  passsword: string;
  name: string;
  role?: 'admin' | 'user';
}

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type role = 'admin' | 'user';

export interface login {
  email: string;
  password: string;
  role?: 'admin' | 'user';
}
