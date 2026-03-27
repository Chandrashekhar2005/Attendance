/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { parseISO, format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Search, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Attendance: React.FC = () => {
  const { students, attendance, markAttendance, deleteAttendanceRecord, selectedDate, setSelectedDate } = useApp();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ studentId: string; name: string } | null>(null);

  // Defensive check for selectedDate
  const safeDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const dateObj = parseISO(safeDate);
  
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === safeDate);
    return record?.status;
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteAttendanceRecord(confirmDelete.studentId, safeDate);
      setConfirmDelete(null);
    }
  };

  const markedCount = students.filter(s => getStatus(s.id)).length;

  return (
    <div className="space-y-4">
      <header className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mark Attendance</h2>
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
            {markedCount} / {students.length}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
          <button
            onClick={() => handleDateChange(subDays(dateObj, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-bold">{format(dateObj, 'MMMM do, yyyy')}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              {format(dateObj, 'EEEE')}
            </p>
          </div>
          <button
            onClick={() => handleDateChange(addDays(dateObj, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </header>

      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No students to display</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const status = getStatus(student.id);
            return (
              <motion.div
                key={student.id}
                layout
                className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    status === 'present' ? 'bg-emerald-100 text-emerald-600' :
                    status === 'absent' ? 'bg-rose-100 text-rose-600' :
                    'bg-gray-100 text-gray-400 dark:bg-neutral-800'
                  }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{student.name}</h4>
                    <p className="text-[10px] text-gray-500">Roll: {student.rollNumber}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {status && (
                    <button
                      onClick={() => setConfirmDelete({ studentId: student.id, name: student.name })}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-neutral-800 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                      title="Clear attendance"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => markAttendance(student.id, safeDate, 'present')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      status === 'present'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                        : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'
                    }`}
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, safeDate, 'absent')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      status === 'absent'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none'
                        : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 hover:bg-rose-50 hover:text-rose-500'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 w-full max-w-xs rounded-3xl p-8 shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Clear Record?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to clear the attendance record for <span className="font-bold text-gray-700 dark:text-gray-300">{confirmDelete.name}</span> on {format(dateObj, 'MMM do')}?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
