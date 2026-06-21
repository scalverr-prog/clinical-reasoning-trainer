import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import type { UserProfile } from '../types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes (only if Firebase is configured)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.log('Firebase not configured, skipping auth');
      setLoading(false);
      return;
    }

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth timeout - showing app anyway');
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);

      if (firebaseUser && db) {
        // Fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Create initial profile if doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL,
              credentials: [],
              specialties: [],
              employer: null,
              institution: null,
              title: null,
              bio: null,
              notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      setError('Authentication is not configured');
      throw new Error('Authentication is not configured');
    }
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Login failed';
      let friendlyMessage = rawMessage;
      if (rawMessage.includes('auth/operation-not-allowed')) {
        friendlyMessage = 'Email/Password sign-in is not enabled. Please enable it in Firebase Console.';
      } else if (rawMessage.includes('auth/user-not-found') || rawMessage.includes('auth/wrong-password') || rawMessage.includes('auth/invalid-credential')) {
        friendlyMessage = 'Invalid email or password. Please try again.';
      } else if (rawMessage.includes('auth/too-many-requests')) {
        friendlyMessage = 'Too many failed attempts. Please try again later.';
      } else {
        friendlyMessage = rawMessage.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim() || 'Login failed. Please try again.';
      }
      setError(friendlyMessage);
      throw err;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    if (!auth || !db) {
      setError('Authentication is not configured');
      throw new Error('Authentication is not configured');
    }
    setError(null);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(newUser, { displayName });

      // Create user profile in Firestore
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '',
        displayName,
        photoURL: null,
        credentials: [],
        specialties: [],
        employer: null,
        institution: null,
        title: null,
        bio: null,
        notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', newUser.uid), newProfile);
      setProfile(newProfile);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Signup failed';
      // Map Firebase error codes to friendly messages
      let friendlyMessage = rawMessage;
      if (rawMessage.includes('auth/operation-not-allowed')) {
        friendlyMessage = 'Email/Password sign-in is not enabled. Please enable it in Firebase Console under Authentication > Sign-in method.';
      } else if (rawMessage.includes('auth/email-already-in-use')) {
        friendlyMessage = 'An account with this email already exists. Try signing in instead.';
      } else if (rawMessage.includes('auth/weak-password')) {
        friendlyMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (rawMessage.includes('auth/invalid-email')) {
        friendlyMessage = 'Please enter a valid email address.';
      } else {
        friendlyMessage = rawMessage.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim() || 'Signup failed. Please try again.';
      }
      setError(friendlyMessage);
      throw err;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setProfile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      setError('Authentication is not configured');
      throw new Error('Authentication is not configured');
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
      throw err;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile || !db || !auth) return;

    try {
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);

      // Update Firebase Auth profile if displayName or photoURL changed
      if (updates.displayName || updates.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        isConfigured: isFirebaseConfigured,
        login,
        signup,
        logout,
        resetPassword,
        updateUserProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
