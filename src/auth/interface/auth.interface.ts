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
