/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format } from 'date-fns';
import { AppState, Student, AttendanceRecord, Teacher } from '../types';

const STORAGE_KEY = 'attendly_data';

const DEFAULT_STATE: AppState = {
  students: [],
  attendance: [],
  teacher: null,
  isDarkMode: false,
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
};

export const storage = {
  save: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    try {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_STATE, ...parsed };
    } catch (e) {
      console.error('Failed to load data', e);
      return DEFAULT_STATE;
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
