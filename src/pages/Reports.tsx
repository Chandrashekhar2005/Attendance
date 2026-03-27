/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, Award } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Reports: React.FC = () => {
  const { students, attendance, teacher } = useApp();

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      const dayAttendance = attendance.filter(a => a.date === dStr);
      const present = dayAttendance.filter(a => a.status === 'present').length;
      return {
        name: format(day, 'd'),
        present: present,
      };
    }).filter(d => d.present > 0 || parseInt(d.name) <= now.getDate());
  }, [attendance]);

  const overallStats = useMemo(() => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    return [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Absent', value: absent, color: '#f43f5e' },
    ];
  }, [attendance]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'yyyy-MM-dd');

    doc.setFontSize(20);
    doc.text('Attendance Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`School: ${teacher?.schoolName || 'Attendly School'}`, 14, 30);
    doc.text(`Teacher: ${teacher?.name || 'N/A'}`, 14, 36);
    doc.text(`Date: ${today}`, 14, 42);

    const tableData = students.map(s => {
      const studentAttendance = attendance.filter(a => a.studentId === s.id);
      const present = studentAttendance.filter(a => a.status === 'present').length;
      const total = studentAttendance.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return [s.rollNumber, s.name, s.grade, s.section, `${percentage}%`];
    });

    autoTable(doc, {
      startY: 50,
      head: [['Roll No', 'Name', 'Grade', 'Section', 'Attendance %']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] as any },
    });

    doc.save(`Attendance_Report_${today}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <button
          onClick={exportPDF}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Download size={18} />
          <span className="text-sm font-semibold">Export PDF</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={20} className="text-indigo-500" />
          <h3 className="font-bold">Daily Attendance (This Month)</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#f5f5f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col items-center">
          <h3 className="font-bold mb-4 w-full">Overall Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {overallStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex space-x-6 mt-2">
            {overallStats.map(stat => (
              <div key={stat.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="text-xs font-medium text-gray-500">{stat.name}: {stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Award size={20} className="text-amber-500" />
            <h3 className="font-bold">Top Performers</h3>
          </div>
          <div className="space-y-4">
            {students.slice(0, 3).map((student, idx) => {
              const studentAttendance = attendance.filter(a => a.studentId === student.id);
              const present = studentAttendance.filter(a => a.status === 'present').length;
              const total = studentAttendance.length;
              const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

              return (
                <div key={student.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-gray-300">#{idx + 1}</div>
                    <div>
                      <p className="text-sm font-bold">{student.name}</p>
                      <p className="text-[10px] text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{percentage}%</p>
                    <p className="text-[10px] text-gray-500">Attendance</p>
                  </div>
                </div>
              );
            })}
            {students.length === 0 && <p className="text-center text-gray-500 text-sm">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
