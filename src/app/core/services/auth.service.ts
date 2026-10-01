import { Injectable, signal, computed } from '@angular/core';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: string;
  lastLoginAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly firestore: Firestore;

  readonly user = signal<User | null>(null);
  readonly loading = signal<boolean>(true);
  readonly authError = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly userDisplayName = computed(() => {
    const u = this.user();
    if (!u) return 'Guest';
    return u.displayName || u.email?.split('@')[0] || 'Film Cinephile';
  });
  readonly userEmail = computed(() => this.user()?.email || '');
  readonly userInitials = computed(() => {
    const name = this.userDisplayName();
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  constructor() {
    this.app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    onAuthStateChanged(this.auth, (currentUser) => {
      this.user.set(currentUser);
      this.loading.set(false);
      if (currentUser) {
        this.touchUserProfile(currentUser);
      }
    });
  }

  async signUp(email: string, pass: string, displayName?: string): Promise<User> {
    this.authError.set(null);
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email.trim(), pass);
      if (displayName && displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      await this.saveUserProfile(cred.user, displayName);
      return cred.user;
    } catch (err: any) {
      const friendlyMessage = this.formatAuthError(err.code || err.message);
      this.authError.set(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  }

  async signIn(email: string, pass: string): Promise<User> {
    this.authError.set(null);
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email.trim(), pass);
      await this.touchUserProfile(cred.user);
      return cred.user;
    } catch (err: any) {
      const friendlyMessage = this.formatAuthError(err.code || err.message);
      this.authError.set(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  }

  async signOut(): Promise<void> {
    this.authError.set(null);
    await firebaseSignOut(this.auth);
  }

  private async saveUserProfile(user: User, customDisplayName?: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: customDisplayName || user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not save user profile doc:', e);
    }
  }

  private async touchUserProfile(user: User): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await this.saveUserProfile(user);
      } else {
        await setDoc(
          userRef,
          {
            lastLoginAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Could not touch user profile doc:', e);
    }
  }

  private formatAuthError(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Access blocked due to unusual activity. Try again later.';
      default:
        return code.replace(/^auth\//, '').replace(/-/g, ' ');
    }
  }
}
