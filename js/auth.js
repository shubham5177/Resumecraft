import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

export async function signUp(name, email, password) {
    try {
        console.log('Creating user with email:', email);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created, updating profile...');
        await updateProfile(cred.user, { displayName: name });
        console.log('Profile updated successfully');
        return cred.user;
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
}

export async function signIn(email, password) {
    try {
        console.log('Signing in user:', email);
        const cred = await signInWithEmailAndPassword(auth, email, password);
        console.log('Sign in successful');
        return cred.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

export async function logOut() {
    try {
        console.log('Logging out user');
        await signOut(auth);
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

export async function resetPassword(email) {
    try {
        console.log('Sending password reset email:', email);
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent');
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

export function onAuthChange(callback) {
    console.log('Setting up auth state listener');
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated:', user.email);
        } else {
            console.log('User logged out');
        }
        callback(user);
    });
}

export function getCurrentUser() {
    return auth.currentUser;
}