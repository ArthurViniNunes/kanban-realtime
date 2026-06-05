import { authApi } from '../api/auth.api';

const TOKEN_KEY = 'token';

export class AuthService {
  async login(email: string, password: string) {
    const data = await authApi.login({
      email,
      password,
    });

    this.saveToken(data.token);

    return data;
  }

  async register(name: string, email: string, password: string) {
    return authApi.register({
      name,
      email,
      password,
    });
  }

  async me() {
    return authApi.me();
  }

  async deleteMe() {
    return authApi.deleteMe();
  }

  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
