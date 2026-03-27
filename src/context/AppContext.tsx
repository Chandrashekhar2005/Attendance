/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Student, AttendanceRecord, Teacher } from '../types';
import { storage } from '../services/storage';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  collection, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocFromServer,
  deleteField
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppContextType extends AppState {
  setTeacher: (teacher: Teacher | null) => void;
  updateTeacher: (updates: Partial<Teacher>) => void;
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (studentId: string, date: string, status: 'present' | 'absent') => void;
  deleteAttendanceRecord: (studentId: string, date: string) => void;
  toggleDarkMode: () => void;
  logout: () => void;
  setSelectedDate: (date: string) => void;
  deleteAttendanceByDate: (date: string) => void;
  isAuthReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(storage.load());
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If the loaded teacher ID doesn't match the current user, clear students/attendance
        if (state.teacher?.id !== user.uid) {
          setState(prev => ({ ...prev, students: [], attendance: [] }));
        }
        
        const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
        if (teacherDoc.exists()) {
          setState(prev => ({ ...prev, teacher: teacherDoc.data() as Teacher }));
        } else {
          // If profile doesn't exist for this user, clear teacher state
          setState(prev => ({ ...prev, teacher: null, students: [], attendance: [] }));
        }
      } else {
        setState(prev => ({ ...prev, teacher: null, students: [], attendance: [] }));
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only attach listeners if we have a teacher AND it matches the current auth user
    if (!state.teacher?.id || !auth.currentUser || state.teacher.id !== auth.currentUser.uid) return;

    const teacherId = state.teacher.id;

    const unsubStudents = onSnapshot(collection(db, 'teachers', teacherId, 'students'), (snapshot) => {
      const students = snapshot.docs.map(doc => doc.data() as Student);
      setState(prev => ({ ...prev, students }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `teachers/${teacherId}/students`));

    const unsubAttendance = onSnapshot(collection(db, 'teachers', teacherId, 'attendance'), (snapshot) => {
      const attendance = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
      setState(prev => ({ ...prev, attendance }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `teachers/${teacherId}/attendance`));

    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, [state.teacher?.id]);

  useEffect(() => {
    storage.save(state);
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode, state.selectedDate]);

  const setTeacher = (teacher: Teacher | null) => {
    setState(prev => ({ ...prev, teacher }));
  };

  const updateTeacher = async (updates: Partial<Teacher>) => {
    if (!state.teacher?.id) return;
    const path = `teachers/${state.teacher.id}`;
    
    const firestoreUpdates: any = { ...updates };
    if ('photoUrl' in updates && updates.photoUrl === undefined) {
      firestoreUpdates.photoUrl = deleteField();
    }

    try {
      await updateDoc(doc(db, 'teachers', state.teacher.id), firestoreUpdates);
      setState(prev => ({
        ...prev,
        teacher: prev.teacher ? { ...prev.teacher, ...updates } : null
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    if (!state.teacher?.id) return;
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const newStudent: Student = { ...studentData, id, createdAt };
    const path = `teachers/${state.teacher.id}/students/${id}`;
    
    try {
      await setDoc(doc(db, 'teachers', state.teacher.id, 'students', id), newStudent);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (!state.teacher?.id) return;
    const path = `teachers/${state.teacher.id}/students/${id}`;
    try {
      await updateDoc(doc(db, 'teachers', state.teacher.id, 'students', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteStudent = async (id: string) => {
    if (!state.teacher?.id) return;
    const path = `teachers/${state.teacher.id}/students/${id}`;
    try {
      await deleteDoc(doc(db, 'teachers', state.teacher.id, 'students', id));
      // Attendance records are not automatically deleted in this simple implementation
      // In a real app, you might want a cloud function or batch delete
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const markAttendance = async (studentId: string, date: string, status: 'present' | 'absent') => {
    if (!state.teacher?.id) return;
    const teacherId = state.teacher.id;
    
    const existing = state.attendance.find(a => a.studentId === studentId && a.date === date);
    const path = `teachers/${teacherId}/attendance`;

    try {
      if (existing) {
        if (existing.status !== status) {
          await updateDoc(doc(db, 'teachers', teacherId, 'attendance', existing.id), { status, timestamp: Date.now() });
        }
      } else {
        const id = crypto.randomUUID();
        const newRecord: AttendanceRecord = {
          id,
          studentId,
          date,
          status,
          timestamp: Date.now(),
        };
        await setDoc(doc(db, 'teachers', teacherId, 'attendance', id), newRecord);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteAttendanceRecord = async (studentId: string, date: string) => {
    if (!state.teacher?.id) return;
    const teacherId = state.teacher.id;
    const record = state.attendance.find(a => a.studentId === studentId && a.date === date);
    
    if (!record) return;

    try {
      await deleteDoc(doc(db, 'teachers', teacherId, 'attendance', record.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teachers/${teacherId}/attendance/${record.id}`);
    }
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const logout = async () => {
    await signOut(auth);
    setState(prev => ({ ...prev, teacher: null, students: [], attendance: [] }));
  };

  const setSelectedDate = (date: string) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const deleteAttendanceByDate = async (date: string) => {
    if (!state.teacher?.id) return;
    const teacherId = state.teacher.id;
    const recordsToDelete = state.attendance.filter(a => a.date === date);
    
    try {
      for (const record of recordsToDelete) {
        await deleteDoc(doc(db, 'teachers', teacherId, 'attendance', record.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teachers/${teacherId}/attendance`);
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setTeacher,
      updateTeacher,
      addStudent,
      updateStudent,
      deleteStudent,
      markAttendance,
      deleteAttendanceRecord,
      toggleDarkMode,
      logout,
      setSelectedDate,
      deleteAttendanceByDate,
      isAuthReady
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
