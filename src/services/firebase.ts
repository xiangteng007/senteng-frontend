/**
 * firebase.ts
 *
 * Firebase Configuration and Authentication Service
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    Auth,
    User as FirebaseUser,
    Unsubscribe,
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    serverTimestamp,
    query,
    orderBy,
    Firestore,
    FieldValue,
} from 'firebase/firestore';

// ==========================================
// Types
// ==========================================

export interface FirebaseConfig {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    storageBucket: string | undefined;
    messagingSenderId: string | undefined;
    appId: string | undefined;
}

export interface RoleConfig {
    name: string;
    level: number;
    allowedPages: string[];
}

export interface UserData {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: string;
    googleId: string;
    lineUserId: string | null;
    menuOrder?: string[];
    menuOrderUpdatedAt?: FieldValue;
    createdAt: FieldValue;
    lastLogin: FieldValue;
}

export interface UserWithRole extends UserData {
    uid: string;
    allowedPages: string[];
    roleLevel: number;
}

export type AuthStateCallback = (user: UserWithRole | null) => void;

// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured =
    firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

// ==========================================
// Firebase Initialization
// ==========================================

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig as Record<string, string>);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization failed:', (error as Error).message);
    }
} else {
    console.warn(
        'Firebase not configured - running in offline mode. Set VITE_FIREBASE_* environment variables to enable.'
    );
}

// ==========================================
// Default Roles
// ==========================================

export const DEFAULT_ROLES: Record<string, RoleConfig> = {
    super_admin: {
        name: 'super_admin',
        level: 3,
        allowedPages: [
            'dashboard',
            'schedule',
            'projects',
            'quotations',
            'payments',
            'contracts',
            'profit',
            'cost-entries',
            'clients',
            'finance',
            'vendors',
            'inventory',
            'materials',
            'invoice',
            'unit',
            'cost',
            'calc',
            'user-management',
        ],
    },
    admin: {
        name: 'admin',
        level: 2,
        allowedPages: [
            'dashboard',
            'schedule',
            'projects',
            'quotations',
            'payments',
            'contracts',
            'profit',
            'cost-entries',
            'clients',
            'finance',
            'vendors',
            'inventory',
            'materials',
        ],
    },
    user: {
        name: 'user',
        level: 1,
        allowedPages: [
            'dashboard',
            'schedule',
            'projects',
            'quotations',
            'payments',
            'contracts',
            'profit',
            'cost-entries',
        ],
    },
};

// ==========================================
// Auth Functions
// ==========================================

export const signInWithGoogle = async (): Promise<UserWithRole> => {
    if (!auth || !googleProvider || !db) {
        console.warn('Firebase Auth not initialized');
        throw new Error('Firebase 未設定，請聯繫系統管理員');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
        const usersCollection = await getDocs(collection(db, 'users'));
        const isFirstUser = usersCollection.empty;
        const isSystemOwner = user.email === 'xiangteng007@gmail.com';

        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: isFirstUser || isSystemOwner ? 'super_admin' : 'user',
            googleId: user.uid,
            lineUserId: null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        });
    } else {
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp(),
        });
    }

    const userWithRole = await getUserWithRole(user.uid);
    if (!userWithRole) {
        throw new Error('Failed to get user with role');
    }
    return userWithRole;
};

export const signOut = async (): Promise<void> => {
    if (!auth) return;
    await firebaseSignOut(auth);
};

export const subscribeToAuthState = (callback: AuthStateCallback): Unsubscribe => {
    if (!auth) {
        callback(null);
        return () => { };
    }

    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            const userWithRole = await getUserWithRole(firebaseUser.uid);
            callback(userWithRole);
        } else {
            callback(null);
        }
    });
};

export const getUserWithRole = async (uid: string): Promise<UserWithRole | null> => {
    if (!db) return null;

    try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            return null;
        }

        const userData = userDoc.data() as UserData;
        const roleConfig = await getRoleConfig(userData.role);

        return {
            uid,
            ...userData,
            allowedPages: roleConfig?.allowedPages || DEFAULT_ROLES.user.allowedPages,
            roleLevel: roleConfig?.level || 1,
        };
    } catch (error) {
        console.error('Error getting user with role:', error);
        throw error;
    }
};

// ==========================================
// Role Functions
// ==========================================

export const getRoleConfig = async (roleName: string): Promise<RoleConfig | null> => {
    if (!db) return DEFAULT_ROLES[roleName] || DEFAULT_ROLES.user;

    try {
        const roleDoc = await getDoc(doc(db, 'roles', roleName));

        if (roleDoc.exists()) {
            return roleDoc.data() as RoleConfig;
        }

        return DEFAULT_ROLES[roleName] || DEFAULT_ROLES.user;
    } catch (error) {
        console.error('Error getting role config:', error);
        return DEFAULT_ROLES[roleName] || DEFAULT_ROLES.user;
    }
};

export const getAllRoles = async (): Promise<RoleConfig[]> => {
    if (!db) return Object.values(DEFAULT_ROLES);

    try {
        const rolesCollection = await getDocs(collection(db, 'roles'));

        if (rolesCollection.empty) {
            return Object.values(DEFAULT_ROLES);
        }

        return rolesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoleConfig));
    } catch (error) {
        console.error('Error getting all roles:', error);
        return Object.values(DEFAULT_ROLES);
    }
};

export const updateRoleConfig = async (
    roleName: string,
    roleData: Partial<RoleConfig>
): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    await setDoc(doc(db, 'roles', roleName), roleData, { merge: true });
};

// ==========================================
// User Management Functions
// ==========================================

export interface UserListItem {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: string;
    createdAt: FieldValue;
    lastLogin: FieldValue;
}

export const getAllUsers = async (): Promise<UserListItem[]> => {
    if (!db) throw new Error('Firestore not initialized');

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const usersCollection = await getDocs(usersQuery);

    return usersCollection.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
    })) as UserListItem[];
};

export const updateUserRole = async (uid: string, newRole: string): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', uid), { role: newRole });
};

export const deleteUser = async (uid: string): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    await deleteDoc(doc(db, 'users', uid));
};

// ==========================================
// Initialize Default Roles
// ==========================================

export const initializeDefaultRoles = async (): Promise<void> => {
    if (!db) return;

    try {
        for (const [roleName, roleConfig] of Object.entries(DEFAULT_ROLES)) {
            const roleDoc = await getDoc(doc(db, 'roles', roleName));
            if (!roleDoc.exists()) {
                await setDoc(doc(db, 'roles', roleName), roleConfig);
            } else {
                const existingData = roleDoc.data() as RoleConfig;
                const existingPages = existingData.allowedPages || [];
                const defaultPages = roleConfig.allowedPages || [];

                const newPages = defaultPages.filter(p => !existingPages.includes(p));

                if (newPages.length > 0) {
                    const mergedPages = [...existingPages, ...newPages];
                    await updateDoc(doc(db, 'roles', roleName), {
                        allowedPages: mergedPages,
                    });
                    console.log(`Updated ${roleName} with new pages:`, newPages);
                }
            }
        }
        console.log('Default roles initialized/updated');
    } catch (error) {
        console.error('Error initializing default roles:', error);
    }
};

// ==========================================
// User Preferences Functions
// ==========================================

export interface MenuOrderResult {
    success: boolean;
    error?: string;
}

export const saveUserMenuOrder = async (
    uid: string,
    menuOrder: string[]
): Promise<MenuOrderResult> => {
    if (!db) return { success: false, error: 'Firestore not initialized' };

    try {
        await updateDoc(doc(db, 'users', uid), {
            menuOrder: menuOrder,
            menuOrderUpdatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving menu order:', error);
        return { success: false, error: (error as Error).message };
    }
};

export const getUserMenuOrder = async (uid: string): Promise<string[] | null> => {
    if (!db) return null;

    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return (userDoc.data() as UserData).menuOrder || null;
        }
        return null;
    } catch (error) {
        console.error('Error getting menu order:', error);
        return null;
    }
};

// ==========================================
// Exports
// ==========================================

export { auth, db };
