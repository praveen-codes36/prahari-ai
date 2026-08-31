import { AuthUser, AuthSession, UserRole, RoleCredentialPreset } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'prahari_auth_session';

export const ROLE_PRESETS: Record<UserRole, RoleCredentialPreset> = {
  authority: {
    role: 'authority',
    title: 'AUTHORITY HQ',
    subtitle: 'Infrastructure Command',
    iconName: 'ShieldCheck',
    badge: 'LEVEL-4 HQ',
    defaultEmail: 'commissioner.pwd@prahari.gov.in',
    defaultEmployeeId: 'PWD-EXEC-0941',
    targetRoute: '/authority',
    clearanceLabel: 'PWD / NHAI Executive Command & AI Triage Authority',
    description: 'Executive overview, AI risk matrix, budget release & work order authorization.',
  },
  emergency: {
    role: 'emergency',
    title: 'EMERGENCY OPS',
    subtitle: 'Response Command',
    iconName: 'Zap',
    badge: 'LEVEL-3 OPS',
    defaultEmail: 'dispatcher.ems42@prahari.gov.in',
    defaultEmployeeId: 'EMS-DISP-8820',
    targetRoute: '/emergency',
    clearanceLabel: 'Emergency Response, Signal Preemption & Corridor Dispatch',
    description: 'Real-time incident queue, live green wave routing & GPS fleet control.',
  },
  maintenance: {
    role: 'maintenance',
    title: 'FIELD SQUAD',
    subtitle: 'Maintenance Ops',
    iconName: 'Wrench',
    badge: 'LEVEL-2 FIELD',
    defaultEmail: 'lead.alpha@prahari.gov.in',
    defaultEmployeeId: 'SQD-LEAD-4012',
    targetRoute: '/authority/field-teams',
    clearanceLabel: 'Field Repair Operations & Optical Verification Companion',
    description: 'Work order execution, safety checklists & optical AI repair proof.',
  },
  citizen: {
    role: 'citizen',
    title: 'CITIZEN',
    subtitle: 'Public Access',
    iconName: 'User',
    badge: 'LEVEL-1 PUBLIC',
    defaultEmail: 'citizen.user@gmail.com',
    defaultEmployeeId: 'CITIZEN-IN-889',
    targetRoute: '/citizen',
    clearanceLabel: 'Public Road Hazard Submission & Live Safety Nav',
    description: 'Photo defect scanning, pothole bounties & corridor safety alerts.',
  },
};

export const MOCK_USERS: Record<UserRole, AuthUser> = {
  authority: {
    id: 'USR-AUTH-01',
    employeeId: 'PWD-EXEC-0941',
    name: 'Dr. Rajeshwari Sengupta (IAS)',
    email: 'commissioner.pwd@prahari.gov.in',
    role: 'authority',
    department: 'Ministry of Road Transport & Highways / NHAI',
    clearanceLevel: 'LEVEL-4 EXECUTIVE HQ',
    badgeNumber: 'NHAI-HQ-4091',
    lastLoginAt: 'Just now',
  },
  emergency: {
    id: 'USR-EMERG-02',
    employeeId: 'EMS-DISP-8820',
    name: 'Chief Controller Vikram Deshmukh',
    email: 'dispatcher.ems42@prahari.gov.in',
    role: 'emergency',
    department: 'State Emergency Operations Center (SEOC / 108 Command)',
    clearanceLevel: 'LEVEL-3 DISPATCH',
    badgeNumber: 'SEOC-DISP-108',
    lastLoginAt: 'Just now',
  },
  maintenance: {
    id: 'USR-MAINT-03',
    employeeId: 'SQD-LEAD-4012',
    name: 'Inspector Ramesh Yadav',
    email: 'lead.alpha@prahari.gov.in',
    role: 'maintenance',
    department: 'Rapid Infrastructure Repair Fleet (Squad Alpha)',
    clearanceLevel: 'LEVEL-2 FIELD',
    badgeNumber: 'RAPID-SQD-04',
    lastLoginAt: 'Just now',
  },
  citizen: {
    id: 'USR-CITZ-04',
    employeeId: 'CITIZEN-IN-889',
    name: 'Krishna Kumar',
    email: 'citizen.user@gmail.com',
    role: 'citizen',
    department: 'Civilian Infrastructure Sentinel',
    clearanceLevel: 'LEVEL-1 PUBLIC',
    badgeNumber: 'CITZ-IN-889',
    lastLoginAt: 'Just now',
  },
};

export const authService = {
  async requestRegistrationOtp(payload: {
    name: string;
    email: string;
    password: string;
    role: 'CITIZEN' | 'AUTHORITY' | 'EMERGENCY' | 'ADMIN';
    department_id?: string;
  }) {
    return await apiClient.post('/auth/register/request-otp', {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
      ...(payload.department_id ? { department_id: payload.department_id.trim() } : {}),
    });
  },

  async verifyRegistrationOtp(email: string, otp: string) {
    return await apiClient.post('/auth/register/verify-otp', {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    });
  },

  async forgotPassword(email: string) {
    return await apiClient.post('/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });
  },

  async resendOTP(email: string) {
    return await apiClient.post('/auth/resend-otp', {
      email: email.trim().toLowerCase(),
    });
  },

  async verifyOTP(email: string, otp: string) {
    return await apiClient.post('/auth/verify-otp', {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    });
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    return await apiClient.post('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      newPassword,
    });
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role: 'CITIZEN' | 'AUTHORITY' | 'EMERGENCY' | 'ADMIN';
    department_id?: string;
  }) {
    const requestBody = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
      ...(payload.department_id ? { department_id: payload.department_id.trim() } : {}),
    };

    return await apiClient.post('/auth/register', requestBody);
  },

  // Get active stored session
  getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed: AuthSession = JSON.parse(data);
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        this.logout();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const session = this.getSession();
    return !!session && session.isAuthenticated;
  },

  // Get current user role
  getCurrentRole(): UserRole {
    const session = this.getSession();
    return session?.user?.role || 'authority';
  },

  // Authenticate user with role preset or manual inputs
  async login(
    emailOrEmployeeId: string,
    password?: string,
    selectedRole: UserRole = 'authority',
    rememberMe = true
  ): Promise<AuthSession> {
    try {
      return await this._executeLogin(emailOrEmployeeId, password, selectedRole, rememberMe);
    } catch (error: any) {
      // Auto-register demo users if they don't exist in the database
      if (error.response?.status === 400 && Object.values(MOCK_USERS).some(u => u.email === emailOrEmployeeId)) {
        const mockUser = Object.values(MOCK_USERS).find(u => u.email === emailOrEmployeeId);
        if (mockUser) {
           await apiClient.post('/auth/register', {
             name: mockUser.name,
             email: mockUser.email,
             password: password || 'password123',
             role: mockUser.role.toUpperCase()
           });
           // Retry login
           return await this._executeLogin(emailOrEmployeeId, password, selectedRole, rememberMe);
        }
      }
      console.error('Login failed:', error);
      throw error;
    }
  },

  async _executeLogin(emailOrEmployeeId: string, password?: string, selectedRole: UserRole = 'authority', rememberMe = true) {
    const response = await apiClient.post('/auth/login', {
      email: emailOrEmployeeId,
      password: password || 'password123',
    });
    
    const { user, token } = response.data;
    
    const authUser: AuthUser = {
      ...user,
      role: user.role.toLowerCase() as UserRole,
      lastLoginAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      employeeId: user.employeeId || 'ID-001',
      department: user.department || 'Gov',
      clearanceLevel: 'LEVEL',
      badgeNumber: 'BDG-001'
    };

    const session: AuthSession = {
      user: authUser,
      token,
      expiresAt: rememberMe ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000,
      isAuthenticated: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },



  // Logout and clear storage
  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
