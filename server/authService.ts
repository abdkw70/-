import crypto from 'crypto';
import { db } from './db';
import { gamificationEngine } from './gamification';
import { UserProfile, UserWallet } from './types';

export interface UserCredential {
  email: string;
  passwordHash: string;
  salt: string;
  userId: string;
  displayName: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  phone: string;
  role: 'user' | 'admin';
  expiresAt: number;
}

interface RecoveryTokenRecord {
  email: string;
  token: string;
  expiresAt: number;
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return { hash: h, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const h = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return h === hash;
}

class AuthService {
  private recoveryTokens: Map<string, RecoveryTokenRecord> = new Map();
  private activeSessions: Map<string, AuthSession> = new Map();

  private ensureSchema(): void {
    const raw = (db as any).data;
    if (!raw) return;
    if (!raw.userCredentials) {
      raw.userCredentials = {};
    }
  }

  public getCredentials(): Record<string, UserCredential> {
    this.ensureSchema();
    return (db as any).data?.userCredentials || {};
  }

  public registerUser(
    email: string,
    password: string,
    displayName?: string,
    phone?: string
  ): {
    user: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' };
    profile: UserProfile;
    wallet: UserWallet;
    token: string;
  } {
    this.ensureSchema();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('صيغة البريد الإلكتروني غير صحيحة');
    }
    if (!password || password.length < 6) {
      throw new Error('كلمة المرور يجب أن تحتوي على 6 خانات على الأقل');
    }

    const raw = (db as any).data;
    if (raw.userCredentials[cleanEmail]) {
      throw new Error('هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول أو استعادة كلمة المرور');
    }

    // Check if existing profile in gamification (e.g. from Google or guest order)
    const existingCheck = gamificationEngine.checkAccountByEmail(cleanEmail);
    let userId = existingCheck.profile?.id;
    if (!userId) {
      userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    const effectiveName = displayName || existingCheck.profile?.displayName || cleanEmail.split('@')[0] || 'عميل المتجر';
    const effectivePhone = phone || existingCheck.profile?.phone || '';
    const role: 'user' | 'admin' = cleanEmail === 'abdulrahmankw20@gmail.com' ? 'admin' : 'user';

    const { hash, salt } = hashPassword(password);

    const credential: UserCredential = {
      email: cleanEmail,
      passwordHash: hash,
      salt,
      userId,
      displayName: effectiveName,
      phone: effectivePhone,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    raw.userCredentials[cleanEmail] = credential;
    db.save();

    // Sync gamification profile & wallet
    const syncRes = gamificationEngine.syncUserProfile(userId, {
      email: cleanEmail,
      displayName: effectiveName,
      phone: effectivePhone,
      authProvider: 'email',
    });
    const profile = syncRes.profile;
    const wallet = syncRes.wallet;

    // Create session token
    const token = this.createSession({
      uid: userId,
      email: cleanEmail,
      displayName: effectiveName,
      phone: effectivePhone,
      role,
    });

    return {
      user: {
        uid: userId,
        email: cleanEmail,
        displayName: effectiveName,
        phone: effectivePhone,
        role,
      },
      profile,
      wallet,
      token,
    };
  }

  public loginUser(
    email: string,
    password: string
  ): {
    user: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' };
    profile: UserProfile;
    wallet: UserWallet;
    token: string;
  } {
    this.ensureSchema();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('يرجى إدخال البريد الإلكتروني');
    }

    const raw = (db as any).data;
    const cred: UserCredential | undefined = raw.userCredentials[cleanEmail];

    if (!cred) {
      // Check if account exists in profiles or is store admin
      const existingCheck = gamificationEngine.checkAccountByEmail(cleanEmail);
      if (!existingCheck.exists) {
        const err: any = new Error('الحساب غير موجود، يرجى التحقق من البريد أو إنشاء حساب جديد');
        err.code = 'user-not-found';
        throw err;
      }

      // Account exists but has no password set (e.g. Google-only account)
      const err: any = new Error('هذا الحساب مسجل في المتجر بدون كلمة مرور. يرجى الضغط على «نسيت كلمة المرور؟» لتعيين كلمة مرور لحسابك، أو تسجيل الدخول عبر Google.');
      err.code = 'no-password-set';
      throw err;
    }

    // Verify password
    const isMatch = verifyPassword(password, cred.passwordHash, cred.salt);
    if (!isMatch) {
      const err: any = new Error('بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور');
      err.code = 'wrong-password';
      throw err;
    }

    // Sync profile & wallet
    const syncRes = gamificationEngine.syncUserProfile(cred.userId, {
      email: cred.email,
      displayName: cred.displayName,
      phone: cred.phone,
      authProvider: 'email',
    });
    const profile = syncRes.profile;
    const wallet = syncRes.wallet;

    const token = this.createSession({
      uid: cred.userId,
      email: cred.email,
      displayName: cred.displayName,
      phone: cred.phone,
      role: cred.role,
    });

    return {
      user: {
        uid: cred.userId,
        email: cred.email,
        displayName: cred.displayName,
        phone: cred.phone,
        role: cred.role,
      },
      profile,
      wallet,
      token,
    };
  }

  public verifyGoogleRecovery(
    targetEmail: string,
    googleEmail: string
  ): { success: boolean; recoveryToken: string; email: string } {
    this.ensureSchema();
    const cleanGoogle = (googleEmail || '').trim().toLowerCase();
    if (!cleanGoogle || !cleanGoogle.includes('@')) {
      const err: any = new Error('بريد Google الإلكتروني غير صالح');
      err.code = 'invalid-google-email';
      throw err;
    }

    const cleanTarget = (targetEmail || '').trim().toLowerCase();
    if (cleanTarget && cleanTarget !== cleanGoogle) {
      const err: any = new Error('البريد الإلكتروني لحساب Google غير متطابق مع البريد المدخل');
      err.code = 'email-mismatch';
      throw err;
    }

    // Verify account exists in store
    const accountCheck = gamificationEngine.checkAccountByEmail(cleanGoogle);
    const raw = (db as any).data;
    const hasCreds = Boolean(raw.userCredentials?.[cleanGoogle]);

    if (!accountCheck.exists && !hasCreds) {
      const err: any = new Error('لم نتمكن من العثور على أي حساب مسجل بهذا البريد الإلكتروني في المتجر');
      err.code = 'account-not-found';
      throw err;
    }

    // Generate recovery token valid for 15 minutes
    const token = `rec_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = Date.now() + 15 * 60 * 1000;

    this.recoveryTokens.set(token, {
      email: cleanGoogle,
      token,
      expiresAt,
    });

    return {
      success: true,
      recoveryToken: token,
      email: cleanGoogle,
    };
  }

  public resetUserPassword(
    email: string,
    recoveryToken: string,
    newPassword: string
  ): { success: boolean; message: string; email: string } {
    this.ensureSchema();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!newPassword || newPassword.length < 6) {
      const err: any = new Error('كلمة المرور يجب أن تحتوي على 6 خانات على الأقل');
      err.code = 'password-too-short';
      throw err;
    }

    const record = this.recoveryTokens.get(recoveryToken);
    if (!record || record.email !== cleanEmail || record.expiresAt < Date.now()) {
      const err: any = new Error('انتهت صلاحية جلسة التحقق، يرجى إعادة التحقق عبر Google');
      err.code = 'token-expired';
      throw err;
    }

    const raw = (db as any).data;
    const { hash, salt } = hashPassword(newPassword);

    let cred: UserCredential | undefined = raw.userCredentials[cleanEmail];
    if (cred) {
      cred.passwordHash = hash;
      cred.salt = salt;
      cred.updatedAt = new Date().toISOString();
    } else {
      // User registered via Google or guest before, create their password credentials now
      const accountCheck = gamificationEngine.checkAccountByEmail(cleanEmail);
      const userId = accountCheck.profile?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const displayName = accountCheck.profile?.displayName || cleanEmail.split('@')[0] || 'عميل المتجر';
      const phone = accountCheck.profile?.phone || '';
      const role: 'user' | 'admin' = cleanEmail === 'abdulrahmankw20@gmail.com' ? 'admin' : 'user';

      cred = {
        email: cleanEmail,
        passwordHash: hash,
        salt,
        userId,
        displayName,
        phone,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      raw.userCredentials[cleanEmail] = cred;

      // Ensure profile exists
      gamificationEngine.syncUserProfile(userId, {
        email: cleanEmail,
        displayName,
        phone,
        authProvider: 'email',
      });
    }

    // Invalidate the recovery token
    this.recoveryTokens.delete(recoveryToken);

    // Save DB
    db.save();

    // Log security activity in store
    if (Array.isArray(raw.activityLogs)) {
      raw.activityLogs.unshift({
        id: `log_${Date.now()}`,
        action: 'تحديث كلمة المرور',
        details: `تم استعادة وتحديث كلمة المرور بنجاح لحساب ${cleanEmail} عبر التحقق الآمن من Google`,
        category: 'auth',
        timestamp: new Date().toISOString(),
      });
      if (raw.activityLogs.length > 500) {
        raw.activityLogs = raw.activityLogs.slice(0, 500);
      }
    }

    return {
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول بها',
      email: cleanEmail,
    };
  }

  private createSession(user: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' }): string {
    const token = `sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    this.activeSessions.set(token, {
      token,
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      role: user.role,
      expiresAt,
    });

    return token;
  }

  public validateSession(token: string): {
    valid: boolean;
    user?: { uid: string; email: string; displayName: string; phone: string; role: 'user' | 'admin' };
    profile?: UserProfile;
    wallet?: UserWallet;
  } {
    if (!token) return { valid: false };
    const sess = this.activeSessions.get(token);
    if (!sess || sess.expiresAt < Date.now()) {
      if (sess) this.activeSessions.delete(token);
      return { valid: false };
    }

    const syncRes = gamificationEngine.syncUserProfile(sess.userId, {
      email: sess.email,
      displayName: sess.displayName,
      phone: sess.phone,
    });
    const profile = syncRes.profile;
    const wallet = syncRes.wallet;

    return {
      valid: true,
      user: {
        uid: sess.userId,
        email: sess.email,
        displayName: sess.displayName,
        phone: sess.phone,
        role: sess.role,
      },
      profile,
      wallet,
    };
  }

  public destroySession(token: string): void {
    if (token) {
      this.activeSessions.delete(token);
    }
  }
}

export const authService = new AuthService();
