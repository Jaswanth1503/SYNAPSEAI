import { apiClient, setAccessToken } from './api.client';

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: 'student' | 'instructor' | 'org_admin';
  personalWorkspaceId?: string;
  currentOrgId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: UserProfile;
  accessToken: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await apiClient.post('/auth/register', payload);
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    return { user, accessToken };
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await apiClient.post('/auth/login', payload);
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    return { user, accessToken };
  },

  async refresh(): Promise<AuthResponseData> {
    const res = await apiClient.post('/auth/refresh');
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    return { user, accessToken };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get('/auth/me');
    return res.data.data.user;
  },
};
