/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { parseISO, format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X, Search, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export const Attendance: React.FC = () => {
  const { students, attendance, markAttendance, selectedDate, setSelectedDate } = useApp();
  const [search, setSearch] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'year' | 'decade' | 'century'>('month');

  // Defensive check for selectedDate
  const safeDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
  let dateObj = parseISO(safeDate);
  
  // If date is invalid, fallback to today
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);
  
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === safeDate);
    return record?.status;
  };

  const handleDateChange = (newDate: Date) => {
    if (isNaN(newDate.getTime())) return;
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(dateObj);
    newDate.setFullYear(year);
    handleDateChange(newDate);
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

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-2 flex items-center justify-between">
            <button
              onClick={() => handleDateChange(subDays(dateObj, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex-1 text-center py-1 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors group"
            >
              <div className="flex items-center justify-center space-x-2">
                <CalendarIcon size={14} className="text-indigo-500" />
                <p className="font-bold">{format(dateObj, 'MMMM do, yyyy')}</p>
                <CalendarIcon size={14} className="text-indigo-500" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                {format(dateObj, 'EEEE')}
              </p>
            </button>

            <button
              onClick={() => handleDateChange(addDays(dateObj, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-100 dark:border-neutral-800 overflow-hidden"
              >
                <div className="p-4 flex flex-col items-center bg-gray-50/50 dark:bg-neutral-800/30 space-y-4">
                  <div className="flex items-center space-x-2 w-full max-w-md px-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year:</span>
                    <select
                      value={dateObj.getFullYear()}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                      className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg py-1 px-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <Calendar
                    onChange={(value) => {
                      if (value instanceof Date) {
                        handleDateChange(value);
                        setShowCalendar(false);
                      }
                    }}
                    view={calendarView}
                    onViewChange={({ view }) => setCalendarView(view as any)}
                    value={dateObj}
                    className="border-none rounded-xl shadow-inner bg-transparent w-full max-w-md"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
    </div>
  );
};
