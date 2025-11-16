
export interface UsuarioRegistro {
  email: string;
  password: string;
  username: string;
}

export interface UsuarioLogin {
  email: string;
  password: string;
}

export interface UsuarioPayload {
  id: number;
  email: string;
  username: string;
}