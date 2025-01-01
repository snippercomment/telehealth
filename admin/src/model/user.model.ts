export interface User {
    email: string;
    password?: string;
    roles: 'admin'| 'doctor' ;
    token?: string;
  }

