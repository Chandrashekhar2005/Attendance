/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  section: string;
  email?: string;
  phone?: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO format YYYY-MM-DD
  status: 'present' | 'absent';
  timestamp: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  photoUrl?: string;
}

export interface AppState {
  students: Student[];
  attendance: AttendanceRecord[];
  teacher: Teacher | null;
  isDarkMode: boolean;
  selectedDate: string; // ISO format YYYY-MM-DD
}
