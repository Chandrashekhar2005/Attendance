/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { students, attendance, selectedDate } = useApp();
  
  // Defensive check for selectedDate
  const safeDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const dateObj = parseISO(safeDate);

  const todayAttendance = attendance.filter(a => a.date === safeDate);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const notMarkedCount = students.length - todayAttendance.length;

  const attendanceRate = students.length > 0
    ? Math.round((presentCount / students.length) * 100)
    : 0;

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Present', value: presentCount, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Absent', value: absentCount, icon: XCircle, color: 'bg-rose-500' },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: TrendingUp, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Welcome back!</h2>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
          <Calendar size={14} className="mr-1" />
          <span>{format(dateObj, 'EEEE, MMMM do')}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm"
          >
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <section className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <h3 className="font-bold mb-4">Summary for {format(dateObj, 'MMM do')}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Attendance Marked</span>
            <span className="text-sm font-semibold">{todayAttendance.length} / {students.length}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${(todayAttendance.length / (students.length || 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-emerald-500 font-bold text-lg">{presentCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Present</p>
            </div>
            <div className="text-center">
              <p className="text-rose-500 font-bold text-lg">{absentCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 font-bold text-lg">{notMarkedCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </section>

      {students.length === 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl text-center">
          <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            No students added yet. Start by adding your first student!
          </p>
          <button
            onClick={() => window.location.href = '/students'}
            className="mt-3 text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Add Student
          </button>
        </div>
      )}
    </div>
  );
};
