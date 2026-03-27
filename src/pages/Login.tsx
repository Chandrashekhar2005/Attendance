/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, School, User, Mail, Lock, UserPlus, ArrowLeft, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const Login: React.FC = () => {
  const { teacher, setTeacher } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schoolName: '',
    password: '',
  });

  if (teacher) {
    return <Navigate to="/" replace />;
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(err.message || 'An error occurred while sending the reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
      if (teacherDoc.exists()) {
        setTeacher(teacherDoc.data() as any);
      } else {
        // If it's a new user via Google, we need their school name
        // For now, we'll use a placeholder and they can update it in settings
        const teacherData = {
          id: user.uid,
          name: user.displayName || 'Teacher',
          email: user.email || '',
          schoolName: 'My School', // Placeholder
          photoUrl: user.photoURL || undefined
        };
        await setDoc(doc(db, 'teachers', user.uid), teacherData);
        setTeacher(teacherData);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore this one as it usually means a second popup was opened
      } else {
        setError(err.message || 'An error occurred during Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        const teacherData = {
          id: user.uid,
          name: formData.name,
          email: formData.email,
          schoolName: formData.schoolName,
        };

        await setDoc(doc(db, 'teachers', user.uid), teacherData);
        setTeacher(teacherData);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
        if (teacherDoc.exists()) {
          setTeacher(teacherDoc.data() as any);
        } else {
          setError('Teacher profile not found.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is currently disabled in the Firebase Console. Please use Google Sign-In instead, or enable "Email/Password" in your Firebase Auth settings.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isRegistering ? (
              <UserPlus className="text-indigo-600 dark:text-indigo-400" size={32} />
            ) : (
              <LogIn className="text-indigo-600 dark:text-indigo-400" size={32} />
            )}
          </div>
          <h1 className="text-2xl font-bold">{isRegistering ? 'Create Account' : 'Teacher Login'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRegistering ? 'Join Attendly to manage your classes' : 'Manage your classroom with ease'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm mb-6 border border-rose-100 dark:border-rose-900/30">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm mb-6 border border-emerald-100 dark:border-emerald-900/30">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <Chrome size={20} className="text-indigo-600" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100 dark:border-neutral-800"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-gray-100 dark:border-neutral-800"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        required={isRegistering}
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">School Name</label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        required={isRegistering}
                        type="text"
                        value={formData.schoolName}
                        onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Attendly High School"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                  placeholder="teacher@school.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none mt-6 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Sign In')}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};
